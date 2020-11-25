import makeStyles from "@material-ui/core/styles/makeStyles";
import React, {ChangeEvent, FC, useState} from "react";
import useHierarchy from "../hooks/useHierarchy";
import useLocalStorage from "../hooks/useLocalStorage";
import TreeView from "@material-ui/lab/TreeView";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import {StyledTreeItem} from "./StyledTreeItem";
import {ItemPropsFragment} from "../generated/types";

const usePropertyTreeStyles = makeStyles({
    root: {
        flexGrow: 1
    }
});
type HierarchyProps = {
    leaves: ItemPropsFragment[]
    paths: string[][],
    hideRelationships: boolean,
    onSelect(selection: ItemPropsFragment): void
}
export const Hierarchy: FC<HierarchyProps> = (props) => {
    const classes = usePropertyTreeStyles();
    const {
        leaves,
        paths,
        hideRelationships
    } = props;
    const {nodes, lookupMap} = useHierarchy({leaves, paths, hideRelationships});
    const [expanded, setExpanded] = useLocalStorage<string[]>("expanded-hierarchy-nodes", []);
    const [defaultExpanded] = useState(expanded);

    const onNodeSelect = (event: ChangeEvent<{}>, nodeId: string) => {
        const [id] = nodeId.split(":").slice(-1);
        props.onSelect(lookupMap[id]);
    };

    return (
        <TreeView
            className={classes.root}
            onNodeSelect={onNodeSelect}
            onNodeToggle={(event, nodeIds) => setExpanded(nodeIds)}
            defaultCollapseIcon={<ArrowDropDownIcon/>}
            defaultExpandIcon={<ArrowRightIcon/>}
            defaultEndIcon={<div style={{width: 24}}/>}
            defaultExpanded={defaultExpanded}
        >
            {nodes.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </TreeView>
    );
};
