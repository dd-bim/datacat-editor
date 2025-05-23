import React, { useState } from "react";
import { CatalogRecordType, useCreateEntryMutation } from "../generated/types";
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
    GroupEntity,
    ValueListEntity,
    ModelEntity,
    PropertyEntity,
    PropertyGroupEntity,
    UnitEntity,
    ValueEntity,
} from "../domain";

const options = [
    DocumentEntity,
    ModelEntity,
    GroupEntity,
    ClassEntity,
    PropertyGroupEntity,
    PropertyEntity,
    ValueListEntity,
    UnitEntity,
    ValueEntity
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
        languageTag: "de"
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
        const descriptions = formValues.description
            ? [{ languageTag: "de", value: formValues.description }]
            : [];
        const comments = formValues.comment
            ? [{ languageTag: "de", value: formValues.comment }]
            : [];
        const properties: any = {
            id: formValues.id,
            majorVersion: Number(formValues.majorVersion),
            minorVersion: Number(formValues.minorVersion),
            names: names,
            descriptions,
            comments
        };

        if (input === DocumentEntity && formValues.languageTag) {
            properties.externalDocumentProperties = {
                languageTag: [formValues.languageTag],
            };
        }

        await create({
            variables: {
                input: {
                    catalogEntryType: catalogRecordType,
                    properties: properties,
                    tags: input?.tags
                }
            }
        });

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
                <DialogTitle>{input?.title} erstellen...</DialogTitle>
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