import {
  RelationshipRecordType,
  SubjectDetailPropsFragment,
  useDeleteEntryMutation,
  useGetSubjectEntryQuery,
} from "../../generated/types";
import { Typography, Button } from "@mui/material";
import { useSnackbar } from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import { PropertyEntity, DocumentEntity ,PropertyGroupEntity } from "../../domain";
import FormView, { FormProps } from "./FormView";
import TransferListView from "../TransferListView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { T, useTranslate } from "@tolgee/react";

export default function DomainClassForm(
  props: FormProps<SubjectDetailPropsFragment>
) {
  const { id, onDelete } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate(); // Moved to top level

  // fetch domain model
  const { loading, error, data, refetch } = useGetSubjectEntryQuery({
    fetchPolicy: "network-only",
    variables: { id },
  });
  console.log("DomainClassForm error", error);

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

  if (loading)
    return (
      <Typography>
        <T keyName={"class.loading"} />
      </Typography>
    );
  if (error || !entry)
    return (
      <Typography>
        <T keyName={"error.error"} />
      </Typography>
    );

  const handleOnDelete = async () => {
    await deleteEntry({ variables: { id } });
    enqueueSnackbar(
      <T keyName="domain_class_form.delete_success">Klasse gelöscht.</T>
    );
    onDelete?.();
  };

  const handleOnUpdate = async () => {
    await refetch();
    enqueueSnackbar(
      <T keyName="domain_class_form.update_success">Update erfolgreich.</T>
    );
  };

  // const assignsCollectionsRelationships = entry.assignedCollections.nodes.map(
  //   ({ id, relatedCollections }) => ({
  //     relationshipId: id,
  //     relatedItems: relatedCollections,
  //   })
  // );

  console.log("entry", entry);
  const relatedProperties = entry.properties ?? [];
  const relatedDocuments = entry.referenceDocuments ?? [];

  const descriptions = entry.descriptions?.[0]?.texts ?? [];
  const comments = entry.comments?.[0]?.texts ?? [];

  return (
    <FormView>
      <NameFormSet
        catalogEntryId={id}
        names={entry.names[0].texts}
      />

      <DescriptionFormSet
        catalogEntryId={id}
        descriptions={descriptions}
      />

      <CommentFormSet
        catalogEntryId={id}
        comments={comments}
      />

      <VersionFormSet
        id={id}
        majorVersion={entry.majorVersion}
        minorVersion={entry.minorVersion}
      />

      {/* Merkmalsgruppen */}

      {/* <TransferListView
        title={
          <span>
            <T keyName={"class.TransferList"} />
            <b>{entry?.name}</b>
            <T keyName={"class.TransferList2"} />
            <b>
              <T keyName={"class.TransferList3"} />
            </b>
          </span>
        }
        relatingItemId={id}
        relationshipType={RelationshipRecordType.AssignsCollections}
        relationships={assignsCollectionsRelationships}
        searchInput={{
          entityTypeIn: [PropertyGroupEntity.recordType],
          tagged: PropertyGroupEntity.tags,
        }}
        onCreate={handleOnUpdate}
        onUpdate={handleOnUpdate}
        onDelete={handleOnUpdate}
      /> */}

      <TransferListView
        title={
          <span>
            {t('domain_class_form.assigned_properties', { name: entry.name })}
          </span>
        }
        relatingItemId={id}
        relationshipType={RelationshipRecordType.Properties}
        relationships={relatedProperties}
        searchInput={{
          entityTypeIn: [PropertyEntity.recordType],
          tagged: PropertyEntity.tags,
        }}
        onCreate={handleOnUpdate}
        onUpdate={handleOnUpdate}
        onDelete={handleOnUpdate}
      />

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

      {/* 
      <RelatingRecordsFormSet
        title={
          <span>
            <b>
              <T keyName="group.titlePlural" />
            </b>
            ,{" "}
            <T keyName="domain_class_form.groups_using_class">
              die diese Klasse anwenden
            </T>
          </span>
        }
        emptyMessage={
            t('domain_class_form.no_groups_using_class')
        }
        relatingRecords={
          entry?.collectedBy.nodes.map((node) => node.relatingCollection) ?? []
        }
      /> */}

      <MetaFormSet entry={entry} />

      <Button
        variant="contained"
        color="primary"
        startIcon={<DeleteForeverIcon />}
        onClick={handleOnDelete}
      >
        <T keyName="domain_class_form.delete_button">Löschen</T>
      </Button>
    </FormView>
  );
}
