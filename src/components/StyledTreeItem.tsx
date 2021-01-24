import {PropertyTreeNode} from "../hooks/useHierarchy";
import React, {FC} from "react";
import {TreeItem, TreeItemProps} from "@material-ui/lab";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {ItemPropsFragment} from "../generated/types";
import {getEntityType} from "../domain";

const useStyles = makeStyles((theme) => ({
    root: {
        color: theme.palette.text.secondary,
        "&:hover > $content": {
            backgroundColor: theme.palette.action.hover
        },
        "&$selected > $content": {
            backgroundColor: theme.palette.primary.light,
        }
    },
    content: {
        borderTopRightRadius: theme.spacing(2),
        borderBottomRightRadius: theme.spacing(2),
        paddingRight: theme.spacing(1)
    },
    group: {
        '& $content': {
            paddingLeft: theme.spacing(2),
        },
    },
    expanded: {},
    selected: {},
    label: {
        backgroundColor: "transparent !important",
        fontWeight: "inherit",
        color: "inherit"
    },
    labelRoot: {
        display: "flex",
        alignItems: "center",
        padding: theme.spacing(.5),
    },
    labelIcon: {
        marginRight: theme.spacing(1)
    },
    labelText: {
        fontWeight: "inherit",
        flexGrow: 1,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    labelInfo: {
        "& > *": {
            marginLeft: theme.spacing(1)
        }
    }
}));

type StyleTreeItemProps = {
    id: string,
    data: ItemPropsFragment,
    children: PropertyTreeNode[],
    onFilter?(nodeId: string, data: ItemPropsFragment): void
}
export const StyledTreeItem: FC<StyleTreeItemProps & TreeItemProps> = (props) => {
    const classes = useStyles();
    const {
        id,
        nodeId,
        data,
        children,
        onFilter,
        ...other
    } = props;

    const recordTypeDefinition = getEntityType(data.recordType, data.tags.map(tag => tag.id))!;

    const handleOnLabelClick = (event: React.MouseEvent) => {
        event.preventDefault();
    }

    return (
        <TreeItem
            nodeId={nodeId}

            onLabelClick={handleOnLabelClick}

            label={
                <div className={classes.labelRoot}>
                    <recordTypeDefinition.Icon
                        className={classes.labelIcon}
                        fontSize="small"
                        color="inherit"
                    />
                    <Tooltip title={data.description ?? ""} arrow>
                        <Typography variant="body2" className={classes.labelText}>
                            {data.name ?? `${data.id} (${data.__typename})`}
                        </Typography>
                    </Tooltip>
                </div>
            }

            classes={{
                root: classes.root,
                group: classes.group,
                content: classes.content,
                expanded: classes.expanded,
                selected: classes.selected,
                label: classes.label
            }}
            {...other}
        >
            {children.map(child => (
                <StyledTreeItem key={child.id} {...child}>
                    {child.children}
                </StyledTreeItem>
            ))}
        </TreeItem>
    );
}
