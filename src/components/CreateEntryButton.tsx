import React, {FC, useState} from "react";
import {SimpleRecordType, useCreateEntryMutation} from "../generated/types";
import {Dialog} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Popper from "@material-ui/core/Popper";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import AddIcon from '@material-ui/icons/Add';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import CreateEntryForm, {CreateEntryFormValues} from "./forms/CreateEntryForm";
import {Maybe} from "graphql/jsutils/Maybe";
import {useSnackbar} from "notistack";
import {
    ClassEntity,
    DocumentEntity,
    Entity,
    GroupEntity,
    MeasureEntity,
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
    MeasureEntity,
    UnitEntity,
    ValueEntity
];

type CreateEntryProps = {
    EntryType: Entity
}

const CreateEntryButton: FC<CreateEntryProps> = props => {

    const {enqueueSnackbar} = useSnackbar();

    const [create] = useCreateEntryMutation({
        update: cache => {
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    hierarchy: (value, {DELETE}) => DELETE
                }
            });
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    search: (value, {DELETE}) => DELETE
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
        versionId: "",
        versionDate: "",
        comment: ""
    };

    const onClick = (tag: Entity) => {
        setMenuOpen(false);
        setLastUsedOption(tag);
        setInput(tag);
        setDialogOpen(true);
    }

    const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }
        setMenuOpen(false);
    };

    const onSubmit = async ({id, versionId, versionDate, name, description, comment}: CreateEntryFormValues) => {
        const catalogRecordType = (input?.recordType! as unknown as SimpleRecordType);
        const names = [
            {languageTag: "de", value: name}
        ];
        const descriptions = description
            ? [{languageTag: "de", value: description}]
            : [];
        const comments = comment
            ? [{languageTag: "de", value: comment}]
            : [];
        const version = {versionId, versionDate};
        const properties = {
            id,
            version: version,
            names: names,
            descriptions,
            comments
        };
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
                    startIcon={<AddIcon/>}
                >
                    {lastUsedOption.title}
                </Button>

            <Popper open={menuOpen} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                {({TransitionProps, placement}) => (
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
                    />
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );

}

export default CreateEntryButton;