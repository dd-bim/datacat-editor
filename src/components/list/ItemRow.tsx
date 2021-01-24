import {ListChildComponentProps} from "react-window";
import {ListItem, ListItemSecondaryAction} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/AddBox";
import ClearIcon from "@material-ui/icons/Eject";
import React from "react";
import {ItemPropsFragment, SearchResultPropsFragment} from "../../generated/types";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import {getEntityType} from "../../domain";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {CatalogRecord} from "../../types";

export const ITEM_ROW_SIZE = 36;

export type RowProps = Pick<SearchResultPropsFragment, "id" | "name" | "description" | "tags">;

export type ItemRowProps = {
    items: RowProps[];
    disabledItems: string[];
    showRecordIcons: boolean;
    onSelect?(item: CatalogRecord): void;
    onAdd?(item: CatalogRecord): void;
    onRemove?(item: CatalogRecord): void;
};

const useStyle = makeStyles(theme => ({
    text: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    }
}));

export default function ItemRow(props: ListChildComponentProps) {
    const {
        data: {
            items,
            disabledItems,
            showRecordIcons,
            onSelect,
            onAdd,
            onRemove
        },
        index,
        style
    } = props;
    const classes = useStyle();

    const item = (items as ItemPropsFragment[])[index];

    const entityType = getEntityType(item.recordType, item.tags.map(t => t.id))!;
    const isDisabled = disabledItems.includes(item.id);
    const lastItem = index === items.length - 1;
    return (
        <div key={index} style={style}>
            <ListItem
                // @ts-ignore
                button={onSelect ? true : undefined}
                disabled={isDisabled}
                dense
                divider={!lastItem}
                onClick={onSelect ? () => onSelect(item) : undefined}
            >
                {showRecordIcons && (
                    <ListItemIcon>
                        <entityType.Icon/>
                    </ListItemIcon>
                )}
                <Tooltip title={item.description ?? ""} arrow>
                    <ListItemText
                        className={classes.text}
                        primary={item.name}
                        primaryTypographyProps={{
                            style: {fontStyle: item.description ? "italic" : undefined}
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
                            <AddIcon fontSize="small"/>
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
                            <ClearIcon fontSize="small"/>
                        </IconButton>
                    </ListItemSecondaryAction>
                )}
            </ListItem>
        </div>
    );
}
