import { styled } from "@mui/material/styles";
import React, { FC, useState } from "react";
import useHierarchy from "../hooks/useHierarchy";
import useLocalStorage from "../hooks/useLocalStorage";
import { SimpleTreeView } from "@mui/x-tree-view";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { StyledTreeItem } from "./StyledTreeItem";
import { ItemPropsFragment } from "../generated/types";

// Replace makeStyles with styled component
const StyledTreeView = styled(SimpleTreeView)({
  flexGrow: 1,
});

type HierarchyProps = {
  leaves: ItemPropsFragment[];
  paths: string[][];
  onSelect(selection: ItemPropsFragment): void;
};

export const Hierarchy: FC<HierarchyProps> = (props) => {
  const { leaves, paths, onSelect } = props;
  const { nodes, lookupMap } = useHierarchy({ leaves, paths });
  const [expandedItems, setExpandedItems] = useLocalStorage<string[]>(
    "expanded-hierarchy-nodes",
    []
  );
  const [defaultExpandedItems] = useState(expandedItems);

  const onSelectedItemsChange = (
    event: React.SyntheticEvent,
    itemIds: string | string[] | null
  ) => {
    if (!itemIds) return;
    
    let id: string | undefined;
    
    if (Array.isArray(itemIds)) {
      // If itemIds is an array, use the first item
      if (itemIds.length === 0) return;
      id = itemIds[0].split(":").pop();
    } else {
      id = itemIds.split(":").pop();
    }
    
    if (!id || !lookupMap[id]) {
      console.error(
        `Fehler: Kein passender Eintrag in lookupMap für id: ${id}`
      );
      return;
    }
    onSelect(lookupMap[id]);
  };

  // Rekursive Funktion, um den Baum zu rendern:
  const renderTreeItems = (node: any): React.ReactNode => {
    const childElements: React.ReactNode[] =
      node.children && node.children.length > 0
        ? node.children.map((child: any) => renderTreeItems(child))
        : [];

    return (
      <StyledTreeItem
        key={node.id}
        itemId={String(node.nodeId)}
        data={node.data}
      >
        {childElements}
      </StyledTreeItem>
    );
  };

  return (
    <StyledTreeView
      onSelectedItemsChange={onSelectedItemsChange}
      onExpandedItemsChange={(event: React.SyntheticEvent, itemIds: string[]) =>
        setExpandedItems(itemIds)
      }
      defaultExpandedItems={defaultExpandedItems}
      expandedItems={expandedItems}
      slots={{
        expandIcon: ArrowRightIcon,
        collapseIcon: ArrowDropDownIcon,
        endIcon: () => <div style={{ width: 24 }} />,
      }}
    >
      {nodes.map((node: any) => renderTreeItems(node))}
    </StyledTreeView>
  );
};
