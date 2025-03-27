import { ListChildComponentProps } from "react-window";
import {
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddBox";
import ClearIcon from "@mui/icons-material/Eject";
import React from "react";
import { getEntityType } from "../../domain";
import makeStyles from "@mui/styles/makeStyles";
import { CatalogRecord } from "../../types";

export const ITEM_ROW_SIZE = 36;

export type ItemRowProps = {
  items: CatalogRecord[];
  disabledItems: string[];
  showRecordIcons: boolean;
  onSelect?(item: CatalogRecord): void;
  onAdd?(item: CatalogRecord): void;
  onRemove?(item: CatalogRecord): void;
};

const useStyle = makeStyles((theme) => ({
  text: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}));

export default function ItemRow(props: ListChildComponentProps) {
  const {
    data: { items, disabledItems, showRecordIcons, onSelect, onAdd, onRemove },
    index,
    style,
  } = props;
  const classes = useStyle();

  const item = (items as CatalogRecord[])[index];

  const entityType = getEntityType(
    item.recordType,
    item.tags.map((t) => t.id)
  );
  const isDisabled = disabledItems.includes(item.id);
  const lastItem = index === items.length - 1;
  return (
    <div key={index} style={style}>
      <ListItem
        component="li"
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
        dense
        divider={!lastItem}
        onClick={!isDisabled && onSelect ? () => onSelect(item) : undefined}
        style={{
          cursor: isDisabled ? "default" : "pointer",
          pointerEvents: isDisabled ? "none" : "auto",
          opacity: isDisabled ? 0.5 : 1,
          backgroundColor: isDisabled ? "transparent" : undefined, // Kein Hover für disabled Items
          transition: "background-color 0.2s ease-in-out", // Sanfte Farbübergänge
        }}
        sx={{
          "&:hover": {
            backgroundColor: isDisabled ? "transparent" : "#f0f0f0", // Helle Hervorhebung beim Hover
          },
        }}
      >
        {showRecordIcons && (
          <ListItemIcon>
            <entityType.Icon />
          </ListItemIcon>
        )}
        <Tooltip title={item.description ?? ""} arrow>
          <ListItemText
            className={classes.text}
            primary={item.name}
            primaryTypographyProps={{
              style: { fontStyle: item.description ? "italic" : undefined },
            }}
          />
        </Tooltip>
        {!isDisabled && onAdd && (
          <ListItemSecondaryAction>
            <IconButton
              size="small"
              edge="end"
              aria-label="Hinzufügen"
              onClick={() => onAdd(item)}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </ListItemSecondaryAction>
        )}
        {!isDisabled && onRemove && (
          <ListItemSecondaryAction>
            <IconButton
              size="small"
              edge="end"
              aria-label="Entfernen"
              onClick={() => onRemove(item)}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    </div>
  );
}
