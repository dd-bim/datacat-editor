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
        update: cache => {
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    hierarchy: (value, { DELETE }) => DELETE,
                    search: (value, { DELETE }) => DELETE
                }
            });
        }
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


        const result = await create({
            variables: {
                input: {
                    catalogEntryType: catalogRecordType,
                    properties: properties,
                    tags: input?.tags
                }
            },
            refetchQueries: ["FindDictionariesQuery", "FindItemsQuery"]
        });

        const newConceptId = result.data?.createCatalogEntry?.catalogEntry?.id;
        if (formValues.dictionary && newConceptId) {
            await createRelationship({
                variables: {
                    input: {
                        fromId: newConceptId,
                        toIds: [formValues.dictionary], 
                        relationshipType: RelationshipRecordType.Dictionary
                    }
                }
            });
        }

        setDialogOpen(false);
        enqueueSnackbar(`${input!.title} erstellt.`);

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