import { useQuery } from "@apollo/client/react";
import { UnitDetailPropsFragment, GetUnitEntryDocument } from "../../generated/graphql";
import { useDeleteEntry } from "../../hooks/useDeleteEntry";
import { Typography, Button, Box } from "@mui/material";
import { useSnackbar } from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, { FormProps } from "./FormView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { T } from "@tolgee/react";
import StatusFormSet from "../../components/forms/StatusFormSet";
import FormSet, { FormSetTitle } from "../../components/forms/FormSet";
import TransferListView from "../TransferListView";
import { PropertyEntity, DocumentEntity, PropertyGroupEntity, ClassEntity, ValueListEntity, UnitEntity } from "../../domain";
import { RelationshipRecordType } from "../../generated/graphql";
import DefinitionFormSet from "../../components/forms/DefinitionFormSet";
import ExampleFormSet from "../../components/forms/ExampleFormSet";
import { useNavigate } from "react-router-dom";

const UnitForm = (props: FormProps<UnitDetailPropsFragment>) => {
    const { id } = props;
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const UnitScale: Record<string, string> = {
        XTD_LINEAR: "Linear",
        XTD_LOGARITHMIC: "Logarithmic"
    };

    const UnitBase: Record<string, string> = {
        XTD_ONE: "1",
        XTD_TWO: "2",
        XTD_E: "e",
        XTD_PI: "Pi",
        XTD_TEN: "10"
    };

    // fetch units
    const { loading, error, data, refetch } = useQuery(GetUnitEntryDocument, {
        fetchPolicy: "network-only",
        variables: { id }
    });
    console.log("Unit Error", error);

    let entry = data?.node as UnitDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntry({
        cacheTypename: 'XtdUnit',
        id
    });

    if (loading) return <Typography><T keyName="unit.loading">Lade Maßeinheit..</T></Typography>;
    if (error || !entry) return <Typography><T keyName="error.error">Es ist ein Fehler aufgetreten..</T></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="update.update_success">Update erfolgreich.</T>);
    };

    const handleOnDelete = async () => {
        await deleteEntry({ variables: { id } });
        enqueueSnackbar(<T keyName="unit.delete_success">Maßeinheit gelöscht.</T>);
        navigate(`/${UnitEntity.path}`, { replace: true });
    };

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
                <Typography sx={{ mt: 1 }}>
                    <T keyName="unit.scale"/>: {entry.scale ? UnitScale[entry.scale] : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="unit.base"/>: {entry.base ? UnitBase[entry.base] : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="create_entry_form.languageOfCreator"/>: {entry.languageOfCreator ? entry.languageOfCreator.code : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="create_entry_form.countryOfOrigin"/>: {entry.countryOfOrigin ? entry.countryOfOrigin.name + " (" + entry.countryOfOrigin.code + ")" : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="unit.offset"/>: {entry.offset ? `${entry.offset.numerator} / ${entry.offset.denominator}` : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="unit.coefficient"/>: {entry.coefficient ? `${entry.coefficient.numerator} / ${entry.coefficient.denominator}` : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="unit.dimension"/>: {!entry.dimension && " -"}
                </Typography>
                {entry.dimension ? (
                    <Box sx={{ mt: 1 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th align="left">SI-Einheit</th>
                                    <th align="right">Exponent</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Länge (m)</td>
                                    <td align="right">{entry.dimension.lengthExponent ? `${entry.dimension.lengthExponent.numerator} / ${entry.dimension.lengthExponent.denominator}` : "-"}</td>
                                </tr>
                                <tr>
                                    <td>Masse (kg)</td>
                                    <td align="right">{entry.dimension.massExponent ? `${entry.dimension.massExponent.numerator} / ${entry.dimension.massExponent.denominator}` : "-"}</td>
                                </tr>
                                <tr>
                                    <td>Zeit (s)</td>
                                    <td align="right">{entry.dimension.timeExponent ? `${entry.dimension.timeExponent.numerator} / ${entry.dimension.timeExponent.denominator}` : "-"}</td>
                                </tr>
                                <tr>
                                    <td>Stromstärke (A)</td>
                                    <td align="right">{entry.dimension.electricCurrentExponent ? `${entry.dimension.electricCurrentExponent.numerator} / ${entry.dimension.electricCurrentExponent.denominator}` : "-"}</td>
                                </tr>
                                <tr>
                                    <td>Temperatur (K)</td>
                                    <td align="right">{entry.dimension.thermodynamicTemperatureExponent ? `${entry.dimension.thermodynamicTemperatureExponent.numerator} / ${entry.dimension.thermodynamicTemperatureExponent.denominator}` : "-"}</td>
                                </tr>
                                <tr>
                                    <td>Lichtstärke (cd)</td>
                                    <td align="right">{entry.dimension.luminousIntensityExponent ? `${entry.dimension.luminousIntensityExponent.numerator} / ${entry.dimension.luminousIntensityExponent.denominator}` : "-"}</td>
                                </tr>
                                <tr>
                                    <td>Stoffmenge (mol)</td>
                                    <td align="right">{entry.dimension.amountOfSubstanceExponent ? `${entry.dimension.amountOfSubstanceExponent.numerator} / ${entry.dimension.amountOfSubstanceExponent.denominator}` : "-"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </Box>
                ) : null}
            </FormSet>

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
                title={<span><b><T keyName="property.titlePlural"></T></b>, <T keyName="unit.assigned_to_properties"></T></span>}
                emptyMessage={<T keyName="unit.no_assigned_to_properties" />}
                relatingRecords={entry.properties ?? []}
            />
            <RelatingRecordsFormSet
                title={<span><b><T keyName="valuelist.titlePlural"></T></b>, <T keyName="unit.assigned_to_properties"></T></span>}
                emptyMessage={<T keyName="unit.no_assigned_to_valueLists" />}
                relatingRecords={entry.valueLists ?? []}
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

export default UnitForm;
