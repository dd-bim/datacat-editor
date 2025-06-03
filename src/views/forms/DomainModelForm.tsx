import React from "react";
import {
    RelationshipRecordType,
    useDeleteEntryMutation,
    useGetSubjectEntryQuery,
    SubjectDetailPropsFragment
} from "../../generated/types";
import { Typography, Button } from "@mui/material";
import { useSnackbar } from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import { GroupEntity, PropertyEntity, DocumentEntity, PropertyGroupEntity, ClassEntity, ValueListEntity, UnitEntity } from "../../domain";
import FormView, { FormProps } from "./FormView";
import TransferListView from "../TransferListView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { T, useTranslate } from "@tolgee/react";
import StatusFormSet from "../../components/forms/StatusFormSet";
import DefinitionFormSet from "../../components/forms/DefinitionFormSet";
import ExampleFormSet from "../../components/forms/ExampleFormSet";
import FormSet, { FormSetTitle } from "../../components/forms/FormSet";


function DomainModelForm(props: FormProps<SubjectDetailPropsFragment>) {
    const { id, onDelete } = props;
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslate(); // Moved to top level

    // fetch domain model
    const { loading, error, data, refetch } = useGetSubjectEntryQuery({
        fetchPolicy: "network-only",
        variables: { id }
    });
    let entry = data?.node as SubjectDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: (cache: any) => {
            cache.evict({ id: `XtdSubject:${id}` });
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    hierarchy: (_value: any, { DELETE }: any) => DELETE,
                },
            });
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    search: (_value: any, { DELETE }: any) => DELETE,
                },
            });
        },
    });

    if (loading) return <Typography><T keyName={"model.loading"} /></Typography>;
    if (error || !entry) return <Typography><T keyName={"error.error"} /></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="domain_model_form.update_success">Update erfolgreich.</T>);
    }

    const handleOnDelete = async () => {
        await deleteEntry({ variables: { id } });
        enqueueSnackbar(<T keyName="domain_model_form.delete_success">Fachmodell gelöscht.</T>);
        onDelete?.();
    };

    // const collectsRelationships = entry.collects.nodes.map(({id, relatedThings}) => ({
    //     relationshipId: id,
    //     relatedItems: relatedThings
    // }));

    const relatedDocuments = entry.referenceDocuments ?? [];

    return (
        <FormView>
            <StatusFormSet
                catalogEntryId={id}
                status={entry.status}
            />

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
                    Sprache des Erstellers: {entry.languageOfCreator ? entry.languageOfCreator.code : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Herkunftsland: {entry.countryOfOrigin ? entry.countryOfOrigin.name + " (" + entry.countryOfOrigin.code + ")" : "-"}
                </Typography>S
            </FormSet>

            <TransferListView
                title={<span><T keyName={"domain_class_form.reference_documents"} /></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.ReferenceDocuments}
                relationships={relatedDocuments}
                searchInput={{
                    entityTypeIn: [DocumentEntity.recordType],
                    tagged: DocumentEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <TransferListView
                title={<span><T keyName={"domain_class_form.similar_concepts"} /></span>}
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
            {/* <TransferListView
                title={<Typography><T keyName={"model.TransferList"}/><b><T keyName={"model.TransferList2"}/></b></Typography>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.Collects}
                relationships={collectsRelationships}
                searchInput={{
                    entityTypeIn: [GroupEntity.recordType],
                    tagged: GroupEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            /> */}

            {/* <RelatingRecordsFormSet
                title={<Typography><b><T keyName="document.titlePlural"/></b>, <T keyName="domain_model_form.reference_documents">die dieses Fachmodell beschreiben</T></Typography>}
                emptyMessage={t('domain_model_form.no_reference_documents')}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            /> */}

            <MetaFormSet entry={entry} />

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon />}
                onClick={handleOnDelete}
            >
                <T keyName="domain_model_form.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default DomainModelForm;