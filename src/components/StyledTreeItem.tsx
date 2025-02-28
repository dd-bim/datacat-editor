import React, { FC } from "react";
import { TreeItem, TreeItemProps } from "@mui/x-tree-view";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";
import { ItemPropsFragment } from "../generated/types";
import { getEntityType } from "../domain";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: theme.palette.text.secondary,
    "&:hover > $content": {
      backgroundColor: theme.palette.action.hover,
    },
    "&$selected > $content": {
      backgroundColor: theme.palette.primary.light,
    },
  },
  content: {
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  expanded: {},
  selected: {},
  label: {
    backgroundColor: "transparent !important",
    fontWeight: "inherit",
    color: "inherit",
  },
  labelRoot: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0.5),
    cursor: "pointer",
    width: "100%",
  },
  labelIcon: {
    marginRight: theme.spacing(1),
  },
  labelText: {
    fontWeight: "inherit",
    flexGrow: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  labelInfo: {
    "& > *": {
      marginLeft: theme.spacing(1),
    },
  },
}));

type StyleTreeItemProps = {
  itemId: string;
  data: ItemPropsFragment;
  children?: React.ReactNode;
  onSelect?: (item: ItemPropsFragment) => void;
};

export const StyledTreeItem: FC<StyleTreeItemProps & TreeItemProps> = (props) => {
  const classes = useStyles();
  const { itemId, data, children, onSelect, ...other } = props;

  const recordTypeDefinition = getEntityType(data.recordType, data.tags.map(tag => tag.id))!;

  const handleOnLabelClick = (event: React.MouseEvent) => {
    const isExpandIconClick = (event.target as HTMLElement).closest(".MuiTreeItem-iconContainer");
  
    if (!isExpandIconClick && onSelect) {
      event.stopPropagation();
      onSelect(data); // ✅ Speichert das Element für die Anzeige rechts
    }
  };

  return (
    <TreeItem
      itemId={itemId}
      label={
        <div className={classes.labelRoot} onClick={handleOnLabelClick}>
          <recordTypeDefinition.Icon
            className={classes.labelIcon}
            fontSize="small"
            color="inherit"
          />
          <Tooltip title={data.description ?? ""} arrow>
            <Typography variant="body2" className={classes.labelText}>
              {data.name ?? `${data.id} (${data.__typename})`}
            </Typography>
          </Tooltip>
        </div>
      }
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        selected: classes.selected,
        label: classes.label,
      }}
      {...other}
    >
      {React.Children.toArray(children)}
    </TreeItem>
  );
};
