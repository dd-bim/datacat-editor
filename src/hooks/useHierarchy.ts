import { useMemo } from "react";
import { ObjectPropsFragment } from "../generated/types";

export type PropertyTreeRootNode = {
    children: PropertyTreeNode[]
}

export type PropertyTreeNode = {
    id: string;
    nodeId: string;
    data: ObjectPropsFragment;
    children: PropertyTreeNode[];
};

type UsePropertyTreeOptions = {
    leaves: ObjectPropsFragment[],
    paths: string[][]
}

const useHierarchy = (options: UsePropertyTreeOptions) => {
    const {
        leaves,
        paths
    } = options;
    // memorize a lookup object fasten tree generation
    const lookupMap = useMemo(() => {
        return leaves.reduce((agg, cur) => {
            agg[cur.id] = cur;
            return agg;
        }, {} as { [key: string]: ObjectPropsFragment });
    }, [leaves]);

    // generate tree structure
    const rootNode = useMemo(() => {
        const result: PropertyTreeRootNode = { children: [] };

        paths.forEach(path => {
            let parent = result; // start mapping at root node

            path.forEach((id, idx) => {
                const data = lookupMap[id];

                // the node may have been introduced in another path already
                let node = parent.children.find(n => n.id === id);
                if (!node) {
                    const nodeId = path.slice(0, idx + 1).join(':') + ':' + id;
                    node = { id, nodeId, data, children: [] };
                    parent.children.push(node);
                    parent.children.sort((a, b) => {
                        if (a.data.recordType === b.data.recordType) {
                            const nameA = a.data.name ?? a.data.id;
                            const nameB = b.data.name ?? b.data.id;
                            return nameA.localeCompare(nameB);
                        }
                        return a.data.recordType.localeCompare(b.data.recordType);
                    });
                }
                parent = node;
            });
        });

        return result;
    }, [paths, lookupMap]);

    return {
        nodes: rootNode.children,
        lookupMap
    };
};

export default useHierarchy;
