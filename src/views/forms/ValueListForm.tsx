import { useQuery, useLazyQuery, useMutation } from "@apollo/client/react";
import {
    GetValueListEntryQuery,
    RelationshipRecordType,
    GetValueListEntryDocument,
    FindItemDocument,
    CreateRelationshipDocument,
    DeleteRelationshipDocument,
    SearchInput
} from "../../generated/graphql";
import { useDeleteEntry } from "../../hooks/useDeleteEntry";
import { Typography, Button, Box, Autocomplete, TextField, IconButton, Chip } from "@mui/material";
import { useSnackbar } from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DeleteIcon from '@mui/icons-material/Delete';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, { FormProps } from "./FormView";
import TransferListView from "../TransferListView";
import { ValueEntity, PropertyEntity, DocumentEntity, PropertyGroupEntity, ClassEntity, ValueListEntity, UnitEntity } from "../../domain";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { T } from "@tolgee/react";
import { FC, useState, useEffect } from "react";
import TransferListViewOrderedValues from "../TransferListViewOrderedValues";
import StatusFormSet from "../../components/forms/StatusFormSet";
import DefinitionFormSet from "../../components/forms/DefinitionFormSet";
import ExampleFormSet from "../../components/forms/ExampleFormSet";
import FormSet, { FormSetTitle } from "../../components/forms/FormSet";
import { useNavigate } from "react-router-dom";
import DictionaryFormSet from "../../components/forms/DictionaryFormSet";
import { ApolloCache } from "@apollo/client";
import useDebounce from "../../hooks/useDebounce";

const ValueListForm: FC<FormProps<GetValueListEntryQuery['node']>> = (props) => {
    const { id } = props;
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    // fetch value lists (including values)
    const { loading, error, data, refetch } = useQuery(GetValueListEntryDocument, {
        fetchPolicy: "network-only",
        variables: { id }
    });

    const [deleteEntry] = useDeleteEntry({
        cacheTypename: 'XtdValueList',
        id
    });

    // State for Unit selection
    const [unitSearchValue, setUnitSearchValue] = useState('');
    const debouncedUnitSearch = useDebounce(unitSearchValue, 300);

    // Search for units
    const [findUnits, { data: unitsData, loading: unitsLoading }] = useLazyQuery(FindItemDocument);

    // Mutations for Unit relationship
    const update = (cache: ApolloCache) => cache.modify({
        id: "ROOT_QUERY",
        fields: {
            hierarchy: (value: unknown, { DELETE }: { DELETE: unknown }) => DELETE
        }
    });
    const [createRelationship] = useMutation(CreateRelationshipDocument, { update });
    const [deleteRelationship] = useMutation(DeleteRelationshipDocument, { update });

    // Search for units when debounced search value changes
    useEffect(() => {
        if (debouncedUnitSearch && debouncedUnitSearch.length >= 2) {
            const searchInput: SearchInput = {
                entityTypeIn: [UnitEntity.recordType],
                tagged: UnitEntity.tags,
                query: debouncedUnitSearch
            };
            findUnits({
                variables: {
                    input: searchInput,
                    pageSize: 20,
                    pageNumber: 0
                }
            });
        }
    }, [debouncedUnitSearch, findUnits]);

    // Early returns after all hooks
    let entry = data?.node;
    const relatedValues = entry?.values?.nodes ?? [];

    if (loading) return <Typography><T keyName="valuelist.loading">Lade Werteliste..</T></Typography>;
    if (error || !entry) {
        console.error("ValueListForm Error:", error);
        console.log("ValueListForm Data:", data);
        return <Typography><T keyName="error.error">Es ist ein Fehler aufgetreten..</T></Typography>;
    }

    const availableUnits = (unitsData?.search?.nodes ?? []) as { id: string; name?: string | null; recordType: string; tags: { id: string }[] }[];

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="update.update_success">Update erfolgreich.</T>);
    };

    const handleOnDelete = async () => {
        await deleteEntry({ variables: { id } });
        enqueueSnackbar(<T keyName="valuelist.delete_success">Werteliste gelöscht.</T>);
        navigate(`/${ValueListEntity.path}`, { replace: true });
    };

    // Unit relationship handlers
    const handleAddUnit = async (unitId: string) => {
        if (!unitId) return;
        
        try {
            await createRelationship({
                variables: {
                    input: {
                        relationshipType: RelationshipRecordType.Unit,
                        fromId: id,
                        toIds: [unitId]
                    }
                }
            });
            await handleOnUpdate();
            setUnitSearchValue('');
        } catch (error) {
            console.error("Error creating unit relationship:", error);
            enqueueSnackbar("Fehler beim Hinzufügen der Maßeinheit", { variant: 'error' });
        }
    };

    const handleDeleteUnit = async () => {
        if (!entry.unit) return;
        
        try {
            await deleteRelationship({
                variables: {
                    input: {
                        relationshipType: RelationshipRecordType.Unit,
                        fromId: id,
                        toId: entry.unit.id
                    }
                }
            });
            await handleOnUpdate();
        } catch (error) {
            console.error("Error deleting unit relationship:", error);
            enqueueSnackbar("Fehler beim Löschen der Maßeinheit", { variant: 'error' });
        }
    };

    // const relatedValues = entry.values ?? [];
    // console.log(relatedValues);
    const values = [...relatedValues]
        .sort((a, b) => {
            const orderA = Number(a.order ?? 0);
            const orderB = Number(b.order ?? 0);
            return orderA - orderB;
        })
        .map(rel => ({
            order: rel.order,
            orderedValue: rel.orderedValue
        }));

    return (
        <FormView>
            <Box display="flex" gap={2}>
                <StatusFormSet
                    catalogEntryId={id}
                    status={entry.status}
                />
                <DictionaryFormSet
                    catalogEntryId={id}
                    dictionaryId={entry.dictionary?.id ?? ""}
                />
            </Box>

            <NameFormSet
                catalogEntryId={id}
                names={entry.names[0].texts}
                refetch={refetch}
            />

            <DescriptionFormSet
                catalogEntryId={id}
                descriptions={entry.descriptions?.[0]?.texts ?? []}
                refetch={refetch}
            />

            <CommentFormSet
                catalogEntryId={id}
                comments={entry.comments?.[0]?.texts ?? []}
                refetch={refetch}
            />

            <VersionFormSet
                id={id}
                majorVersion={entry.majorVersion}
                minorVersion={entry.minorVersion}
            />

            <DefinitionFormSet
                catalogEntryId={id}
                definitions={entry.definition?.texts ?? []}
                refetch={refetch}
            />

            <ExampleFormSet
                catalogEntryId={id}
                examples={entry.examples?.[0]?.texts ?? []}
                refetch={refetch}
            />

            <FormSet>
                <FormSetTitle>
                    <b>
                        <T keyName="document.more_infos" />
                    </b>
                </FormSetTitle>
                <Typography sx={{ mt: 2 }}>
                    <T keyName="create_entry_form.languageOfCreator"/>: {entry.languageOfCreator ? entry.languageOfCreator.code : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="valuelist.language_helper"/>: {entry.language ? entry.language.code : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="create_entry_form.countryOfOrigin"/>: {entry.countryOfOrigin ? entry.countryOfOrigin.name + " (" + entry.countryOfOrigin.code + ")" : "-"}
                </Typography>
            </FormSet>

            <FormSet>
                <FormSetTitle>
                    <b><T keyName="unit.title" /></b> <T keyName="valuelist.applicable_units"></T>
                </FormSetTitle>
                {entry.unit ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Chip
                            label={entry.unit.name || entry.unit.id}
                            onClick={() => navigate(`/${UnitEntity.path}/${entry.unit!.id}`)}
                            onDelete={handleDeleteUnit}
                            deleteIcon={
                                <IconButton size="small">
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            }
                            sx={{ cursor: 'pointer' }}
                        />
                    </Box>
                ) : (
                    <Autocomplete
                        sx={{ mt: 1 }}
                        options={availableUnits}
                        getOptionLabel={(option) => option.name || option.id}
                        loading={unitsLoading}
                        inputValue={unitSearchValue}
                        onInputChange={(_, newValue) => setUnitSearchValue(newValue)}
                        onChange={(_, newValue) => {
                            if (newValue) {
                                handleAddUnit(newValue.id);
                            }
                        }}
                        filterOptions={(x) => x}
                        noOptionsText={unitSearchValue.length < 2 ? "Mindestens 2 Zeichen eingeben" : "Keine Ergebnisse"}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={<T keyName="unit.select">Maßeinheit auswählen</T>}
                                placeholder="Suchen..."
                            />
                        )}
                    />
                )}
            </FormSet>

            <TransferListViewOrderedValues
                title={<span><b><T keyName="value.titlePlural" /></b><T keyName="valuelist.value_range"></T></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.Values}
                relationships={values}
                searchInput={{
                    entityTypeIn: [ValueEntity.recordType],
                    tagged: ValueEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />
            <TransferListView
                title={<span><b><T keyName="document.titlePlural" /></b><T keyName={"concept.reference_documents"} /></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.ReferenceDocuments}
                relationships={entry.referenceDocuments ?? []}
                searchInput={{
                    entityTypeIn: [DocumentEntity.recordType],
                    tagged: DocumentEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <TransferListView
                title={<span><b><T keyName={"concept.similar_concepts"} /></b></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.SimilarTo}
                relationships={entry.similarTo ?? []}
                searchInput={{
                    entityTypeIn: [DocumentEntity.recordType, PropertyEntity.recordType, ValueListEntity.recordType, UnitEntity.recordType, ClassEntity.recordType],
                    tagged: [
                        ...(DocumentEntity.tags ?? []),
                        ...(PropertyEntity.tags ?? []),
                        ...(ValueListEntity.tags ?? []),
                        ...(UnitEntity.tags ?? []),
                        ...(ClassEntity.tags ?? [])
                    ]
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="property.titlePlural" /></b>, <T keyName="valuelist.assigned_properties" /></span>}
                emptyMessage={<T keyName="valuelist.no_assigned_properties" />}
                relatingRecords={entry.properties ?? []}
            />

            <MetaFormSet entry={entry} />

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon />}
                onClick={handleOnDelete}
            >
                <T keyName="delete.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default ValueListForm;
