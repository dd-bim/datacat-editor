import {useNavigate} from "react-router-dom";
import { styled } from "@mui/material/styles";
import {useRef, useState} from "react";
import {Popper} from "@mui/material";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import {SearchResultPropsFragment, useFindItemQuery} from "../generated/types";
import SearchField from "./SearchField";
import {Domain, getEntityType} from "../domain";
import useDebounce from "../hooks/useDebounce";
import ItemRow, {ITEM_ROW_SIZE, ItemRowDataProps} from "./list/ItemRow";
import {List as VirtualizedList} from "react-window";
import LinearProgress from "@mui/material/LinearProgress";

// Type für react-window v2.x onRowsRendered callback
interface OnRowsRenderedProps {
    visibleRows: {
        startIndex: number;
        stopIndex: number;
    };
    allRows: {
        startIndex: number;
        stopIndex: number;
    };
}

// Replace makeStyles with styled components
const SearchResultsPopper = styled(Popper)(({ theme }) => ({
  zIndex: theme.zIndex.modal
}));

const SearchContentPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(1),
  width: '100%',
  padding: theme.spacing(2)
}));

const EntityIconDiv = styled('div')({
  minWidth: 32
});

interface QuickSearchWidgetProps {
    className?: string
}

export function QuickSearchWidget(props: QuickSearchWidgetProps) {
    const navigate = useNavigate();
    const searchInput = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");

    const debouncedSearchTerm = useDebounce(searchTerm, 800); // Längere Verzögerung
    const input = {
        query: debouncedSearchTerm
    };

    const {error, loading, data, fetchMore} = useFindItemQuery({
        skip: !debouncedSearchTerm || debouncedSearchTerm.length < 2, // Erst ab 2 Zeichen suchen
        variables: {
            input,
            pageSize: 10,
            pageNumber: 0
        },
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: false, // Verhindert unnötige Loading-Updates
        fetchPolicy: 'cache-first' // Cache first für bessere Performance
    });
    // const items = data?.search.nodes ?? [];
    const items: SearchResultPropsFragment[] = (data?.search.nodes || []).map((record: any) => {
        if (record.recordType === "Dictionary" && record.dname?.texts?.length > 0) {
          return {
            ...record,
            name: record.dname.texts[0].text,
          };
        }
        return record;
      });
    const pageInfo = data?.search.pageInfo;

    const handleOnScroll = async (visibleRows: OnRowsRenderedProps['visibleRows'], allRows: OnRowsRenderedProps['allRows']) => {
        const {stopIndex} = visibleRows;

        if (pageInfo?.hasNext && stopIndex >= items.length - 5) {
            await fetchMore({
                variables: {
                    input,
                    pageSize: 10,
                    pageNumber: pageInfo.pageNumber + 1
                }
            });
        }
    }

    const open = Boolean(!error && debouncedSearchTerm && debouncedSearchTerm.length >= 2 && (data?.search?.nodes?.length || 0) > 0);
    const id = open ? 'transitions-popper' : undefined;

    // Wrapper-Komponente für react-window v2.x
    const RowComponent = (rowProps: {
        ariaAttributes: { "aria-posinset": number; "aria-setsize": number; role: "listitem" };
        index: number;
        style: React.CSSProperties;
        items: SearchResultPropsFragment[];
        disabledItems: string[];
        showRecordIcons: boolean;
        onSelect?(item: SearchResultPropsFragment): void;
    }) => {
        return <ItemRow {...rowProps} />;
    };

    const listItems: ItemRowDataProps = {
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
                <SearchResultsPopper
                    id={id}
                    open={open}
                    anchorEl={searchInput.current}
                    placement="bottom-end"
                    transition
                >
                    {({TransitionProps}) => (
                        <Fade {...TransitionProps} timeout={350}>
                            <SearchContentPaper>
                                <Typography variant="body1">{data?.search.totalElements} Ergebnisse</Typography>
                                {loading && <LinearProgress/>}
                                <VirtualizedList<ItemRowDataProps>
                                    defaultHeight={200}
                                    rowHeight={ITEM_ROW_SIZE}
                                    rowCount={items.length}
                                    rowProps={listItems}
                                    onRowsRendered={handleOnScroll}
                                    rowComponent={RowComponent}
                                    style={{width: 400}}
                                />
                            </SearchContentPaper>
                        </Fade>
                    )}
                </SearchResultsPopper>
            </ClickAwayListener>
        </div>
    );
}
