/**
 * DomainClassForm - Formular für Domänenklassen
 * 
 * Zeigt die Relationen als kompakte Chips in Kacheln an.
 * Für die Legacy-Version mit TransferList-Ansichten siehe deprecated/DomainClassFormLegacy.tsx
 */

import { useQuery } from "@apollo/client/react";
import {
  XtdRelationshipKindEnum,
  RelationshipRecordType,
  SubjectDetailPropsFragment,
  GetSubjectEntryDocument,
} from "../../generated/graphql";
import { useDeleteEntry } from "../../hooks/useDeleteEntry";
import { Typography, Button, Box } from "@mui/material";
import { useSnackbar } from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import { PropertyEntity, DocumentEntity, PropertyGroupEntity, ClassEntity, ValueListEntity, UnitEntity } from "../../domain";
import FormView, { FormProps } from "./FormView";
import TransferListView from "../TransferListView";
import TransferListViewRelationshipToSubject from "../TransferListViewRelationshipToSubject";
import RelationGraphView from "../RelationGraphView";
import RelationChipsViewEditable from "../RelationChipsViewEditable";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { T } from "@tolgee/react";
import StatusFormSet from "../../components/forms/StatusFormSet";
import DefinitionFormSet from "../../components/forms/DefinitionFormSet";
import ExampleFormSet from "../../components/forms/ExampleFormSet";
import FormSet, { FormSetTitle } from "../../components/forms/FormSet";
import { useNavigate } from "react-router-dom";
import DictionaryFormSet from "../../components/forms/DictionaryFormSet";
import InferredPropertiesView from "../InferredPropertiesView";

export default function DomainClassForm(
  props: FormProps<SubjectDetailPropsFragment>
) {
  const { id } = props;
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // fetch subjects
  const { loading, error, data, refetch } = useQuery(GetSubjectEntryDocument, {
    fetchPolicy: "network-only",
    variables: { id },
  });

  let entry = data?.node as SubjectDetailPropsFragment | undefined;
  const [deleteEntry] = useDeleteEntry({
    cacheTypename: 'XtdSubject',
    id
  });

  if (loading)
    return (
      <Typography>
        <T keyName={"class.loading"} />
      </Typography>
    );
  if (error || !entry) {
    console.error("DomainClassForm Error:", error);
    console.log("DomainClassForm Data:", data);
    return (
      <Typography>
        <T keyName={"error.error"} />
      </Typography>
    );
  }

  const handleOnDelete = async () => {
    await deleteEntry({ variables: { id } });
    enqueueSnackbar(
      <T keyName="class.delete_success">Klasse gelöscht.</T>
    );
    navigate(`/${ClassEntity.path}`, { replace: true });
  };

  const handleOnUpdate = async () => {
    await refetch();
    enqueueSnackbar(
      <T keyName="update.update_success">Update erfolgreich.</T>
    );
  };

  const relatedRelations = entry.connectedSubjects ?? [];
  // Filter nur hasPropertyGroup Relationen
  const hasPropertyGroupRelation = relatedRelations.find(rel => 
    (rel as any).relationshipType?.name === "hasPropertyGroup"
  );
  const allTargetSubjects = hasPropertyGroupRelation?.targetSubjects ?? [];
  const relatedPropertyGroups = {
    relId: hasPropertyGroupRelation?.id ?? null,
    targetSubjects: allTargetSubjects,
    relationshipType: XtdRelationshipKindEnum.XtdInstanceLevel,
    name: "hasPropertyGroup"
  };

  const relatingRelations = entry.connectingSubjects ?? [];
  const allRelatingSubjects = relatingRelations
    .filter(rel => !rel.relationshipType?.name)
    .flatMap(rel => rel.connectingSubject ?? []);

  const relatedProperties = entry.properties ?? [];
  const relatedDocuments = entry.referenceDocuments ?? [];

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
          <T keyName="create_entry_form.countryOfOrigin"/>: {entry.countryOfOrigin ? entry.countryOfOrigin.name + " (" + entry.countryOfOrigin.code + ")" : "-"}
        </Typography>
      </FormSet>

      {/* Merkmalsgruppen */}

      <TransferListViewRelationshipToSubject
        title={<span><b><T keyName="propertyGroup.titlePlural" /></b><T keyName={"class.assigned_concepts"} /></span>}
        relatingItemId={id}
        relationshipType={RelationshipRecordType.RelationshipToSubject}
        relationships={relatedPropertyGroups}
        searchInput={{
          entityTypeIn: [PropertyGroupEntity.recordType],
          tagged: PropertyGroupEntity.tags
        }}
        onCreate={handleOnUpdate}
        onUpdate={handleOnUpdate}
        onDelete={handleOnUpdate}
      />

      <TransferListView
        title={<span><b><T keyName="property.titlePlural" /></b><T keyName={"class.assigned_concepts"} /></span>}
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

      {/* Abgeleitete Merkmale von Superklassen */}
      <InferredPropertiesView entry={entry} />

      <TransferListView
        title={<span><b><T keyName="document.titlePlural" /></b><T keyName={"concept.reference_documents"} /></span>}
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
        title={<span><b><T keyName="theme.titlePlural" /></b><T keyName="class.themes_using_class"></T></span>}
        emptyMessage={<T keyName="class.no_themes_using_class" />}
        relatingRecords={allRelatingSubjects}
      />

      {/* ==================== KOMPAKTE RELATIONS-ANSICHT ==================== */}

      {/* Kompakte editierbare Chip-Ansicht für Klassenbeziehungen */}
      <RelationChipsViewEditable entry={entry} onUpdate={handleOnUpdate} />

      {/* Relationsgraph - Visualisierung aller Relationen */}
      <RelationGraphView entry={entry} />
      
      {/* ==================== ENDE KOMPAKTE RELATIONS-ANSICHT ==================== */}
      
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
