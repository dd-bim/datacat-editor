import React from "react";
import { TreeItem, TreeItemProps, treeItemClasses } from "@mui/x-tree-view";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { ItemPropsFragment } from "../generated/types";
import { getEntityType } from "../domain";

// Replace makeStyles with styled components
const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`&:hover > .${treeItemClasses.content}`]: {
    backgroundColor: theme.palette.action.hover,
  },
  [`&.${treeItemClasses.selected} > .${treeItemClasses.content}`]: {
    backgroundColor: theme.palette.primary.light,
  },
  [`& .${treeItemClasses.content}`]: {
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  [`& .${treeItemClasses.label}`]: {
    backgroundColor: "transparent !important",
    fontWeight: "inherit",
    color: "inherit",
  }
}));

const LabelRoot = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0.5),
  cursor: "pointer",
  width: "100%",
}));

const LabelIcon = styled('div')(({ theme }) => ({
  marginRight: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
}));

const LabelText = styled(Typography)({
  fontWeight: "inherit",
  flexGrow: 1,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

type StyleTreeItemProps = {
  itemId: string;
  data: ItemPropsFragment;
  children?: React.ReactNode;
  onSelect?: (item: ItemPropsFragment) => void;
};

export const StyledTreeItem = (props: StyleTreeItemProps & TreeItemProps) => {
  const { itemId, data, children, onSelect, ...other } = props;

  const recordTypeDefinition = getEntityType(data.recordType, data.tags.map(tag => tag.id))!;

  const handleOnLabelClick = (event: React.MouseEvent) => {
    const isExpandIconClick = (event.target as HTMLElement).closest(".MuiTreeItem-iconContainer");
  
    if (!isExpandIconClick && onSelect) {
      event.stopPropagation();
      onSelect(data);
    }
  };

  return (
    <StyledTreeItemRoot
      itemId={itemId}
      label={
        <LabelRoot onClick={handleOnLabelClick}>
          <LabelIcon>
            <recordTypeDefinition.Icon
              fontSize="small"
              color="inherit"
            />
          </LabelIcon>
          <Tooltip title={data.description ?? ""} arrow>
            <LabelText variant="body2">
              {data.name ?? `${data.id} (${data.__typename})`}
            </LabelText>
          </Tooltip>
        </LabelRoot>
      }
      {...other}
    >
      {React.Children.toArray(children)}
    </StyledTreeItemRoot>
  );
};
