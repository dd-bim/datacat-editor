import {useMemo} from "react";
import {ConceptPropsFragment} from "../generated/types";

export type PropertyTreeRootNode = {
    children: PropertyTreeNode[]
}

export type PropertyTreeNode = {
    id: string,
    nodeId: string,
    data: ConceptPropsFragment,
    children: PropertyTreeNode[]
}

type UsePropertyTreeOptions = {
    leaves: ConceptPropsFragment[],
    paths: string[][],
    hideRelationships: boolean
}

const useHierarchy = (options: UsePropertyTreeOptions) => {
    const {
        leaves,
        paths,
        hideRelationships
    } = options;
    // memoize a lookup object fasten tree generation
    const lookupMap = useMemo(() => {
        return leaves.reduce((agg, cur) => {
            agg[cur.id] = cur;
            return agg;
        }, {} as { [key: string]: ConceptPropsFragment });
    }, [leaves]);

    // generate tree structure
    const rootNode = useMemo(() => {
        const result: PropertyTreeRootNode = {children: []};

        paths.forEach(path => {
            let parent = result; // start mapping at root node

            path.forEach((id, idx) => {
                const data = lookupMap[id];

                // hide relationships in tree view
                if (hideRelationships && data.__typename.startsWith("XtdRel")) return;

                // the node may have been introduced in another path already
                let node = parent.children.find(n => n.id === id);
                if (!node) {
                    const nodeId = path.slice(0, idx + 1).join(':') + ':' + id;
                    node = { id, nodeId, data, children: [] };
                    parent.children.push(node);
                    parent.children.sort((a, b) => {
                        if (a.data.__typename == b.data.__typename) {
                            const nameA = a.data.name ?? a.data.id;
                            const nameB = b.data.name ?? b.data.id;
                            return nameA.localeCompare(nameB);
                        }
                        return a.data.__typename.localeCompare(b.data.__typename);
                    });
                }
                parent = node;
            });
        });

        return result;
    }, [hideRelationships, paths, lookupMap]);

    return {
        nodes: rootNode.children,
        lookupMap
    };
};

export default useHierarchy;
