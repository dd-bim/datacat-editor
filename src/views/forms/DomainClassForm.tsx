import React from "react";
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
import { PropertyEntity, PropertyGroupEntity } from "../../domain";
import FormView, { FormProps } from "./FormView";
import TransferListView from "../TransferListView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import AssignsPropertyWithValuesFormset from "./AssignsPropertyWithValuesFormset";
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
  let entry = data?.node as SubjectDetailPropsFragment | undefined;
  const [deleteEntry] = useDeleteEntryMutation({
    update: (cache) => {
      cache.evict({ id: `XtdSubject:${id}` });
      cache.modify({
        id: "ROOT_QUERY",
        fields: {
          hierarchy: (value, { DELETE }) => DELETE,
        },
      });
      cache.modify({
        id: "ROOT_QUERY",
        fields: {
          search: (value, { DELETE }) => DELETE,
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

  const assignsCollectionsRelationships = entry.assignedCollections.nodes.map(
    ({ id, relatedCollections }) => ({
      relationshipId: id,
      relatedItems: relatedCollections,
    })
  );

  const assignsPropertiesRelationships = entry.assignedProperties.nodes.map(
    ({ id, relatedProperties }) => ({
      relationshipId: id,
      relatedItems: relatedProperties,
    })
  );

  return (
    <FormView>
      <NameFormSet catalogEntryId={id} names={entry.names} />

      <DescriptionFormSet
        catalogEntryId={id}
        descriptions={entry.descriptions}
      />

      <CommentFormSet catalogEntryId={id} comments={entry.comments} />

      <VersionFormSet
        id={id}
        versionId={entry.versionId}
        versionDate={entry.versionDate}
      />

      <TransferListView
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
      />

      <TransferListView
        title={
          <span>
            {t('domain_class_form.assigned_properties', { name: entry.name })}
          </span>
        }
        relatingItemId={id}
        relationshipType={RelationshipRecordType.AssignsProperties}
        relationships={assignsPropertiesRelationships}
        searchInput={{
          entityTypeIn: [PropertyEntity.recordType],
          tagged: PropertyEntity.tags,
        }}
        onCreate={handleOnUpdate}
        onUpdate={handleOnUpdate}
        onDelete={handleOnUpdate}
      />

      <AssignsPropertyWithValuesFormset
        subject={entry}
        onChange={handleOnUpdate}
      />

      <RelatingRecordsFormSet
        title={
          <span>
            <b>
              <T keyName="document.titlePlural" />
            </b>
            ,{" "}
            <T keyName="domain_class_form.reference_documents">
              die diese Klasse beschreiben
            </T>
          </span>
        }
        emptyMessage={
            t('domain_class_form.no_reference_documents')
        }
        relatingRecords={
          entry?.documentedBy.nodes.map((node) => node.relatingDocument) ?? []
        }
      />

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
      />

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
