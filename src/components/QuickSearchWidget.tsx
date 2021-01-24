import {Link as RouterLink} from "react-router-dom";
import {makeStyles, Theme} from "@material-ui/core/styles";
import React, {useRef, useState} from "react";
import {Popper} from "@material-ui/core";
import Fade from "@material-ui/core/Fade";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ConceptIcon from "./ConceptIcon";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Typography from "@material-ui/core/Typography";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import {useFindConceptQuery} from "../generated/types";
import SearchField from "./SearchField";
import {Domain, getEntityType} from "../domain";

const useStyles = makeStyles((theme: Theme) => ({
    searchResults: {
        'z-index': theme.zIndex.modal
    },
    searchContent: {
        'margin-top': theme.spacing(1),
        'min-width': '150px',
        'max-width': '400px',
        'padding': theme.spacing(2)
    },
    entityIcon: {
        'min-width': 32
    }
}));

interface QuickSearchWidgetProps {
    className?: string
}

export function QuickSearchWidget(props: QuickSearchWidgetProps) {
    const classes = useStyles();
    const searchInput = useRef(null);
    const [query, setQuery] = useState("");
    const {loading, error, data} = useFindConceptQuery({
        skip: !query,
        variables: {
            input: {
                query,
                entityTypeIn: Domain.map(x => x.recordType)
            }
        }
    })
    const open = Boolean(!error && !loading && query);
    const id = open ? 'transitions-popper' : undefined;

    const results: React.ReactNode[] = [];
    if (data?.search.nodes) {
        for (const item of data.search.nodes) {
            const entryType = item.__typename.substring(3);
            const tags = item.tags.map(tag => tag.id);
            const entityType = getEntityType(entryType, tags);

            if (!entityType) continue;

            results.push(
                <ListItem
                    key={item.id}
                    button
                    component={RouterLink}
                    to={`/${entityType.path}/${item.id}`}
                    disableGutters
                    onClick={() => setQuery("")}
                >
                    <ListItemIcon className={classes.entityIcon}>
                        <ConceptIcon typeName={item.__typename} tags={item.tags}/>
                    </ListItemIcon>
                    <ListItemText primary={item.name} secondary={item.description}/>
                </ListItem>
            );
        }
    }

    return (
        <div ref={searchInput} className={props.className}>
            <SearchField
                placeholder="Search..."
                value={query}
                onChange={e => setQuery(e.target.value)}
            />
            <ClickAwayListener onClickAway={() => setQuery("")}>
                <Popper
                    id={id}
                    open={open}
                    anchorEl={searchInput.current}
                    placement="bottom-end"
                    transition
                    className={classes.searchResults}
                >
                    {({TransitionProps}) => (
                        <Fade {...TransitionProps} timeout={350}>
                            <Paper className={classes.searchContent}>
                                <Typography variant="body1">{data?.search.totalElements} Ergebnisse</Typography>
                                <List dense disablePadding>
                                    {results}
                                </List>
                            </Paper>
                        </Fade>
                    )}
                </Popper>
            </ClickAwayListener>
        </div>
    );
}
