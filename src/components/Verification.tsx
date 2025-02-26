import makeStyles from "@mui/styles/makeStyles";
import {ChangeEvent, FC, useState} from "react";
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
import useLocalStorage from "../hooks/useLocalStorage";
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import {StyledTreeItem} from "./StyledTreeItem";
import {ItemPropsFragment} from "../generated/types";

// TreeView-Generierung der Prüfroutinen

const useVerificationTreeStyles = makeStyles({
    root: {
        flexGrow: 1,
        overflow: 'auto',
        maxHeight: 600,
    }
});

type VerificationProps = {
    leaves: ItemPropsFragment[],
    paths: string[][],
    onSelect(selection: ItemPropsFragment): void
}

export const FindPropGroupWithoutProp: FC<VerificationProps> = (props) => {
    const classes = useVerificationTreeStyles();
    const {
        leaves,
        paths,
    } = props;
    const {nodes, lookupMap} = useFindPropGroupWithoutProp({leaves, paths});
    const [expanded, setExpanded] = useLocalStorage<string[]>("expanded-verification-nodes", []);
    const [defaultExpanded] = useState(expanded);

    const onNodeSelect = (event: ChangeEvent<{}>, nodeId: string) => {
        const [id] = nodeId.split(":").slice(-1);
        props.onSelect(lookupMap[id]);
    };

    return (
        (<SimpleTreeView
                    className={classes.root}
                    onSelectedItemsChange={onNodeSelect}
                    onExpandedItemsChange={(event, nodeIds) => setExpanded(nodeIds)}
                    defaultEndIcon={<div style={{width: 24}}/>}
                    defaultExpandedItems={defaultExpanded}
                >
            {nodes.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </SimpleTreeView>)
    );
};

export const FindPropWithoutSubjectOrPropGroup: FC<VerificationProps> = (props) => {
    const classes = useVerificationTreeStyles();
    const {
        leaves,
        paths,
    } = props;
    const {nodes, lookupMap} = useFindPropWithoutSubjectOrPropGroup({leaves, paths});
    const [expanded, setExpanded] = useLocalStorage<string[]>("expanded-verification-nodes", []);
    const [defaultExpanded] = useState(expanded);

    const onNodeSelect = (event: ChangeEvent<{}>, nodeId: string) => {
        const [id] = nodeId.split(":").slice(-1);
        props.onSelect(lookupMap[id]);
    };

    return (
        (<SimpleTreeView
                    className={classes.root}
                    onSelectedItemsChange={onNodeSelect}
                    onExpandedItemsChange={(event, nodeIds) => setExpanded(nodeIds)}
                    defaultEndIcon={<div style={{width: 24}}/>}
                    defaultExpandedItems={defaultExpanded}
                >
            {nodes.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </SimpleTreeView>)
    );
};

export const FindModelWithoutGroup: FC<VerificationProps> = (props) => {
    const classes = useVerificationTreeStyles();
    const {
        leaves,
        paths,
    } = props;
    const {nodes, lookupMap} = useFindModelWithoutGroup({leaves, paths});
    const [expanded, setExpanded] = useLocalStorage<string[]>("expanded-verification-nodes", []);
    const [defaultExpanded] = useState(expanded);

    const onNodeSelect = (event: ChangeEvent<{}>, nodeId: string) => {
        const [id] = nodeId.split(":").slice(-1);
        props.onSelect(lookupMap[id]);
    };

    return (
        (<SimpleTreeView
                    className={classes.root}
                    onSelectedItemsChange={onNodeSelect}
                    onExpandedItemsChange={(event, nodeIds) => setExpanded(nodeIds)}
                    defaultEndIcon={<div style={{width: 24}}/>}
                    defaultExpandedItems={defaultExpanded}
                >
            {nodes.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </SimpleTreeView>)
    );
};

export const FindGroupWithoutSubject: FC<VerificationProps> = (props) => {
    const classes = useVerificationTreeStyles();
    const {
        leaves,
        paths,
    } = props;
    const {nodes, lookupMap} = useFindGroupWithoutSubject({leaves, paths});
    const [expanded, setExpanded] = useLocalStorage<string[]>("expanded-verification-nodes", []);
    const [defaultExpanded] = useState(expanded);

    const onNodeSelect = (event: ChangeEvent<{}>, nodeId: string) => {
        const [id] = nodeId.split(":").slice(-1);
        props.onSelect(lookupMap[id]);
    };

    return (
        (<SimpleTreeView
                    className={classes.root}
                    onSelectedItemsChange={onNodeSelect}
                    onExpandedItemsChange={(event, nodeIds) => setExpanded(nodeIds)}
                    defaultEndIcon={<div style={{width: 24}}/>}
                    defaultExpandedItems={defaultExpanded}
                >
            {nodes.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </SimpleTreeView>)
    );
};

export const FindSubjectWithoutProp: FC<VerificationProps> = (props) => {
    const classes = useVerificationTreeStyles();
    const {
        leaves,
        paths,
    } = props;
    const {nodes, lookupMap} = useFindSubjectWithoutProp({leaves, paths});
    const [expanded, setExpanded] = useLocalStorage<string[]>("expanded-verification-nodes", []);
    const [defaultExpanded] = useState(expanded);

    const onNodeSelect = (event: ChangeEvent<{}>, nodeId: string) => {
        const [id] = nodeId.split(":").slice(-1);
        props.onSelect(lookupMap[id]);
    };

    return (
        (<SimpleTreeView
                    className={classes.root}
                    onSelectedItemsChange={onNodeSelect}
                    onExpandedItemsChange={(event, nodeIds) => setExpanded(nodeIds)}
                    defaultEndIcon={<div style={{width: 24}}/>}
                    defaultExpandedItems={defaultExpanded}
                >
            {nodes.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </SimpleTreeView>)
    );
};

export const FindMeasureWithoutProp: FC<VerificationProps> = (props) => {
    const classes = useVerificationTreeStyles();
    const {
        leaves,
        paths,
    } = props;
    const {nodes, lookupMap} = useFindMeasureWithoutProp({leaves, paths});
    const [expanded, setExpanded] = useLocalStorage<string[]>("expanded-verification-nodes", []);
    const [defaultExpanded] = useState(expanded);

    const onNodeSelect = (event: ChangeEvent<{}>, nodeId: string) => {
        const [id] = nodeId.split(":").slice(-1);
        props.onSelect(lookupMap[id]);
    };

    return (
        (<SimpleTreeView
                    className={classes.root}
                    onSelectedItemsChange={onNodeSelect}
                    onExpandedItemsChange={(event, nodeIds) => setExpanded(nodeIds)}
                    defaultEndIcon={<div style={{width: 24}}/>}
                    defaultExpandedItems={defaultExpanded}
                >
            {nodes.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </SimpleTreeView>)
    );
};

export const FindUnitWithoutMeasure: FC<VerificationProps> = (props) => {
    const classes = useVerificationTreeStyles();
    const {
        leaves,
        paths,
    } = props;
    const {nodes, lookupMap} = useFindUnitWithoutMeasure({leaves, paths});
    const [expanded, setExpanded] = useLocalStorage<string[]>("expanded-verification-nodes", []);
    const [defaultExpanded] = useState(expanded);

    const onNodeSelect = (event: ChangeEvent<{}>, nodeId: string) => {
        const [id] = nodeId.split(":").slice(-1);
        props.onSelect(lookupMap[id]);
    };

    return (
        (<SimpleTreeView
                    className={classes.root}
                    onSelectedItemsChange={onNodeSelect}
                    onExpandedItemsChange={(event, nodeIds) => setExpanded(nodeIds)}
                    defaultEndIcon={<div style={{width: 24}}/>}
                    defaultExpandedItems={defaultExpanded}
                >
            {nodes.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </SimpleTreeView>)
    );
};

export const FindValueWithoutMeasure: FC<VerificationProps> = (props) => {
    const classes = useVerificationTreeStyles();
    const {
        leaves,
        paths,
    } = props;
    const {nodes, lookupMap} = useFindValueWithoutMeasure({leaves, paths});
    const [expanded, setExpanded] = useLocalStorage<string[]>("expanded-verification-nodes", []);
    const [defaultExpanded] = useState(expanded);

    const onNodeSelect = (event: ChangeEvent<{}>, nodeId: string) => {
        const [id] = nodeId.split(":").slice(-1);
        props.onSelect(lookupMap[id]);
    };

    return (
        (<SimpleTreeView
                    className={classes.root}
                    onSelectedItemsChange={onNodeSelect}
                    onExpandedItemsChange={(event, nodeIds) => setExpanded(nodeIds)}
                    defaultEndIcon={<div style={{width: 24}}/>}
                    defaultExpandedItems={defaultExpanded}
                >
            {nodes.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </SimpleTreeView>)
    );
};

export const FindMissingEnglishName: FC<VerificationProps> = (props) => {
    const classes = useVerificationTreeStyles();
    const {
        leaves,
        paths,
    } = props;
    const {nodes, lookupMap} = useFindMissingEnglishName({leaves, paths});
    const [expanded, setExpanded] = useLocalStorage<string[]>("expanded-verification-nodes", []);
    const [defaultExpanded] = useState(expanded);

    const onNodeSelect = (event: ChangeEvent<{}>, nodeId: string) => {
        const [id] = nodeId.split(":").slice(-1);
        props.onSelect(lookupMap[id]);
    };

    return (
        (<SimpleTreeView
                    className={classes.root}
                    onSelectedItemsChange={onNodeSelect}
                    onExpandedItemsChange={(event, nodeIds) => setExpanded(nodeIds)}
                    defaultEndIcon={<div style={{width: 24}}/>}
                    defaultExpandedItems={defaultExpanded}
                >
            {nodes.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </SimpleTreeView>)
    );
};

export const FindMultipleIDs: FC<VerificationProps> = (props) => {
    const classes = useVerificationTreeStyles();
    const {
        leaves,
        paths,
    } = props;
    const {nodes, lookupMap} = useFindMultipleIDs({leaves, paths});
    const [expanded, setExpanded] = useLocalStorage<string[]>("expanded-verification-nodes", []);
    const [defaultExpanded] = useState(expanded);

    const onNodeSelect = (event: ChangeEvent<{}>, nodeId: string) => {
        const [id] = nodeId.split(":").slice(-1);
        props.onSelect(lookupMap[id]);
    };

    return (
        (<SimpleTreeView
                    className={classes.root}
                    onSelectedItemsChange={onNodeSelect}
                    onExpandedItemsChange={(event, nodeIds) => setExpanded(nodeIds)}
                    defaultEndIcon={<div style={{width: 24}}/>}
                    defaultExpandedItems={defaultExpanded}
                >
            {nodes.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </SimpleTreeView>)
    );
};

export const FindMissingDescription: FC<VerificationProps> = (props) => {
    const classes = useVerificationTreeStyles();
    const {
        leaves,
        paths,
    } = props;
    const {nodes, lookupMap} = useFindMissingDescription({leaves, paths});
    const [expanded, setExpanded] = useLocalStorage<string[]>("expanded-verification-nodes", []);
    const [defaultExpanded] = useState(expanded);

    const onNodeSelect = (event: ChangeEvent<{}>, nodeId: string) => {
        const [id] = nodeId.split(":").slice(-1);
        props.onSelect(lookupMap[id]);
    };

    return (
        (<SimpleTreeView
                    className={classes.root}
                    onSelectedItemsChange={onNodeSelect}
                    onExpandedItemsChange={(event, nodeIds) => setExpanded(nodeIds)}
                    defaultEndIcon={<div style={{width: 24}}/>}
                    defaultExpandedItems={defaultExpanded}
                >
            {nodes.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </SimpleTreeView>)
    );
};

export const FindMissingEnglishDescription: FC<VerificationProps> = (props) => {
    const classes = useVerificationTreeStyles();
    const {
        leaves,
        paths,
    } = props;
    const {nodes, lookupMap} = useFindMissingEnglishDescription({leaves, paths});
    const [expanded, setExpanded] = useLocalStorage<string[]>("expanded-verification-nodes", []);
    const [defaultExpanded] = useState(expanded);

    const onNodeSelect = (event: ChangeEvent<{}>, nodeId: string) => {
        const [id] = nodeId.split(":").slice(-1);
        props.onSelect(lookupMap[id]);
    };

    return (
        (<SimpleTreeView
                    className={classes.root}
                    onSelectedItemsChange={onNodeSelect}
                    onExpandedItemsChange={(event, nodeIds) => setExpanded(nodeIds)}
                    defaultEndIcon={<div style={{width: 24}}/>}
                    defaultExpandedItems={defaultExpanded}
                >
            {nodes.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </SimpleTreeView>)
    );
};

export const FindMultipleNames: FC<VerificationProps> = (props) => {
    const classes = useVerificationTreeStyles();
    const { leaves, paths } = props;
    const { nodes, lookupMap } = useFindMultipleNames({ leaves, paths });
    const [expanded, setExpanded] = useLocalStorage<string[]>("expanded-verification-nodes", []);
    const [defaultExpanded] = useState(expanded);

    const onNodeSelect = (event: ChangeEvent<{}>, nodeId: string) => {
        const [id] = nodeId.split(":").slice(-1);
        props.onSelect(lookupMap[id]);
    };

    return (
        (<SimpleTreeView
                    className={classes.root}
                    onSelectedItemsChange={onNodeSelect}
                    onExpandedItemsChange={(event, nodeIds) => setExpanded(nodeIds)}
                    defaultEndIcon={<div style={{width: 24}} />}
                    defaultExpandedItems={defaultExpanded}
                >
            {nodes.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </SimpleTreeView>)
    );
};

export const FindMultipleNamesAcrossClasses: FC<VerificationProps> = (props) => {
    const classes = useVerificationTreeStyles();
    const { leaves, paths } = props;
    const { nodes, lookupMap } = useFindMultipleNamesAcrossClasses({ leaves, paths });
    const [expanded, setExpanded] = useLocalStorage<string[]>("expanded-verification-nodes", []);
    const [defaultExpanded] = useState(expanded);

    const onNodeSelect = (event: ChangeEvent<{}>, nodeId: string) => {
        const [id] = nodeId.split(":").slice(-1);
        props.onSelect(lookupMap[id]);
    };

    return (
        (<SimpleTreeView
                    className={classes.root}
                    onSelectedItemsChange={onNodeSelect}
                    onExpandedItemsChange={(event, nodeIds) => setExpanded(nodeIds)}
                    defaultEndIcon={<div style={{width: 24}} />}
                    defaultExpandedItems={defaultExpanded}
                >
            {nodes.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </SimpleTreeView>)
    );
};