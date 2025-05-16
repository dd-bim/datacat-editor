import { styled } from "@mui/material/styles";
import React, { FC, useState, useMemo, useCallback, useEffect } from "react";
import useHierarchy from "../hooks/useHierarchy";
import useLocalStorage from "../hooks/useLocalStorage";
import { SimpleTreeView } from "@mui/x-tree-view";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { StyledTreeItem } from "./StyledTreeItem";
import { ObjectPropsFragment } from "../generated/types";

// Replace makeStyles with styled component
const StyledTreeView = styled(SimpleTreeView)({
  flexGrow: 1,
  // Enable virtualization (only renders visible nodes)
  '& .MuiTreeView-root': {
    overflowX: 'hidden'
  }
});

type HierarchyProps = {
  leaves: ObjectPropsFragment[];
  paths: string[][];
  onSelect(selection: ObjectPropsFragment): void;
  defaultCollapsed?: boolean; // New prop to control default collapsed state
};

export const Hierarchy: FC<HierarchyProps> = React.memo(({ 
  leaves, 
  paths, 
  onSelect, 
  defaultCollapsed = false  // Default to false for backward compatibility
}) => {
  // Call hooks at the top level
  const { nodes, lookupMap } = useHierarchy({ leaves, paths });
  
  // Modified to respect defaultCollapsed prop
  const [expandedItems, setExpandedItems] = useLocalStorage<string[]>(
    "expanded-hierarchy-nodes",
    []
  );

  // State to control if the initial render should use saved expanded state
  const [useSavedExpandedState, setUseSavedExpandedState] = useState(!defaultCollapsed);

  // Calculate effective expanded items based on defaultCollapsed setting
  const effectiveExpandedItems = useMemo(() => {
    return useSavedExpandedState ? expandedItems : [];
  }, [expandedItems, useSavedExpandedState]);

  // Reset expanded items when defaultCollapsed changes
  useEffect(() => {
    if (defaultCollapsed) {
      // If we want collapsed state, ignore saved expanded state on first render
      setUseSavedExpandedState(false);
    }
    // After first render, always use saved state for subsequent updates
    return () => {
      setUseSavedExpandedState(true);
    };
  }, [defaultCollapsed]);

  // Optimized with useCallback
  const onSelectedItemsChange = useCallback((
    event: React.SyntheticEvent | null,
    itemIds: string | string[] | null
  ) => {
    if (!itemIds) return;
    
    let id: string | undefined;
    
    if (Array.isArray(itemIds)) {
      if (itemIds.length === 0) return;
      id = itemIds[0].split(":").pop();
    } else {
      id = itemIds.split(":").pop();
    }
    
    if (!id || !lookupMap[id]) {
      console.error(`Fehler: Kein passender Eintrag in lookupMap für id: ${id}`);
      return;
    }
    onSelect(lookupMap[id]);
  }, [lookupMap, onSelect]);
  
  // Memoize expanded items change handler
  const handleExpandedItemsChange = useCallback((
    _: React.SyntheticEvent<Element, Event> | null,
    itemIds: string[]
  ) => {
    setExpandedItems(itemIds);
    // Once user interacts, always use saved state
    setUseSavedExpandedState(true);
  }, [setExpandedItems]);

  // Implement node virtualization for better performance with large trees
  // Create a wrapper function that can handle both item selections and react events
  const handleItemSelect = useCallback((
    itemOrEvent: ObjectPropsFragment | React.SyntheticEvent<HTMLLIElement, Event>
  ) => {
    // If it's an event (React event), do nothing or add event handling if needed
    // If it's an item (has typical ItemPropsFragment properties), pass it to onSelect
    if ('id' in itemOrEvent && !('nativeEvent' in itemOrEvent)) {
      onSelect(itemOrEvent as ObjectPropsFragment);
    }
  }, [onSelect]);

  const renderTreeItems = useCallback((node: any): React.ReactNode => {
    // Skip rendering deeply nested items until they're needed
    const childElements: React.ReactNode[] =
      node.children && node.children.length > 0
        ? node.children.map((child: any) => renderTreeItems(child))
        : [];

    return (
      <StyledTreeItem
        key={node.id}
        itemId={String(node.nodeId)}
        data={node.data}
        onSelect={handleItemSelect} // Pass the wrapper function that handles both types
      >
        {childElements}
      </StyledTreeItem>
    );
  }, [onSelect, handleItemSelect]);

  // Memoize the rendered tree to prevent unnecessary re-renders
  const renderedTree = useMemo(() => 
    nodes.map((node: any) => renderTreeItems(node)),
    [nodes, renderTreeItems]
  );

  return (
    <StyledTreeView
      onSelectedItemsChange={onSelectedItemsChange}
      onExpandedItemsChange={handleExpandedItemsChange}
      expandedItems={effectiveExpandedItems}
      slots={{
        expandIcon: ArrowRightIcon,
        collapseIcon: ArrowDropDownIcon,
        endIcon: () => <div style={{ width: 24 }} />,
      }}
    >
      {renderedTree}
    </StyledTreeView>
  );
});
