import {
    SubjectDetailPropsFragment,
    RelationshipRecordType,
    RelationshipKindEnum,
    SearchInput,
    useCreateRelationshipMutation,
    useDeleteRelationshipMutation,
    useFindRelationshipTypesLazyQuery,
} from "../generated/types";
import { CatalogRecord } from "../types";
import React, { useMemo, useState } from "react";
import { 
    Typography, 
    List, 
    ListItem, 
    ListItemText, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    IconButton,
    Autocomplete,
    TextField,
    Box,
} from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import FormSet, { FormSetNotice, FormSetTitle } from "../components/forms/FormSet";
import { T } from "@tolgee/react";
import { useNavigate } from "react-router-dom";
import { getEntityType } from "../domain";
import { ApolloCache } from "@apollo/client";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import TransferList from "../components/list/TransferList";

export type OtherRelationsViewProps = {
    relatingItemId: string;
    connectedSubjects: SubjectDetailPropsFragment['connectedSubjects'];
    searchInput: SearchInput;
    onCreate?(): void;
    onDelete?(): void;
};

const ButtonRow = styled('div')(({ theme }) => ({
    display: "flex",
    justifyContent: "end",
    marginTop: theme.spacing(1)
}));

export default function OtherRelationsView(props: OtherRelationsViewProps) {
    const {
        relatingItemId,
        connectedSubjects,
        searchInput,
        onCreate,
        onDelete,
    } = props;

    const navigate = useNavigate();
    const [editState, setEditState] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [newRelationTypeName, setNewRelationTypeName] = useState("");
    const [selectedTargets, setSelectedTargets] = useState<CatalogRecord[]>([]);

    const update = (cache: ApolloCache) => cache.modify({
        id: "ROOT_QUERY",
        fields: {
            hierarchy: (value: any, { DELETE }: any) => DELETE
        }
    });
    
    const [createRelationship] = useCreateRelationshipMutation({ update });
    const [deleteRelationship] = useDeleteRelationshipMutation({ update });

    // Lazy query for searching existing relationship types
    const [searchRelationshipTypes, { data: relationshipTypesData, loading: relationshipTypesLoading }] = useFindRelationshipTypesLazyQuery();

    // Extract available relationship types from query result
    const availableRelationshipTypes = useMemo(() => {
        return (relationshipTypesData?.findRelationshipTypes?.nodes ?? [])
            .map(node => node.name)
            .filter((name): name is string => !!name);
    }, [relationshipTypesData]);

    // Debounced search for relationship types
    const handleRelationTypeInputChange = (inputValue: string) => {
        setNewRelationTypeName(inputValue);
        if (inputValue.trim().length >= 1) {
            searchRelationshipTypes({
                variables: {
                    input: {
                        query: inputValue.trim(),
                        pageSize: 10
                    }
                }
            });
        }
    };

    // Filter out "specializes" and "partOf" relationships
    const otherRelationships = useMemo(() => {
        const relations: Array<{
            relationshipName: string;
            targetName: string;
            targetId: string;
            targetRecordType: string;
            targetTags: Array<{ id: string; name: string }>;
            relationshipId: string;
        }> = [];

        (connectedSubjects ?? []).forEach(rel => {
            const relationshipName = rel.relationshipType?.name;
            
            // Skip specializes and partOf relationships
            if (relationshipName === "specializes" || relationshipName === "partOf") {
                return;
            }

            // Add all target subjects
            (rel.targetSubjects ?? []).forEach(target => {
                relations.push({
                    relationshipName: relationshipName ?? "Unknown",
                    targetName: target.name ?? "Unknown",
                    targetId: target.id,
                    targetRecordType: target.recordType,
                    targetTags: target.tags ?? [],
                    relationshipId: rel.id
                });
            });
        });

        return relations;
    }, [connectedSubjects]);

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewRelationTypeName("");
        setSelectedTargets([]);
    };

    const handleCreateRelationship = async (relationshipTypeName: string) => {
        if (!relationshipTypeName.trim() || !relatingItemId || selectedTargets.length === 0) return;

        try {
            // Create relationship with the specified type name
            await createRelationship({
                variables: {
                    input: {
                        relationshipType: RelationshipRecordType.RelationshipToSubject,
                        fromId: relatingItemId,
                        toIds: selectedTargets.map(t => t.id),
                        properties: {
                            relationshipToSubjectProperties: {
                                relationshipType: RelationshipKindEnum.XTD_SCHEMA_LEVEL,
                                name: relationshipTypeName.trim()
                            } as any // Backend supports 'name' field - run npm run codegen to update types
                        }
                    }
                }
            });

            handleCloseDialog();
            onCreate?.();
        } catch (error) {
            console.error("Error creating relationship:", error);
        }
    };

    const handleDeleteRelationship = async (relationshipName: string, targetId: string) => {
        try {
            await deleteRelationship({
                variables: {
                    input: {
                        relationshipType: RelationshipRecordType.RelationshipToSubject,
                        fromId: relatingItemId,
                        toId: targetId,
                        name: relationshipName
                    }
                }
            });
            onDelete?.();
        } catch (error) {
            console.error("Error deleting relationship:", error);
        }
    };

    if (otherRelationships.length === 0 && !editState) {
        return (
            <FormSet>
                <FormSetTitle>
                    <b><T keyName="class.other_relations">Weitere Relationen</T></b>
                </FormSetTitle>
                <FormSetNotice>
                    <T keyName="class.no_other_relations">Keine weiteren Relationen vorhanden.</T>
                </FormSetNotice>
                <ButtonRow>
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setEditState(true)}
                        startIcon={<EditIcon />}
                    >
                        <T keyName="transfer_list.edit">Bearbeiten</T>
                    </Button>
                </ButtonRow>
            </FormSet>
        );
    }

    return (
        <FormSet>
            <FormSetTitle>
                <b><T keyName="class.other_relations">Weitere Relationen</T></b>
            </FormSetTitle>
            {otherRelationships.length > 0 && (
                <List dense sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {otherRelationships.map((relation, index) => (
                        <ListItem 
                            key={index}
                            onClick={() => {
                                if (!editState) {
                                    const definition = getEntityType(relation.targetRecordType, relation.targetTags.map(x => x.id));
                                    navigate(`/${definition.path}/${relation.targetId}`);
                                }
                            }}
                            sx={{ 
                                cursor: editState ? 'default' : 'pointer', 
                                '&:hover': editState ? {} : { backgroundColor: 'action.hover' },
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                py: 0.5,
                            }}
                            secondaryAction={
                                editState ? (
                                    <IconButton 
                                        edge="end" 
                                        onClick={() => handleDeleteRelationship(relation.relationshipName, relation.targetId)}
                                        size="small"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                ) : undefined
                            }
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ArrowRightAltIcon fontSize="small" color="action" />
                                <Typography variant="body2" component="span" sx={{ fontWeight: 500 }}>
                                    {relation.relationshipName}
                                </Typography>
                                <ArrowRightAltIcon fontSize="small" color="action" />
                                <Typography variant="body2" component="span">
                                    {relation.targetName}
                                </Typography>
                            </Box>
                        </ListItem>
                    ))}
                </List>
            )}
            {editState && (
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                    sx={{ mt: 1 }}
                >
                    <T keyName="class.add_relation">Neue Relation hinzufügen</T>
                </Button>
            )}
            <ButtonRow>
                {editState ? (
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setEditState(false)}
                        startIcon={<CheckIcon />}
                    >
                        <T keyName="transfer_list.close">Schließen</T>
                    </Button>
                ) : (
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setEditState(true)}
                        startIcon={<EditIcon />}
                    >
                        <T keyName="transfer_list.edit">Bearbeiten</T>
                    </Button>
                )}
            </ButtonRow>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    <T keyName="class.add_relation">Neue Relation hinzufügen</T>
                </DialogTitle>
                <DialogContent>
                    <Autocomplete
                        freeSolo
                        options={availableRelationshipTypes}
                        value={newRelationTypeName}
                        loading={relationshipTypesLoading}
                        onChange={(_, newValue) => setNewRelationTypeName(newValue || "")}
                        onInputChange={(_, newInputValue) => handleRelationTypeInputChange(newInputValue)}
                        filterOptions={(x) => x}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                autoFocus
                                margin="dense"
                                label={<T keyName="class.relation_type_name">Relationstyp (Name)</T>}
                                fullWidth
                                variant="outlined"
                                helperText={<T keyName="class.relation_type_helper">Tippen Sie, um bestehende Relationstypen zu suchen oder geben Sie einen neuen Namen ein</T>}
                            />
                        )}
                        sx={{ mb: 2, mt: 1 }}
                    />
                    
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                        <T keyName="class.select_target">Zielklasse auswählen</T>
                    </Typography>
                    <TransferList
                        enabled={true}
                        searchInput={searchInput}
                        items={selectedTargets}
                        onAdd={async (item) => {
                            if (!selectedTargets.find(t => t.id === item.id)) {
                                setSelectedTargets([...selectedTargets, item]);
                            }
                        }}
                        onRemove={async (item) => {
                            setSelectedTargets(selectedTargets.filter(t => t.id !== item.id));
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        <T keyName="general.cancel">Abbrechen</T>
                    </Button>
                    <Button 
                        onClick={() => handleCreateRelationship(newRelationTypeName)} 
                        disabled={!newRelationTypeName.trim() || selectedTargets.length === 0}
                        variant="contained"
                    >
                        <T keyName="general.create">Erstellen</T> ({selectedTargets.length})
                    </Button>
                </DialogActions>
            </Dialog>
        </FormSet>
    );
}
