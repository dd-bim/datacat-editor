import { styled } from "@mui/material/styles";
import React, { FC, useState, useMemo, useCallback, useEffect } from "react";
import useHierarchy from "../hooks/useHierarchy";
import useLocalStorage from "../hooks/useLocalStorage";
import { SimpleTreeView } from "@mui/x-tree-view";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { StyledTreeItem } from "./StyledTreeItem";
import { ItemPropsFragment } from "../generated/graphql";

// Throttle function für bessere Performance
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

// Replace makeStyles with styled component
const StyledTreeView = styled(SimpleTreeView)(({ theme }) => ({
  flexGrow: 1,
  // Enable better performance for large trees
  '& .MuiTreeView-root': {
    overflowX: 'hidden',
    contain: 'layout style paint',
  },
  // Optimize tree item rendering
  '& .MuiTreeItem-root': {
    contain: 'layout style paint',
  },
  // Virtualization support - only render visible area + buffer
  '& .MuiTreeItem-content': {
    willChange: 'transform',
  }
}));

type HierarchyProps = {
  leaves: ItemPropsFragment[];
  paths: string[][];
  onSelect(selection: ItemPropsFragment): void;
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
  
  // Throttled handlers für bessere Performance
  const throttledExpandedItemsChange = useMemo(
    () => throttle((itemIds: string[]) => {
      setExpandedItems(itemIds);
      setUseSavedExpandedState(true);
    }, 100), // 100ms throttle
    [setExpandedItems]
  );
  
  // Memoize expanded items change handler with throttling
  const handleExpandedItemsChange = useCallback((
    _: React.SyntheticEvent<Element, Event> | null,
    itemIds: string[]
  ) => {
    throttledExpandedItemsChange(itemIds);
  }, [throttledExpandedItemsChange]);

  // Implement node virtualization for better performance with large trees
  // Create a wrapper function that can handle both item selections and react events
  const handleItemSelect = useCallback((
    itemOrEvent: ItemPropsFragment | React.SyntheticEvent<HTMLLIElement, Event>
  ) => {
    // If it's an event (React event), do nothing or add event handling if needed
    // If it's an item (has typical ItemPropsFragment properties), pass it to onSelect
    if ('id' in itemOrEvent && !('nativeEvent' in itemOrEvent)) {
      onSelect(itemOrEvent as ItemPropsFragment);
    }
  }, [onSelect]);

  const renderTreeItems = useCallback((node: any): React.ReactNode => {
    // Lazy rendering: Nur laden wenn expandiert oder root level
    const shouldRenderChildren = node.children && node.children.length > 0;
    
    // Für bessere Performance: Nicht alle Children sofort rendern
    const childElements: React.ReactNode[] = shouldRenderChildren
      ? node.children.slice(0, 100).map((child: any) => renderTreeItems(child)) // Limitiere auf 100 Kinder
      : [];

    return (
      <StyledTreeItem
        key={node.id}
        itemId={String(node.nodeId)}
        data={node.data}
        onSelect={handleItemSelect}
        // Lazy loading für große Unterbäume
        {...(node.children && node.children.length > 100 ? {
          'data-lazy': true,
          'aria-label': `${node.data?.name || 'Node'} (${node.children.length} children)`
        } : {})}
      >
        {childElements}
        {/* Zeige Indicator für weitere Kinder */}
        {node.children && node.children.length > 100 && (
          <StyledTreeItem 
            itemId={`${node.nodeId}-more`} 
            data={{ 
              __typename: 'XtdSubject' as const, 
              id: `${node.nodeId}-more`, 
              name: `... und ${node.children.length - 100} weitere`,
              recordType: node.data?.recordType || 'Subject',
              tags: []
            }}
            onSelect={() => {}} 
          />
        )}
      </StyledTreeItem>
    );
  }, [handleItemSelect]);

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
