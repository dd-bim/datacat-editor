import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client/react';
import { 
    PropertyDetailPropsFragment,
    SearchInput,
    RelationshipRecordType,
    XtdPropertyRelationshipTypeEnum,
    CreateRelationshipDocument,
    DeleteRelationshipDocument,
    FindItemDocument,
    SearchResultPropsFragment
} from '../generated/graphql';
import { 
    Box, 
    Paper, 
    Typography, 
    Chip, 
    IconButton, 
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Autocomplete,
    TextField,
    CircularProgress
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/DeviceHub';
import { useNavigate } from 'react-router-dom';
import { getEntityType, PropertyEntity } from '../domain';
import { T, useTranslate } from '@tolgee/react';
import FormSet, { FormSetTitle } from '../components/forms/FormSet';
import { ApolloCache } from '@apollo/client';
import { CatalogRecord } from '../types';
import useDebounce from '../hooks/useDebounce';

// Relation type colors
const RELATION_COLORS = {
    superProperty: '#1565C0',      // Dark Blue
    subProperty: '#42A5F5',        // Light Blue
    dependsOn: '#FF9800',          // Orange
    dependedOnBy: '#FFB74D',       // Light Orange
};

export type PropertyRelationChipsViewEditableProps = {
    entry: PropertyDetailPropsFragment;
    onUpdate?: () => void;
};

type RelationData = {
    id: string;
    name: string;
    recordType: string;
    tags: Array<{ id: string; name: string }>;
};

type RelationCategory = 'superProperty' | 'subProperty' | 'dependsOn';

export default function PropertyRelationChipsViewEditable(props: PropertyRelationChipsViewEditableProps) {
    const { entry, onUpdate } = props;
    const navigate = useNavigate();
    const { t } = useTranslate();
    
    // Edit states for each category
    const [editingCategory, setEditingCategory] = useState<RelationCategory | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [selectedItems, setSelectedItems] = useState<CatalogRecord[]>([]);
    
    // Debounce search value
    const debouncedSearchValue = useDebounce(searchValue, 300);

    // Search query
    const [findItems, { data: searchData, loading: searchLoading }] = useLazyQuery(FindItemDocument);

    // Trigger search when debounced value changes
    useEffect(() => {
        if (debouncedSearchValue.length >= 2) {
            const input: SearchInput = {
                entityTypeIn: [PropertyEntity.recordType],
                tagged: PropertyEntity.tags,
                query: debouncedSearchValue
            };
            findItems({
                variables: {
                    input,
                    pageSize: 20,
                    pageNumber: 0
                }
            });
        }
    }, [debouncedSearchValue, findItems]);

    // Mutations
    const update = (cache: ApolloCache) => cache.modify({
        id: "ROOT_QUERY",
        fields: {
            hierarchy: (value: unknown, { DELETE }: { DELETE: unknown }) => DELETE
        }
    });
    const [createRelationship] = useMutation(CreateRelationshipDocument, { update });
    const [deleteRelationship] = useMutation(DeleteRelationshipDocument, { update });

    // Extract relations by type
    const { superProperties, subProperties, dependsOn } = useMemo(() => {
        const superProperties: RelationData[] = [];
        const subProperties: RelationData[] = [];
        const dependsOn: RelationData[] = [];

        // ConnectedProperties (outgoing: subProperties via Specializes, dependsOn via Depends)
        (entry.connectedProperties ?? []).forEach(rel => {
            const relationshipType = rel.relationshipType;
            if (!relationshipType) return;
            
            (rel.targetProperties ?? []).forEach(target => {
                const data: RelationData = {
                    id: target.id,
                    name: target.name ?? 'Unknown',
                    recordType: (target as any).recordType,
                    tags: target.tags ?? [],
                };
                
                if (relationshipType === XtdPropertyRelationshipTypeEnum.XtdSpecializes) {
                    subProperties.push(data);
                } else if (relationshipType === XtdPropertyRelationshipTypeEnum.XtdDepends) {
                    dependsOn.push(data);
                }
            });
        });

        // ConnectingProperties (incoming: superProperties via Specializes)
        (entry.connectingProperties ?? []).forEach(rel => {
            const relationshipType = rel.relationshipType;
            const connectingProperty = (rel as any).connectingProperty;
            if (!relationshipType || !connectingProperty) return;
            
            const data: RelationData = {
                id: connectingProperty.id,
                name: connectingProperty.name ?? 'Unknown',
                recordType: connectingProperty.recordType,
                tags: connectingProperty.tags ?? [],
            };
            
            if (relationshipType === XtdPropertyRelationshipTypeEnum.XtdSpecializes) {
                superProperties.push(data);
            }
        });

        return { superProperties, subProperties, dependsOn };
    }, [entry]);

    // Get existing relationship ID for a category
    const getRelationshipId = useCallback((category: RelationCategory): string | undefined => {
        if (category === 'subProperty' || category === 'dependsOn') {
            const relationshipType = category === 'subProperty' 
                ? XtdPropertyRelationshipTypeEnum.XtdSpecializes 
                : XtdPropertyRelationshipTypeEnum.XtdDepends;
            const rel = (entry.connectedProperties ?? []).find(r => r.relationshipType === relationshipType);
            return rel?.id;
        }
        return undefined;
    }, [entry]);

    // Handle search input change (actual search is triggered by useEffect with debounce)
    const handleSearchInput = useCallback((value: string) => {
        setSearchValue(value);
    }, []);

    // Handle create relationships for all selected items
    const handleCreate = async () => {
        if (selectedItems.length === 0 || !editingCategory) return;

        const relationshipType = (editingCategory === 'subProperty' || editingCategory === 'superProperty') 
            ? XtdPropertyRelationshipTypeEnum.XtdSpecializes 
            : XtdPropertyRelationshipTypeEnum.XtdDepends;

        // Create relationships for all selected items
        for (const selectedItem of selectedItems) {
            if (editingCategory === 'subProperty' || editingCategory === 'dependsOn') {
                // Outgoing relation: this property -> target
                await createRelationship({
                    variables: {
                        input: {
                            relationshipType: RelationshipRecordType.RelationshipToProperty,
                            fromId: entry.id,
                            toIds: [selectedItem.id],
                            properties: {
                                id: getRelationshipId(editingCategory),
                                relationshipToPropertyProperties: {
                                    relationshipType: relationshipType
                                }
                            } as any
                        }
                    }
                });
            } else {
                // Incoming relation: target -> this property (superProperty, dependedOnBy)
                await createRelationship({
                    variables: {
                        input: {
                            relationshipType: RelationshipRecordType.RelationshipToProperty,
                            fromId: selectedItem.id,
                            toIds: [entry.id],
                            properties: {
                                relationshipToPropertyProperties: {
                                    relationshipType: relationshipType
                                }
                            } as any
                        }
                    }
                });
            }
        }

        setEditingCategory(null);
        setSelectedItems([]);
        setSearchValue('');
        onUpdate?.();
    };

    // Handle delete relationship
    const handleDelete = async (category: RelationCategory, targetId: string) => {
        const relationshipType = (category === 'subProperty' || category === 'superProperty') 
            ? XtdPropertyRelationshipTypeEnum.XtdSpecializes 
            : XtdPropertyRelationshipTypeEnum.XtdDepends;

        try {
            if (category === 'subProperty' || category === 'dependsOn') {
                // Outgoing relation (connectedProperties): this property is fromId
                await deleteRelationship({
                    variables: {
                        input: {
                            relationshipType: RelationshipRecordType.RelationshipToProperty,
                            fromId: entry.id,
                            toId: targetId,
                        }
                    }
                });
            } else {
                // Incoming relation (connectingProperties): this property is toId
                await deleteRelationship({
                    variables: {
                        input: {
                            relationshipType: RelationshipRecordType.RelationshipToProperty,
                            fromId: targetId,
                            toId: entry.id,
                        }
                    }
                });
            }

            onUpdate?.();
        } catch (error) {
            console.error('Failed to delete relationship:', error);
        }
    };

    // Handle chip click for navigation
    const handleChipClick = useCallback((relation: RelationData) => {
        const definition = getEntityType(relation.recordType, relation.tags.map(t => t.id));
        navigate(`/${definition.path}/${relation.id}`);
    }, [navigate]);

    // Render a relation card
    const renderRelationCard = (
        category: RelationCategory,
        title: React.ReactNode,
        icon: React.ReactNode,
        relations: RelationData[],
        color: string,
        tooltipText: string
    ) => {
        return (
            <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 280 }}>
                <Paper 
                    variant="outlined" 
                    sx={{ 
                        p: 1.5, 
                        height: '100%',
                        borderLeft: `4px solid ${color}`,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Tooltip title={tooltipText}>
                            <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
                                {icon}
                            </Box>
                        </Tooltip>
                        <Typography variant="subtitle2" fontWeight={600}>
                            {title}
                        </Typography>
                        <Chip 
                            label={relations.length} 
                            size="small" 
                            sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                backgroundColor: color,
                                color: 'white',
                            }} 
                        />
                    </Box>
                    
                    <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 0.5, 
                        flex: 1, 
                        minHeight: 32,
                        maxHeight: 100,
                        overflowY: 'auto',
                        alignContent: 'flex-start',
                    }}>
                        {relations.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                <T keyName="relation.none">Keine</T>
                            </Typography>
                        ) : (
                            relations.map((relation) => (
                                <Chip
                                    key={relation.id}
                                    label={relation.name}
                                    size="small"
                                    onClick={() => handleChipClick(relation)}
                                    onDelete={() => handleDelete(category, relation.id)}
                                    deleteIcon={
                                        <Tooltip title="Entfernen">
                                            <DeleteIcon fontSize="small" />
                                        </Tooltip>
                                    }
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: color,
                                            color: 'white',
                                        },
                                    }}
                                />
                            ))
                        )}
                    </Box>

                    {/* Edit Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Tooltip title={<T keyName="dialog.add">Hinzufügen</T>}>
                            <IconButton 
                                size="small" 
                                onClick={() => setEditingCategory(category)}
                                sx={{ 
                                    backgroundColor: `${color}20`,
                                    '&:hover': { backgroundColor: `${color}40` }
                                }}
                            >
                                <AddIcon fontSize="small" sx={{ color }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Paper>
            </Box>
        );
    };

    // Convert search results to CatalogRecord format
    const searchOptions: CatalogRecord[] = (searchData?.search?.nodes ?? []).map((item: any) => ({
        id: item.id,
        recordType: item.recordType,
        name: typeof item.name === 'string' ? item.name : undefined,
        comment: 'comment' in item && typeof item.comment === 'string' ? item.comment : undefined,
        tags: item.tags ?? [],
    }));

    // Get title for dialog based on category
    const getDialogTitle = (category: RelationCategory | null): React.ReactNode => {
        switch (category) {
            case 'superProperty': return <T keyName="property.add_super_property">Übergeordnetes Merkmal hinzufügen</T>;
            case 'subProperty': return <T keyName="property.add_sub_property">Untergeordnetes Merkmal hinzufügen</T>;
            case 'dependsOn': return <T keyName="property.add_depends_on">Abhängigkeit hinzufügen</T>;
            default: return '';
        }
    };

    return (
        <FormSet>
            <FormSetTitle>
                <b><T keyName="property.relations">Merkmalbeziehungen</T></b>
            </FormSetTitle>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {/* Super Properties */}
                {renderRelationCard(
                    'superProperty',
                    <T keyName="property.super_properties">Übergeordnete Merkmale</T>,
                    <ArrowUpwardIcon />,
                    superProperties,
                    RELATION_COLORS.superProperty,
                    'Übergeordnetes Merkmal hinzufügen'
                )}

                {/* Sub Properties */}
                {renderRelationCard(
                    'subProperty',
                    <T keyName="property.sub_properties">Untergeordnete Merkmale</T>,
                    <ArrowDownwardIcon />,
                    subProperties,
                    RELATION_COLORS.subProperty,
                    'Untergeordnetes Merkmal hinzufügen'
                )}

                {/* Depends On */}
                {renderRelationCard(
                    'dependsOn',
                    <T keyName="property.depends_on">Hängt ab von</T>,
                    <LinkIcon />,
                    dependsOn,
                    RELATION_COLORS.dependsOn,
                    'Abhängigkeit hinzufügen'
                )}
            </Box>

            {/* Add Dialog */}
            <Dialog 
                open={editingCategory !== null} 
                onClose={() => {
                    setEditingCategory(null);
                    setSelectedItems([]);
                    setSearchValue('');
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{getDialogTitle(editingCategory)}</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        multiple
                        value={selectedItems}
                        onChange={(_, newValue) => setSelectedItems(newValue)}
                        inputValue={searchValue}
                        onInputChange={(_, newInputValue) => handleSearchInput(newInputValue)}
                        options={searchOptions}
                        getOptionLabel={(option) => option.name ?? option.id}
                        loading={searchLoading}
                        filterOptions={(x) => x}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={<T keyName="search.search_properties">Merkmale suchen</T>}
                                placeholder={t('search.start_typing', 'Beginnen Sie zu tippen...')}
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props} key={option.id}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography variant="body1">{option.name ?? option.id}</Typography>
                                    {option.comment && (
                                        <Typography variant="caption" color="text.secondary">
                                            {option.comment}
                                        </Typography>
                                    )}
                                </Box>
                            </li>
                        )}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => {
                            setEditingCategory(null);
                            setSelectedItems([]);
                            setSearchValue('');
                        }}
                    >
                        <T keyName="button.cancel">Abbrechen</T>
                    </Button>
                    <Button 
                        onClick={handleCreate} 
                        variant="contained" 
                        disabled={selectedItems.length === 0}
                    >
                        <T keyName="button.add">Hinzufügen</T>
                    </Button>
                </DialogActions>
            </Dialog>
        </FormSet>
    );
}
