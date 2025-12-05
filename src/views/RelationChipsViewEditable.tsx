import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client/react';
import { 
    SubjectDetailPropsFragment,
    SearchInput,
    RelationshipRecordType,
    XtdRelationshipKindEnum,
    CreateRelationshipDocument,
    DeleteRelationshipDocument,
    FindItemDocument,
    FindRelationshipTypesDocument,
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
import CallMergeIcon from '@mui/icons-material/CallMerge';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';
import { getEntityType, ClassEntity } from '../domain';
import { T } from '@tolgee/react';
import FormSet, { FormSetTitle } from '../components/forms/FormSet';
import { ApolloCache } from '@apollo/client';
import { CatalogRecord } from '../types';
import useDebounce from '../hooks/useDebounce';

// Relation type colors
const RELATION_COLORS = {
    superClass: '#1565C0',
    subClass: '#42A5F5',
    part: '#2E7D32',
    partOf: '#66BB6A',
    other: '#FF9800',
};

export type RelationChipsViewEditableProps = {
    entry: SubjectDetailPropsFragment;
    onUpdate?: () => void;
};

type RelationData = {
    id: string;
    name: string;
    recordType: string;
    tags: Array<{ id: string; name: string }>;
    relationName?: string; // For other relations
};
type RelationCategory = 'superClass' | 'subClass' | 'part' | 'partOf' | 'other';

export default function RelationChipsViewEditable(props: RelationChipsViewEditableProps) {
    const { entry, onUpdate } = props;
    const navigate = useNavigate();
    
    // Edit states for each category
    const [editingCategory, setEditingCategory] = useState<RelationCategory | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [selectedItems, setSelectedItems] = useState<CatalogRecord[]>([]);
    
    // State for "other" relations
    const [selectedRelationType, setSelectedRelationType] = useState<string>('');
    const [relationTypeSearchValue, setRelationTypeSearchValue] = useState<string>('');
    
    // Debounce search value
    const debouncedSearchValue = useDebounce(searchValue, 300);
    const debouncedRelationTypeSearch = useDebounce(relationTypeSearchValue, 300);

    // Search query
    const [findItems, { data: searchData, loading: searchLoading }] = useLazyQuery(FindItemDocument);
    
    // Search query for relationship types
    const [searchRelationshipTypes, { data: relationshipTypesData, loading: relationshipTypesLoading }] = useLazyQuery(FindRelationshipTypesDocument);

    // Available relationship types from search
    const availableRelationshipTypes = useMemo(() => {
        return (relationshipTypesData?.findRelationshipTypes?.nodes ?? [])
            .map(node => node.name)
            .filter((name): name is string => !!name && name !== 'specializes' && name !== 'partOf');
    }, [relationshipTypesData]);

    // Trigger search for relationship types
    useEffect(() => {
        if (debouncedRelationTypeSearch.length >= 1) {
            searchRelationshipTypes({
                variables: {
                    input: {
                        query: debouncedRelationTypeSearch,
                        pageSize: 20
                    }
                }
            });
        }
    }, [debouncedRelationTypeSearch, searchRelationshipTypes]);

    // Trigger search when debounced value changes
    useEffect(() => {
        if (debouncedSearchValue.length >= 2) {
            const input: SearchInput = {
                entityTypeIn: [ClassEntity.recordType],
                tagged: ClassEntity.tags,
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
    const { superClasses, subClasses, parts, partOf, otherRelations } = useMemo(() => {
        const superClasses: RelationData[] = [];
        const subClasses: RelationData[] = [];
        const parts: RelationData[] = [];
        const partOf: RelationData[] = [];
        const others: RelationData[] = [];

        // ConnectedSubjects (outgoing: subClasses via specializes, partOf, others)
        (entry.connectedSubjects ?? []).forEach(rel => {
            const relationName = (rel as any).relationshipType?.name;
            if (!relationName) return;
            
            (rel.targetSubjects ?? []).forEach(target => {
                const data: RelationData = {
                    id: target.id,
                    name: target.name ?? 'Unknown',
                    recordType: (target as any).recordType,
                    tags: target.tags ?? [],
                    relationName: relationName,
                };
                
                if (relationName === 'specializes') {
                    subClasses.push(data);
                } else if (relationName === 'partOf') {
                    partOf.push(data);
                } else {
                    others.push(data);
                }
            });
        });

        // ConnectingSubjects (incoming: superClasses via specializes, parts via partOf)
        (entry.connectingSubjects ?? []).forEach(rel => {
            const relationName = (rel as any).relationshipType?.name;
            const connectingSubject = rel.connectingSubject;
            if (!relationName || !connectingSubject) return;
            
            const data: RelationData = {
                id: connectingSubject.id,
                name: connectingSubject.name ?? 'Unknown',
                recordType: (connectingSubject as any).recordType,
                tags: connectingSubject.tags ?? [],
                relationName: relationName,
            };
            
            if (relationName === 'specializes') {
                superClasses.push(data);
            } else if (relationName === 'partOf') {
                parts.push(data);
            }
            // Note: Other incoming relations could be added here if needed
        });

        return { superClasses, subClasses, parts, partOf, otherRelations: others };
    }, [entry]);

    // Get existing relationship ID for a category
    const getRelationshipId = useCallback((category: RelationCategory): string | undefined => {
        if (category === 'subClass' || category === 'partOf') {
            const relationName = category === 'subClass' ? 'specializes' : 'partOf';
            const rel = (entry.connectedSubjects ?? []).find(r => (r as any).relationshipType?.name === relationName);
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

        let relationName: string;
        if (editingCategory === 'other') {
            if (!selectedRelationType.trim()) return;
            relationName = selectedRelationType.trim();
        } else {
            relationName = (editingCategory === 'subClass' || editingCategory === 'superClass') 
                ? 'specializes' 
                : 'partOf';
        }

        // Create relationships for all selected items
        for (const selectedItem of selectedItems) {
            if (editingCategory === 'subClass' || editingCategory === 'partOf' || editingCategory === 'other') {
                // Outgoing relation: this class -> target
                await createRelationship({
                    variables: {
                        input: {
                            relationshipType: RelationshipRecordType.RelationshipToSubject,
                            fromId: entry.id,
                            toIds: [selectedItem.id],
                            properties: {
                                id: editingCategory !== 'other' ? getRelationshipId(editingCategory) : undefined,
                                relationshipToSubjectProperties: {
                                    relationshipType: XtdRelationshipKindEnum.XtdSchemaLevel,
                                    name: relationName
                                }
                            } as any
                        }
                    }
                });
            } else {
                // Incoming relation: target -> this class (superClass, part)
                await createRelationship({
                    variables: {
                        input: {
                            relationshipType: RelationshipRecordType.RelationshipToSubject,
                            fromId: selectedItem.id,
                            toIds: [entry.id],
                            properties: {
                                relationshipToSubjectProperties: {
                                    relationshipType: XtdRelationshipKindEnum.XtdSchemaLevel,
                                    name: relationName
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
        setSelectedRelationType('');
        setRelationTypeSearchValue('');
        onUpdate?.();
    };

    // Handle delete relationship
    const handleDelete = async (category: RelationCategory, targetId: string, relationNameOverride?: string) => {
        let relationName: string;
        if (category === 'other' && relationNameOverride) {
            relationName = relationNameOverride;
        } else {
            relationName = (category === 'subClass' || category === 'superClass') 
                ? 'specializes' 
                : 'partOf';
        }

        try {
            if (category === 'subClass' || category === 'partOf' || category === 'other') {
                // Outgoing relation (connectedSubjects): this class is fromId
                await deleteRelationship({
                    variables: {
                        input: {
                            relationshipType: RelationshipRecordType.RelationshipToSubject,
                            fromId: entry.id,
                            toId: targetId,
                            name: relationName
                        }
                    }
                });
            } else {
                // Incoming relation (connectingSubjects): this class is toId
                await deleteRelationship({
                    variables: {
                        input: {
                            relationshipType: RelationshipRecordType.RelationshipToSubject,
                            fromId: targetId,
                            toId: entry.id,
                            name: relationName
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
                            relations.map((rel) => (
                                <Chip
                                    key={rel.id}
                                    label={rel.name}
                                    size="small"
                                    onClick={() => handleChipClick(rel)}
                                    onDelete={() => handleDelete(category, rel.id)}
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
            case 'superClass': return <T keyName="class.add_superclass">Superklasse hinzufügen</T>;
            case 'subClass': return <T keyName="class.add_subclass">Subklasse hinzufügen</T>;
            case 'part': return <T keyName="class.add_part">Teil hinzufügen</T>;
            case 'partOf': return <T keyName="class.add_partof">Teil von hinzufügen</T>;
            case 'other': return <T keyName="class.add_other_relation">Andere Beziehungen hinzufügen</T>;
            default: return '';
        }
    };

    return (
        <FormSet>
            <FormSetTitle>
                <b><T keyName="class.relations">Klassenbeziehungen</T></b>
            </FormSetTitle>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {/* Superklassen */}
                {renderRelationCard(
                    'superClass',
                    <T keyName="class.superclasses">Superklassen</T>,
                    <ArrowUpwardIcon fontSize="small" />,
                    superClasses,
                    RELATION_COLORS.superClass,
                    'Diese Klasse spezialisiert diese Klassen' // T keyName would break Tooltip
                )}

                {/* Subklassen */}
                {renderRelationCard(
                    'subClass',
                    <T keyName="class.subclasses">Subklassen</T>,
                    <ArrowDownwardIcon fontSize="small" />,
                    subClasses,
                    RELATION_COLORS.subClass,
                    'Diese Klassen spezialisieren diese Klasse' // T keyName would break Tooltip
                )}

                {/* Hat Teile */}
                {renderRelationCard(
                    'part',
                    <T keyName="class.parts">Hat Teile</T>,
                    <CallSplitIcon fontSize="small" />,
                    parts,
                    RELATION_COLORS.part,
                    'Diese Klassen sind Teil von dieser Klasse' // T keyName would break Tooltip
                )}

                {/* Teil von */}
                {renderRelationCard(
                    'partOf',
                    <T keyName="class.partof">Teil von</T>,
                    <CallMergeIcon fontSize="small" />,
                    partOf,
                    RELATION_COLORS.partOf,
                    'Diese Klasse ist Teil von diesen Klassen' // T keyName would break Tooltip
                )}

                {/* Andere Relationen - Volle Breite */}
                <Box sx={{ width: '100%' }}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 1.5,
                            height: '100%',
                            borderLeft: `4px solid ${RELATION_COLORS.other}`,
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <Tooltip title="Weitere Beziehungen zu anderen Klassen">
                                <Box sx={{ color: RELATION_COLORS.other, display: 'flex', alignItems: 'center' }}>
                                    <LinkIcon fontSize="small" />
                                </Box>
                            </Tooltip>
                            <Typography variant="subtitle2" fontWeight={600}>
                                <T keyName="class.otherRelations">Andere Beziehungen</T>
                            </Typography>
                            <Chip 
                                label={otherRelations.length} 
                                size="small" 
                                sx={{ 
                                    height: 20, 
                                    fontSize: '0.7rem',
                                    backgroundColor: RELATION_COLORS.other,
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
                            maxHeight: 120,
                            overflowY: 'auto',
                            alignContent: 'flex-start',
                        }}>
                            {otherRelations.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    <T keyName="relation.none">Keine</T>
                                </Typography>
                            ) : (
                                otherRelations.map((rel) => (
                                    <Chip
                                        key={`${rel.relationName}-${rel.id}`}
                                        label={`${rel.relationName} → ${rel.name}`}
                                        size="small"
                                        onClick={() => handleChipClick(rel)}
                                        onDelete={() => handleDelete('other', rel.id, rel.relationName)}
                                        deleteIcon={
                                            <Tooltip title={<T keyName="dialog.remove">Entfernen</T>}>
                                                <DeleteIcon fontSize="small" />
                                            </Tooltip>
                                        }
                                        sx={{
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: RELATION_COLORS.other,
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
                                    onClick={() => setEditingCategory('other')}
                                    sx={{ 
                                        backgroundColor: `${RELATION_COLORS.other}20`,
                                        '&:hover': { backgroundColor: `${RELATION_COLORS.other}40` }
                                    }}
                                >
                                    <AddIcon fontSize="small" sx={{ color: RELATION_COLORS.other }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Paper>
                </Box>
            </Box>

            {/* Add Dialog */}
            <Dialog 
                open={editingCategory !== null} 
                onClose={() => {
                    setEditingCategory(null);
                    setSelectedItems([]);
                    setSearchValue('');
                    setSelectedRelationType('');
                    setRelationTypeSearchValue('');
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{getDialogTitle(editingCategory)}</DialogTitle>
                <DialogContent>
                    {/* Relation Type Selection - nur für "other" */}
                    {editingCategory === 'other' && (
                        <Autocomplete
                            freeSolo
                            sx={{ mt: 1, mb: 2 }}
                            options={availableRelationshipTypes}
                            loading={relationshipTypesLoading}
                            value={selectedRelationType}
                            onChange={(_, newValue) => {
                                setSelectedRelationType(newValue ?? '');
                            }}
                            inputValue={relationTypeSearchValue}
                            onInputChange={(_, newInputValue, reason) => {
                                if (reason === 'input') {
                                    setRelationTypeSearchValue(newInputValue);
                                    setSelectedRelationType(newInputValue);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={<T keyName="relation.type">Relationstyp</T>}
                                    placeholder="z.B. 'dependsOn', 'pointsTo'..."
                                    helperText={<T keyName="relation.type_helper">Wählen Sie einen bestehenden Relationstyp oder geben Sie einen neuen ein</T>}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {relationshipTypesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    )}
                    
                    {/* Zielklassen-Suche */}
                    <Autocomplete
                        multiple
                        sx={{ mt: editingCategory === 'other' ? 0 : 1 }}
                        options={searchOptions}
                        getOptionLabel={(option) => option.name ?? ''}
                        loading={searchLoading}
                        value={selectedItems}
                        onChange={(_, newValue) => {
                            setSelectedItems(newValue);
                            // Reset search after selection
                            setSearchValue('');
                        }}
                        inputValue={searchValue}
                        onInputChange={(_, newInputValue, reason) => {
                            // Only update search value on input, not on selection
                            if (reason === 'input') {
                                handleSearchInput(newInputValue);
                            } else if (reason === 'reset') {
                                // Clear search on reset (e.g., after selection)
                                setSearchValue('');
                            }
                        }}
                        filterOptions={(options) => {
                            // Filter out already selected items
                            return options.filter(opt => !selectedItems.some(sel => sel.id === opt.id));
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={<T keyName="search.search_classes">Zielklassen suchen</T>}
                                placeholder={selectedItems.length === 0 ? "Klassen suchen..." : "Weitere suchen..."}
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
                                <Typography>{option.name}</Typography>
                            </li>
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    {...getTagProps({ index })}
                                    key={option.id}
                                    label={option.name}
                                    size="small"
                                />
                            ))
                        }
                        noOptionsText={searchValue.length < 2 ? <T keyName="search.min_chars">Mindestens 2 Zeichen eingeben</T> : <T keyName="search.no_results">Keine Ergebnisse</T>}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setEditingCategory(null);
                        setSelectedItems([]);
                        setSearchValue('');
                        setSelectedRelationType('');
                        setRelationTypeSearchValue('');
                    }}>
                        <T keyName="dialog.cancel">Abbrechen</T>
                    </Button>
                    <Button 
                        onClick={handleCreate} 
                        variant="contained"
                        disabled={selectedItems.length === 0 || (editingCategory === 'other' && !selectedRelationType.trim())}
                    >
                        <T keyName="dialog.add">Hinzufügen</T>
                        {selectedItems.length > 0 && ` (${selectedItems.length})`}
                    </Button>
                </DialogActions>
            </Dialog>
        </FormSet>
    );
}
