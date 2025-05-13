import makeStyles from "@mui/styles/makeStyles";
import { FC, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { SimpleTreeView } from "@mui/x-tree-view";
import { StyledTreeItem } from "./StyledTreeItem";
import { ItemPropsFragment } from "../generated/types";
import * as React from "react";

// Importiere alle benötigten Hooks:
import useVerification from "../hooks/verification/useVerification";

const useVerificationTreeStyles = makeStyles({
  root: {
    flexGrow: 1,
    overflow: "auto",
    maxHeight: 600,
  },
});

export type VerificationProps = {
  leaves: ItemPropsFragment[];
  paths: string[][];
  onSelect(selection: ItemPropsFragment): void;
};

/**
 * Die generische Komponente, die den TreeView anhand eines übergebenen Hooks (useFindHook) rendert.
 */
const VerificationTree: FC<VerificationProps & { useFindHook: (options: VerificationProps) => { nodes: any[], lookupMap: { [key: string]: ItemPropsFragment } } }> = ({
  leaves,
  paths,
  onSelect,
  useFindHook,
}) => {
  const classes = useVerificationTreeStyles();
  const { nodes, lookupMap } = useFindHook({ leaves, paths, onSelect });
  const [expandedItems, setExpandedItems] = useLocalStorage<string[]>("expanded-verification-nodes", []);
  const [defaultExpandedItems] = useState(expandedItems);

  const onSelectedItemsChange = (
    event: React.SyntheticEvent,
    itemIds: string | null
  ) => {
    if (!itemIds) return;
    // Wir extrahieren die letzte ID (nach dem letzten Doppelpunkt)
    const id = itemIds.split(":").pop();
    if (id && lookupMap[id]) {
      onSelect(lookupMap[id]);
    }
  };

  return (
    <SimpleTreeView
      className={classes.root}
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
    </SimpleTreeView>
  );
};

// Nun werden alle Varianten als Wrapper für VerificationTree exportiert:
export const FindVerification: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useVerification} />
);
