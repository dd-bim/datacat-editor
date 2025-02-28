import {useNavigate} from "react-router-dom";
import {makeStyles} from "@mui/styles";
import {Theme} from "@mui/material/styles";
import React, {useRef, useState} from "react";
import {Popper} from "@mui/material";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import {useFindItemQuery} from "../generated/types";
import SearchField from "./SearchField";
import {Domain, getEntityType} from "../domain";
import useDebounce from "../hooks/useDebounce";
import ItemRow, {ITEM_ROW_SIZE, ItemRowProps} from "./list/ItemRow";
import {FixedSizeList, ListOnItemsRenderedProps} from "react-window";
import LinearProgress from "@mui/material/LinearProgress";

const useStyles = makeStyles((theme: Theme) => ({
    searchResults: {
        'z-index': theme.zIndex.modal
    },
    searchContent: {
        'margin-top': theme.spacing(1),
        'width': '100%',
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
    const navigate = useNavigate();
    const searchInput = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const input = {
        query: debouncedSearchTerm,
        entityTypeIn: Domain.map(x => x.recordType)
    };
    const {error, loading, data, fetchMore} = useFindItemQuery({
        skip: !debouncedSearchTerm,
        variables: {
            input,
            pageSize: 10,
            pageNumber: 0
        }
    });
    const items = data?.search.nodes ?? [];
    const pageInfo = data?.search.pageInfo;

    const handleOnScroll = async (props: ListOnItemsRenderedProps) => {
        const {visibleStopIndex} = props;

        if (pageInfo?.hasNext && visibleStopIndex >= items.length - 5) {
            await fetchMore({
                variables: {
                    input,
                    pageSize: 10,
                    pageNumber: pageInfo.pageNumber + 1
                }
            });
        }
    }

    const open = Boolean(!error && !loading && debouncedSearchTerm);
    const id = open ? 'transitions-popper' : undefined;

    const listItems: ItemRowProps = {
        items,
        disabledItems: [],
        showRecordIcons: true,
        onSelect: item => {
            const definition = getEntityType(item.recordType, item.tags.map(x => x.id));
            setSearchTerm("");
            navigate(`/${definition.path}/${item.id}`);
        }
    };

    return (
        <div ref={searchInput} className={props.className}>
            <SearchField
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <ClickAwayListener onClickAway={() => setSearchTerm("")}>
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
                                {loading && <LinearProgress/>}
                                <FixedSizeList
                                    height={200}
                                    width={400}
                                    itemSize={ITEM_ROW_SIZE}
                                    itemCount={items.length}
                                    itemData={listItems}
                                    outerElementType={List}
                                    onItemsRendered={handleOnScroll}
                                >
                                    {ItemRow}
                                </FixedSizeList>
                            </Paper>
                        </Fade>
                    )}
                </Popper>
            </ClickAwayListener>
        </div>
    );
}
