import {
    PropertyDetailPropsFragment,
    RelationshipRecordType,
    useDeleteEntryMutation,
    useGetPropertyEntryQuery
} from "../../generated/types";
import { Typography, Box, Button } from "@mui/material";
import { useSnackbar } from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, { FormProps } from "./FormView";
import { PropertyEntity, DocumentEntity, PropertyGroupEntity, ClassEntity, ValueListEntity, UnitEntity } from "../../domain";
import TransferListView from "../TransferListView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { T } from "@tolgee/react";
import StatusFormSet from "../../components/forms/StatusFormSet";
import FormSet, { FormSetTitle } from "../../components/forms/FormSet";
import DefinitionFormSet from "../../components/forms/DefinitionFormSet";
import ExampleFormSet from "../../components/forms/ExampleFormSet";
import { useNavigate, Link } from "react-router-dom";
import DataTypeFormSet from "../../components/forms/DataTypeFormSet";
import DictionaryFormSet from "../../components/forms/DictionaryFormSet";
import React from "react";

const PropertyForm = (props: FormProps<PropertyDetailPropsFragment>) => {
    const { id } = props;
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const PropertyDataType: Record<string, string> = {
        XTD_BOOLEAN: "Boolean",
        XTD_DATE: "Date",
        XTD_DATETIME: "DateTime",
        XTD_INTEGER: "Integer",
        XTD_RATIONAL: "Rational",
        XTD_STRING: "String",
        XTD_REAL: "Real",
        XTD_COMPLEX: "Complex"
    };
    // fetch domain model
    const { loading, error, data, refetch } = useGetPropertyEntryQuery({
        fetchPolicy: "network-only",
        variables: { id }
    });
    console.log("Property Error", error);

    let entry = data?.node as PropertyDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: cache => {
            cache.evict({ id: `XtdProperty:${id}` });
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    hierarchy: (value, { DELETE }) => DELETE
                }
            });
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    search: (value, { DELETE }) => DELETE
                }
            });
        }
    });

    if (loading) return <Typography><T keyName="property.loading">Lade Merkmal..</T></Typography>;
    if (error || !entry) return <Typography><T keyName="error.error">Es ist ein Fehler aufgetreten..</T></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="update.update_success">Update erfolgreich.</T>);
    };

    const handleOnDelete = async () => {
        await deleteEntry({ variables: { id } });
        enqueueSnackbar(<T keyName="property.delete_success">Merkmal gelöscht.</T>);
        navigate(`/${PropertyEntity.path}`, { replace: true });
    };

    return (
        <FormView>
            <Box display="flex" gap={2}>
                <StatusFormSet
                    catalogEntryId={id}
                    status={entry.status}
                />
                <DataTypeFormSet
                    catalogEntryId={id}
                    dataType={entry.dataType}
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
                <Typography sx={{ mt: 1 }}>
                    Datenformat: {entry.dataFormat ? entry.dataFormat : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Sprache des Erstellers: {entry.languageOfCreator ? entry.languageOfCreator.code : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Herkunftsland: {entry.countryOfOrigin ? entry.countryOfOrigin.name + " (" + entry.countryOfOrigin.code + ")" : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Art der Menge: {!entry.quantityKinds && " -"}
                </Typography>
                {entry.quantityKinds && entry.quantityKinds.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th align="left">Einheiten</th>
                                    <th align="right">Dimension</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entry.quantityKinds.map((qk, idx) => (
                                    <tr key={qk.id ?? idx}>
                                        <td>
                                            {qk.units && qk.units.length > 0 ? (
                                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                                    {qk.units.map(unit => (
                                                        <li key={unit.id} style={{ listStyle: "none", padding: 0 }}>
                                                            <Link to={`/unit/${unit.id}`}>{unit.name}</Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : "-"}
                                        </td>
                                        <td align="right">
                                            {qk.dimension ? (
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
                                                                <td align="right">{qk.dimension.lengthExponent ? `${qk.dimension.lengthExponent.numerator} / ${qk.dimension.lengthExponent.denominator}` : "-"}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Masse (kg)</td>
                                                                <td align="right">{qk.dimension.massExponent ? `${qk.dimension.massExponent.numerator} / ${qk.dimension.massExponent.denominator}` : "-"}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Zeit (s)</td>
                                                                <td align="right">{qk.dimension.timeExponent ? `${qk.dimension.timeExponent.numerator} / ${qk.dimension.timeExponent.denominator}` : "-"}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Stromstärke (A)</td>
                                                                <td align="right">{qk.dimension.electricCurrentExponent ? `${qk.dimension.electricCurrentExponent.numerator} / ${qk.dimension.electricCurrentExponent.denominator}` : "-"}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Temperatur (K)</td>
                                                                <td align="right">{qk.dimension.thermodynamicTemperatureExponent ? `${qk.dimension.thermodynamicTemperatureExponent.numerator} / ${qk.dimension.thermodynamicTemperatureExponent.denominator}` : "-"}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Lichtstärke (cd)</td>
                                                                <td align="right">{qk.dimension.luminousIntensityExponent ? `${qk.dimension.luminousIntensityExponent.numerator} / ${qk.dimension.luminousIntensityExponent.denominator}` : "-"}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Stoffmenge (mol)</td>
                                                                <td align="right">{qk.dimension.amountOfSubstanceExponent ? `${qk.dimension.amountOfSubstanceExponent.numerator} / ${qk.dimension.amountOfSubstanceExponent.denominator}` : "-"}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </Box>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                )}
                <Typography sx={{ mt: 1 }}>
                    Intervall: {!entry.boundaryValues && " -"}
                </Typography>
                {entry.boundaryValues && entry.boundaryValues.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th align="left">Intervall</th>
                                    <th align="right">Wert</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entry.boundaryValues.map((bv, idx) => (
                                    <React.Fragment key={bv.id ?? idx}>
                                        <tr>
                                            <td>Minimum inklusive</td>
                                            <td align="right">{bv.minimumIncluded ? "Ja" : "Nein"}</td>
                                        </tr>
                                        <tr>
                                            <td>Maximum inklusive</td>
                                            <td align="right">{bv.maximumIncluded ? "Ja" : "Nein"}</td>
                                        </tr>
                                        <tr>
                                            <td>Minimum</td>
                                            <td align="right">
                                                {bv.minimum ? (
                                                    <Link to={`/valuelist/${bv.minimum.id}`}>
                                                        {bv.minimum.name}
                                                    </Link>
                                                ) : "-"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Maximum</td>
                                            <td align="right">
                                                {bv.maximum ? (
                                                    <Link to={`/valuelist/${bv.maximum.id}`}>
                                                        {bv.maximum.name}
                                                    </Link>
                                                ) : "-"}
                                            </td>
                                        </tr>
                                        {(entry.boundaryValues && entry.boundaryValues.length > 1) && (
                                            <tr>
                                                <td colSpan={2}>
                                                    <hr />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                )}
                <Typography sx={{ mt: 1 }}>
                    Dimension: {!entry.dimension && " -"}
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
                title={<span><b><T keyName="valuelist.titlePlural" /></b><T keyName="property.assigned_concepts" /></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.PossibleValues}
                relationships={entry.possibleValues ?? []}
                searchInput={{
                    entityTypeIn: [ValueListEntity.recordType]
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <TransferListView
                title={<span><b><T keyName="unit.titlePlural" /></b><T keyName="property.assigned_concepts" /></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.Units}
                relationships={entry.units ?? []}
                searchInput={{
                    entityTypeIn: [DocumentEntity.recordType],
                    tagged: UnitEntity.tags
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
                title={<span><b><T keyName="propertyGroup.titlePlural" /></b><T keyName="property.assigning_property_groups" /></span>}
                emptyMessage={<T keyName="property.no_assigning_property_groups" />}
                relatingRecords={entry.subjects ?? []}
                tagged="a27c8e3c-5fd1-47c9-806a-6ded070efae8"
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="class.titlePlural" /></b><T keyName="property.assigned_classes" /></span>}
                emptyMessage={<T keyName="property.no_assigned_classes" />}
                relatingRecords={entry.subjects ?? []}
                tagged="e9b2cd6d-76f7-4c55-96ab-12d084d21e96"
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

export default PropertyForm;
