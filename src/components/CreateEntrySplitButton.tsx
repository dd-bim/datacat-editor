import React, { FC, useState } from "react";
import { SimpleRecordType, useCreateEntryMutation } from "../generated/types";
import { ButtonGroup, ButtonGroupProps, Dialog } from "@mui/material";
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Popper from "@mui/material/Popper";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import AddIcon from "@mui/icons-material/Add";
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
  MeasureEntity,
  ModelEntity,
  PropertyEntity,
  PropertyGroupEntity,
  UnitEntity,
  ValueEntity,
} from "../domain";
import { T } from "@tolgee/react";

type CreateEntrySplitButtonProps = {
  ButtonGroupProps?: ButtonGroupProps;
};

const options = [
  DocumentEntity,
  ModelEntity,
  GroupEntity,
  ClassEntity,
  PropertyGroupEntity,
  PropertyEntity,
  MeasureEntity,
  UnitEntity,
  ValueEntity,
];

const CreateEntrySplitButton: FC<CreateEntrySplitButtonProps> = (props) => {
  const { ButtonGroupProps } = props;

  const { enqueueSnackbar } = useSnackbar();

  const [create] = useCreateEntryMutation({
    update: (cache) => {
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

  const [lastUsedOption, setLastUsedOption] = React.useState(ClassEntity);
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
    comment: "",
  };

  const onClick = (tag: Entity) => {
    setMenuOpen(false);
    setLastUsedOption(tag);
    setInput(tag);
    setDialogOpen(true);
  };

  const handleToggle = () => {
    setMenuOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setMenuOpen(false);
  };

  const onSubmit = async ({ id, versionId, versionDate, name, description, comment }: CreateEntryFormValues) => {
    const catalogRecordType = input?.recordType! as unknown as SimpleRecordType;
    const names = [{ languageTag: "de", value: name }];
    const descriptions = description ? [{ languageTag: "de", value: description }] : [];
    const comments = comment ? [{ languageTag: "de", value: comment }] : [];
    const version = { versionId, versionDate };
    const properties = {
      id,
      version: version,
      names: names,
      descriptions,
      comments,
    };
    await create({
      variables: {
        input: {
          catalogEntryType: catalogRecordType,
          properties: properties,
          tags: input?.tags,
        },
      },
    });

    setDialogOpen(false);
    enqueueSnackbar(<T keyName="create_entry_split_button.create_entry" params={{ title: input!.title }} />);
  };

  return (
    <React.Fragment>
      <ButtonGroup
        variant="outlined"
        color="inherit"
        {...ButtonGroupProps}
        ref={anchorRef}
        aria-label="Eintrag hinzufügen"
      >
        <Button onClick={() => onClick(lastUsedOption)} startIcon={<AddIcon />}>
          {lastUsedOption.title}
        </Button>
        <Button
          color="inherit"
          aria-controls={menuOpen ? "split-button-menu" : undefined}
          aria-expanded={menuOpen ? "true" : undefined}
          aria-label="Zeige weitere Optionen"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>

      <Popper open={menuOpen} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                  {options.filter((entityType) => entityType !== lastUsedOption).map((option) => (
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
        <DialogTitle>
          <T keyName="create_entry_split_button.create_entry" params={{ title: input?.title ?? "" }}>
            {`${input?.title ?? ""} erstellen...`}
          </T>
        </DialogTitle>
        <DialogContent>
          <CreateEntryForm defaultValues={defaultValues} onSubmit={onSubmit} />
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default CreateEntrySplitButton;
