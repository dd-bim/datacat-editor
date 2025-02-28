import makeStyles from "@mui/styles/makeStyles";
import React, { FC, useState } from "react";
import useHierarchy from "../hooks/useHierarchy";
import useLocalStorage from "../hooks/useLocalStorage";
import { SimpleTreeView } from "@mui/x-tree-view";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { StyledTreeItem } from "./StyledTreeItem";
import { ItemPropsFragment } from "../generated/types";

const usePropertyTreeStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

type HierarchyProps = {
  leaves: ItemPropsFragment[];
  paths: string[][];
  onSelect(selection: ItemPropsFragment): void;
};

export const Hierarchy: FC<HierarchyProps> = (props) => {
  const classes = usePropertyTreeStyles();
  const { leaves, paths, onSelect } = props;
  const { nodes, lookupMap } = useHierarchy({ leaves, paths });
  const [expandedItems, setExpandedItems] = useLocalStorage<string[]>(
    "expanded-hierarchy-nodes",
    []
  );
  const [defaultExpandedItems] = useState(expandedItems);

  const onSelectedItemsChange = (
    event: React.SyntheticEvent,
    itemIds: string | null
  ) => {
    if (!itemIds) return;
    const id = itemIds.split(":").pop();
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
    <SimpleTreeView
      className={classes.root}
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
    </SimpleTreeView>
  );
};
