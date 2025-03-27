import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";
import { Paper, Typography, Grid, Button } from "@mui/material";
import PlusIcon from "@mui/icons-material/Add";
import {
  Entity
} from "../domain";
import CreateEntryButton from "../components/CreateEntryButton";
import SearchList from "../components/list/SearchList";
import { CatalogRecord } from "../types";
import { T } from "@tolgee/react";
import { AppContext } from "../context/AppContext";

const useStyles = makeStyles((theme: Theme) => ({
  searchList: {
    padding: theme.spacing(2),
    position: "sticky",
    top: "88px",
  },
  paper: {
    padding: theme.spacing(2),
  },
  hint: {
    flexGrow: 1,
    textAlign: "center",
    color: theme.palette.grey[600],
    padding: theme.spacing(5),
  },
}));

type CompositeCatalogEntryViewProps = {
  entryType: Entity;
  renderForm(id: string): React.ReactNode;
};

const CompositeCatalogEntryView = (props: CompositeCatalogEntryViewProps) => {
  // Add context to force re-render on language change
  const { refreshCounter } = useContext(AppContext) || { refreshCounter: 0 };
  
  const {
    entryType: { tags, path, title, titlePlural, recordType },
    renderForm,
  } = props;
  
  // Force extracting these values when refreshCounter changes to ensure they update
  const currentTitle = title;
  const currentTitlePlural = titlePlural;
  
  const [height, setHeight] = useState(500);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  
  // Reset height and search term when changing entity types
  useEffect(() => {
    setHeight(500);
    setSearchTerm("");
  }, [path, recordType, refreshCounter]); // Add refreshCounter here

  const searchInput = {
    entityTypeIn: [recordType],
    tagged: tags,
  };
  const classes = useStyles();

  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const handleOnSelect = (value: CatalogRecord) => {
    navigate(`/${path}/${value.id}`);
  };

  // Use the entryType directly instead of trying to compare translated titles
  const entryTypeName = props.entryType;

  return (
    // Add refreshCounter to the key to force re-rendering on language changes
    <Grid container spacing={1} key={`entity-view-${path}-${refreshCounter}`}>
      <Grid item xs={4}>
        <Paper className={classes.searchList}>
          <Typography variant="h5">{currentTitlePlural}</Typography>
          <SearchList
            showRecordIcons={false}
            height={height}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            searchInput={searchInput}
            disabledItems={id ? [id] : undefined}
            onSelect={handleOnSelect}
          />
          <Button
            disabled={height >= 1500}
            onClick={() => setHeight(height + 250)}
            startIcon={<PlusIcon />}
          >
            <T keyName="composite_catalog_entry_view.more_results" />
          </Button>

          <CreateEntryButton EntryType={entryTypeName} />
        </Paper>
      </Grid>
      <Grid item xs={8}>
        <Paper className={classes.paper}>
          <Typography variant="h5">
            <T keyName="composite_catalog_entry_view.edit_entry" params={{ title: currentTitle }} />
          </Typography>
          {id ? (
            renderForm(id)
          ) : (
            <Typography className={classes.hint} variant="body1">
              <T keyName="composite_catalog_entry_view.select_entry" params={{ title: currentTitle }} />
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CompositeCatalogEntryView;

