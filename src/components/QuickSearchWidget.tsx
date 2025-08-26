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
import ItemRow, {ITEM_ROW_SIZE, ItemRowProps} from "./list/ItemRow";
import {FixedSizeList, ListOnItemsRenderedProps} from "react-window";
import LinearProgress from "@mui/material/LinearProgress";

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

    const open = Boolean(!error && debouncedSearchTerm && debouncedSearchTerm.length >= 2 && (data?.search?.nodes?.length || 0) > 0);
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
                            </SearchContentPaper>
                        </Fade>
                    )}
                </SearchResultsPopper>
            </ClickAwayListener>
        </div>
    );
}
