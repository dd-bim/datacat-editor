import { useMemo } from "react";
import { ItemPropsFragment } from "../../generated/types";

export type VTreeRootNode = {
    children: VTreeNode[]
}

export type VTreeNode = {
    id: string,
    nodeId: string,
    data: ItemPropsFragment,
    children: VTreeNode[]
}

type UseVTreeOptions = {
    leaves: ItemPropsFragment[],
    paths: string[][]
}

const useFindMultipleNames = (options: UseVTreeOptions) => {
    const { leaves, paths } = options;

    // Create a lookup object for fast data retrieval
    const lookupMap = useMemo(() => {
        return leaves.reduce((agg, cur) => {
            agg[cur.id] = cur;
            return agg;
        }, {} as { [key: string]: ItemPropsFragment });
    }, [leaves]);

    // Generate the tree structure and find duplicates within each type
    const rootNode = useMemo(() => {
        const result: VTreeRootNode = { children: [] };
        const duplicatesMap: { [key: string]: { [name: string]: VTreeNode[] } } = {};

        paths.forEach(path => {
            let parent = result; // Start mapping from the root node

            path.forEach((id, idx) => {
                const data = lookupMap[id];

                // Initialize duplicates tracking for this type if not already done
                if (!duplicatesMap[data.recordType]) {
                    duplicatesMap[data.recordType] = {};
                }

                // Check if the node already exists in the current parent
                let node = parent.children.find(n => n.id === id);
                if (!node) {
                    const nodeId = path.slice(0, idx + 1).join(':') + ':' + id;
                    node = { id, nodeId, data, children: [] };

                    // Check for duplicate names within the same type
                    const nodeName = data.name ?? data.id;
                    if (!duplicatesMap[data.recordType][nodeName]) {
                        duplicatesMap[data.recordType][nodeName] = [];
                    }
                    duplicatesMap[data.recordType][nodeName].push(node);

                    parent.children.push(node);

                    // Sort the children by name within the same recordType (type)
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

        // Filter nodes to only include those that have duplicates within the same type
        const findDuplicates = (nodes: VTreeNode[]): VTreeNode[] => {
            return nodes.flatMap(node => {
                const nodeName = node.data.name ?? node.id;
                const duplicatesInType = duplicatesMap[node.data.recordType][nodeName];
                if (duplicatesInType && duplicatesInType.length > 1) {
                    return [node, ...findDuplicates(node.children)];
                }
                return findDuplicates(node.children);
            });
        };

        const duplicateNodes = findDuplicates(result.children);

        return { children: duplicateNodes };
    }, [paths, lookupMap]);

    return {
        nodes: rootNode.children,
        lookupMap
    };
};

export default useFindMultipleNames;