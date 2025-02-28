import makeStyles from "@mui/styles/makeStyles";
import { FC, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { SimpleTreeView } from "@mui/x-tree-view";
import { StyledTreeItem } from "./StyledTreeItem";
import { ItemPropsFragment } from "../generated/types";
import * as React from "react";

// Importiere alle benötigten Hooks:
import useFindPropGroupWithoutProp from "../hooks/verification/useFindPropGroupWithoutProp";
import useFindPropWithoutSubjectOrPropGroup from "../hooks/verification/useFindPropWithoutSubjectOrPropGroup";
import useFindModelWithoutGroup from "../hooks/verification/useFindModelWithoutGroup";
import useFindGroupWithoutSubject from "../hooks/verification/useFindGroupWithoutSubject";
import useFindSubjectWithoutProp from "../hooks/verification/useFindSubjectWithoutProp";
import useFindMeasureWithoutProp from "../hooks/verification/useFindMeasureWithoutProp";
import useFindUnitWithoutMeasure from "../hooks/verification/useFindUnitWithoutMeasure";
import useFindValueWithoutMeasure from "../hooks/verification/useFindValueWithoutMeasure";
import useFindMissingEnglishName from "../hooks/verification/useFindMissingEnglishName";
import useFindMultipleIDs from "../hooks/verification/useFindMultipleIDs";
import useFindMissingDescription from "../hooks/verification/useFindMissingDescription";
import useFindMissingEnglishDescription from "../hooks/verification/useFindMissingEnglishDescription";
import useFindMultipleNames from "../hooks/verification/useFindMultipleNames";
import useFindMultipleNamesAcrossClasses from "../hooks/verification/useFindMultipleNamesAcrossClasses";

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
export const FindPropGroupWithoutProp: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useFindPropGroupWithoutProp} />
);

export const FindPropWithoutSubjectOrPropGroup: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useFindPropWithoutSubjectOrPropGroup} />
);

export const FindModelWithoutGroup: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useFindModelWithoutGroup} />
);

export const FindGroupWithoutSubject: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useFindGroupWithoutSubject} />
);

export const FindSubjectWithoutProp: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useFindSubjectWithoutProp} />
);

export const FindMeasureWithoutProp: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useFindMeasureWithoutProp} />
);

export const FindUnitWithoutMeasure: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useFindUnitWithoutMeasure} />
);

export const FindValueWithoutMeasure: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useFindValueWithoutMeasure} />
);

export const FindMissingEnglishName: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useFindMissingEnglishName} />
);

export const FindMultipleIDs: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useFindMultipleIDs} />
);

export const FindMissingDescription: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useFindMissingDescription} />
);

export const FindMissingEnglishDescription: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useFindMissingEnglishDescription} />
);

export const FindMultipleNames: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useFindMultipleNames} />
);

export const FindMultipleNamesAcrossClasses: FC<VerificationProps> = (props) => (
  <VerificationTree {...props} useFindHook={useFindMultipleNamesAcrossClasses} />
);
