import React, { useState } from "react";
import { CatalogRecordType, useCreateEntryMutation, useCreateRelationshipMutation, RelationshipRecordType } from "../generated/types";
import { Dialog } from "@mui/material";
import Button from "@mui/material/Button";
import Popper from "@mui/material/Popper";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import AddIcon from '@mui/icons-material/Add';
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import CreateEntryForm, { CreateEntryFormValues } from "./forms/CreateEntryForm";
import { Maybe } from "graphql/jsutils/Maybe";
import { useSnackbar } from "notistack";
import {
    ClassEntity,
    DocumentEntity,
    Entity,
    ThemeEntity,
    ValueListEntity,
    PropertyEntity,
    PropertyGroupEntity,
    UnitEntity,
    ValueEntity,
    DictionaryEntity
} from "../domain";
import { T } from "@tolgee/react";

const options = [
    DocumentEntity,
    ThemeEntity,
    ClassEntity,
    PropertyGroupEntity,
    PropertyEntity,
    ValueListEntity,
    UnitEntity,
    ValueEntity,
    DictionaryEntity
];

type CreateEntryProps = {
    EntryType: Entity
}

const CreateEntryButton = (props: CreateEntryProps) => {

    const { enqueueSnackbar } = useSnackbar();

    const [create] = useCreateEntryMutation({
        update: (cache, { data }) => {
            // Optimized cache updates - only invalidate specific fields
            const newEntry = data?.createCatalogEntry?.catalogEntry;
            if (newEntry) {
                // Instead of invalidating all, just evict specific cached queries
                cache.evict({ fieldName: 'search' });
                cache.evict({ fieldName: 'hierarchy' });
                cache.evict({ fieldName: 'findDictionaries' });
                cache.gc(); // Garbage collect to free memory
            }
        },
        errorPolicy: 'all' // Continue execution even if there are errors
    });
    const [createRelationship] = useCreateRelationshipMutation();

    const [lastUsedOption, setLastUsedOption] = React.useState(props.EntryType);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const [input, setInput] = React.useState<Maybe<Entity>>(null);

    const defaultValues: CreateEntryFormValues = {
        id: "",
        name: "",
        description: "",
        majorVersion: 1,
        minorVersion: 0,
        comment: "",
        languageOfCreator: "de",
        countryOfOrigin: "DE",
        languageTag: ["de"],
        uri: "",
        author: "",
        isbn: "",
        publisher: "",
        dateOfPublication: "",
        nominalValue: "",
        dataType: "XTD_STRING",
        dataFormat: "",
        scale: "XTD_LINEAR",
        base: "XTD_ONE",
        valueListLanguage: "de",
        dictionary: ""
    };

    const onClick = (tag: Entity) => {
        setMenuOpen(false);
        setLastUsedOption(tag);
        setInput(tag);
        setDialogOpen(true);
    }

    const handleClose = (event: MouseEvent | TouchEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }
        setMenuOpen(false);
    };

    const onSubmit = async (formValues: CreateEntryFormValues) => {
        // Dialog sofort schließen für bessere UX
        setDialogOpen(false);
        
        try {
            const catalogRecordType = (input?.recordType! as unknown as CatalogRecordType);
            const names = [
                { languageTag: "de", value: formValues.name }
            ];
            const properties: any = {
                id: formValues.id,
                names: names
            };
            if (input !== DictionaryEntity) {
                const descriptions = formValues.description
                    ? [{ languageTag: "de", value: formValues.description }]
                    : [];
                const comments = formValues.comment
                    ? [{ languageTag: "de", value: formValues.comment }]
                    : [];

                properties.descriptions = descriptions;
                properties.comments = comments;
                properties.majorVersion = Number(formValues.majorVersion);
                properties.minorVersion = Number(formValues.minorVersion);
            }

            if (input !== ValueEntity && input !== DictionaryEntity) {
                properties.languageOfCreator = formValues.languageOfCreator;
                properties.countryOfOrigin = formValues.countryOfOrigin;
            }

            if (input === DocumentEntity) {
                properties.externalDocumentProperties = {
                    languageTag: formValues.languageTag,
                    documentUri: formValues.uri,
                    author: formValues.author,
                    isbn: formValues.isbn,
                    publisher: formValues.publisher,
                    dateOfPublication: formValues.dateOfPublication
                };
            }
            else if (input === ValueEntity) {
                properties.valueProperties = {
                    nominalValue: formValues.nominalValue
                }
            }
            else if (input === PropertyEntity) {
                properties.propertyProperties = {
                    dataType: formValues.dataType,
                    dataFormat: formValues.dataFormat
                };
            }
            else if (input === UnitEntity) {
                properties.unitProperties = {
                    scale: formValues.scale,
                    base: formValues.base
                };
            }
            else if (input === ValueListEntity) {
                properties.valueListProperties = {
                    languageTag: formValues.valueListLanguage
                };
            }

            // Zeige sofort eine "wird erstellt" Nachricht
            enqueueSnackbar(`${input!.title} wird erstellt...`, { variant: 'info' });

            // Create entry
            const result = await create({
                variables: {
                    input: {
                        catalogEntryType: catalogRecordType,
                        properties: properties,
                        tags: input?.tags
                    }
                }
            });

            const newConceptId = result.data?.createCatalogEntry?.catalogEntry?.id;
            
            // Create relationship asynchronously if dictionary is specified
            if (formValues.dictionary && newConceptId) {
                // Relationship im Hintergrund erstellen, ohne darauf zu warten
                createRelationship({
                    variables: {
                        input: {
                            fromId: newConceptId,
                            toIds: [formValues.dictionary], 
                            relationshipType: RelationshipRecordType.Dictionary
                        }
                    }
                }).catch(error => {
                    console.error('Error creating relationship:', error);
                    enqueueSnackbar('Warnung: Dictionary-Zuordnung konnte nicht erstellt werden', { variant: 'warning' });
                });
            }

            // Erfolgs-Nachricht nach der Erstellung
            enqueueSnackbar(`${input!.title} erfolgreich erstellt!`, { variant: 'success' });
        } catch (error) {
            console.error('Error creating entry:', error);
            enqueueSnackbar('Fehler beim Erstellen des Eintrags', { variant: 'error' });
        }
    };

    return (
        <React.Fragment>
            <Button
                onClick={() => onClick(lastUsedOption)}
                startIcon={<AddIcon />}
            >
                {lastUsedOption.title}
            </Button>

            <Popper open={menuOpen} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="split-button-menu">
                                    {options.filter(entityType => entityType !== lastUsedOption).map(option => (
                                        <MenuItem key={option.path} onClick={() => onClick(option)}>
                                            {option.title}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle><T keyName="create_entry_split_button.create_entry" params={{ title: input?.title ?? "" }}/></DialogTitle>
                <DialogContent>
                    <CreateEntryForm
                        defaultValues={defaultValues}
                        onSubmit={onSubmit}
                        entityType={input!}
                    />
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );

}

export default CreateEntryButton;