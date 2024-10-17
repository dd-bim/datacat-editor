import FormSet, {FormSetDescription, FormSetTitle} from "../../components/forms/FormSet";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Checkbox,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Typography
} from "@material-ui/core";
import List from "@material-ui/core/List";
import {ValueIcon} from "../../domain";
import React from "react";
import {
    RelationshipRecordType,
    SubjectDetailPropsFragment,
    useCreateRelationshipMutation,
    useDeleteRelationshipMutation,
    useSetRelatedEntriesMutation
} from "../../generated/types";
import {ApolloCache} from "@apollo/client";

export type AssignsPropertyWithValuesFormsetProps = {
    subject: SubjectDetailPropsFragment;
    onChange?(): void;
}

export default function AssignsPropertyWithValuesFormset(props: AssignsPropertyWithValuesFormsetProps) {
    const {
        subject,
        onChange
    } = props;

    const update = (cache: ApolloCache<any>) => cache.modify({
        id: "ROOT_QUERY",
        fields: {
            hierarchy: (value, {DELETE}) => DELETE
        }
    });
    const [createRelationship] = useCreateRelationshipMutation({update});
    const [deleteRelationship] = useDeleteRelationshipMutation({update});
    const [setRelatedEntries] = useSetRelatedEntriesMutation({update});

    const handleOnCreate = async (relatedPropertyId: string, relatedValueIds: string[]) => {
        await createRelationship({
            variables: {
                input: {
                    relationshipType: RelationshipRecordType.AssignsPropertyWithValues,
                    fromId: subject.id,
                    toIds: [relatedPropertyId, ...relatedValueIds]
                }
            }
        });
        onChange?.();
    };

    const handleOnUpdate = async (relationshipId: string, relatedPropertyId: string, relatedValueIds: string[]) => {
        await setRelatedEntries({
            variables: {
                input: {
                    relationshipId,
                    toIds: [relatedPropertyId, ...relatedValueIds]
                }
            }
        });
        onChange?.();
    };

    const handleOnDelete = async (relationshipId: string) => {
        await deleteRelationship({
            variables: {
                input: {relationshipId}
            }
        });
        onChange?.();
    };

    return (
        <FormSet>
            <FormSetTitle><b>Abgeleitete Merkmale</b> der Klasse {subject.name}</FormSetTitle>
            {!subject.properties.length && (
                <FormSetDescription>Der Klasse sind keine Merkmale oder nichtleere Merkmalsgruppen
                    zugewiesen</FormSetDescription>
            )}
            {[...subject.properties]
                .sort((a, b) => (a.name ?? a.id).localeCompare(b.name ?? b.id))
                .map(property => {
                    // const assignment = subject?.assignedPropertiesWithValues.nodes.find(assignsPropertyWithValues => (
                    //     assignsPropertyWithValues.relatedProperty.id === property.id
                    // ));
                    // const restrictedValues = assignment?.relatedValues.map(x => x.id) ?? [];
                    // const unrestricted = !assignment;

                    const hasAssignedMeasures = property.assignedMeasures.nodes.length;
                    const summaryLabel = property.name;


                    return (
                        <Accordion key={property.id}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography>{summaryLabel}</Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                {!hasAssignedMeasures && (
                                    <FormSetDescription>Dem Merkmal ist keine Größe zugewiesen</FormSetDescription>
                                )}
                                {property.assignedMeasures.nodes.map(assignedMeasures => (
                                    <div key={assignedMeasures.id}>
                                        {assignedMeasures.relatedMeasures.map(measure => (
                                            <div key={measure.id}>
                                                <Typography variant={"body2"}>Größe <b>{measure.name}</b></Typography>
                                                {!measure.assignedValues.nodes.length && (
                                                    <ListItem key={measure.id} dense>Kein Wertebereich
                                                        festgelegt</ListItem>
                                                )}
                                                {measure.assignedValues.nodes.map(assignedValues => (
                                                    <List key={assignedValues.id} dense>
                                                        {assignedValues.relatedValues.map(value => {
                                                            const labelId = `checkbox-label-${value.id}`;
                                                            const label = value.name + (value.nominalValue ? ` (${value.nominalValue})` : "");
                                                            // const checked = restrictedValues.includes(value.id);

                                                            // const handleToggle = async () => {
                                                            //     if (unrestricted) {
                                                            //         await handleOnCreate(property.id, [value.id]);
                                                            //     } else {
                                                            //         const relatedValueIds = [...restrictedValues];
                                                            //         if (checked) {
                                                            //             const idx = relatedValueIds.indexOf(value.id);
                                                            //             relatedValueIds.splice(idx, 1);
                                                            //         } else {
                                                            //             relatedValueIds.push(value.id);
                                                            //         }
                                                            //         if (relatedValueIds.length) {
                                                            //             await handleOnUpdate(assignment!.id, property.id, relatedValueIds);
                                                            //         } else {
                                                            //             await handleOnDelete(assignment!.id);
                                                            //         }
                                                            //     }
                                                            // }

                                                            return (
                                                                <ListItem key={value.id} dense>
                                                                    <ListItemIcon>
                                                                        <ValueIcon/>
                                                                    </ListItemIcon>
                                                                    <ListItemText id={labelId}>{label}</ListItemText>
                                                                    <ListItemSecondaryAction>
                                                                        {/* <Checkbox
                                                                            edge="end"
                                                                            onChange={handleToggle}
                                                                            indeterminate={unrestricted}
                                                                            checked={checked}
                                                                            inputProps={{'aria-labelledby': labelId}}
                                                                        /> */}
                                                                    </ListItemSecondaryAction>
                                                                </ListItem>
                                                            );
                                                        })}
                                                    </List>
                                                ))}

                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
        </FormSet>
    );
}
