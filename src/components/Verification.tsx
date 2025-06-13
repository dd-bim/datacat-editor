import { FC, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { SimpleTreeView } from "@mui/x-tree-view";
import { StyledTreeItem } from "./StyledTreeItem";
import { ObjectPropsFragment } from "../generated/types";
import * as React from "react";
import { styled } from "@mui/material/styles";

// Importiere alle benötigten Hooks:
import useVerification from "../hooks/verification/useVerification";

const StyledTreeView = styled(SimpleTreeView)(({ theme }) => ({
  flexGrow: 1,
  overflow: "auto",
  maxHeight: 600,
}));

export type VerificationProps = {
  leaves: ObjectPropsFragment[];
  paths: string[];
  onSelect(selection: ObjectPropsFragment): void;
};

/**
 * Die generische Komponente, die den TreeView anhand eines übergebenen Hooks (useFindHook) rendert.
 */
const VerificationTree: FC<VerificationProps & { useFindHook: (options: VerificationProps) => { nodes: any[], lookupMap: { [key: string]: ObjectPropsFragment } } }> = ({
  leaves,
  paths,
  onSelect,
  useFindHook,
}) => {
  const { nodes, lookupMap } = useFindHook({ leaves, paths, onSelect });
  const [expandedItems, setExpandedItems] = useLocalStorage<string[]>("expanded-verification-nodes", []);
  const [defaultExpandedItems] = useState(expandedItems);

  const onSelectedItemsChange = (
    event: React.SyntheticEvent<Element, Event> | null,
    itemIds: string | string[] | null
  ) => {
    if (!itemIds) return;
    // itemIds kann string oder string[] sein
    let id: string | undefined;
    if (Array.isArray(itemIds)) {
      if (itemIds.length === 0) return;
      id = itemIds[0].split(":").pop();
    } else {
      id = itemIds.split(":").pop();
    }
    if (id && lookupMap[id]) {
      onSelect(lookupMap[id]);
    }
  };

  return (
    <StyledTreeView
      onSelectedItemsChange={onSelectedItemsChange}
      onExpandedItemsChange={(event, itemIds) => setExpandedItems(itemIds)}
      defaultExpandedItems={defaultExpandedItems}
      expandedItems={expandedItems}
      slots={{
        endIcon: () => <div style={{ width: 24 }} />,
      }}
    >
      {nodes.map((child) => (
        <StyledTreeItem
          key={child.id}
          itemId={String(child.id)}
          data={child.data}
        >
          {React.Children.toArray(child.children)}
        </StyledTreeItem>
      ))}
    </StyledTreeView>
  );
};

// Nun werden alle Varianten als Wrapper für VerificationTree exportiert:
export const FindVerification: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useVerification} />
);
