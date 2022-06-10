import React, {useState} from "react";
import {useHistory, useParams} from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Paper} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {
    ClassEntity,
    DocumentEntity,
    Entity,
    GroupEntity,
    MeasureEntity,
    ModelEntity,
    PropertyEntity,
    PropertyGroupEntity,
    UnitEntity,
    ValueEntity,
} from "../domain";
import CreateEntryButton from "../components/CreateEntryButton";
import PlusIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";
import SearchList from "../components/list/SearchList";
import {CatalogRecord} from "../types";

const useStyles = makeStyles(theme => ({
    searchList: {
        padding: theme.spacing(2),
        position: "sticky",
        top: "88px"
    },
    paper: {
        padding: theme.spacing(2),
    },
    hint: {
        flexGrow: 1,
        textAlign: "center",
        color: theme.palette.grey[600],
        padding: theme.spacing(5)
    }
}));

type CompositeCatalogEntryViewProps = {
    entryType: Entity,
    renderForm(id: string): React.ReactNode
}

const CompositeCatalogEntryView = (props: CompositeCatalogEntryViewProps) => {
    const {
        entryType: {
            tags,
            path,
            title,
            titlePlural,
            recordType
        },
        renderForm
    } = props;
    const [height, setHeight] = useState(500);
    const [searchTerm, setSearchTerm] = useState("");
    const searchInput = {
        entityTypeIn: [recordType],
        tagged: tags
    }
    const classes = useStyles();

    const history = useHistory();
    const {id} = useParams<{ id?: string }>()

    const handleOnSelect = (value: CatalogRecord) => {
        history.push(`/${path}/${value.id}`);
    };

    // Button-Zuweisung je nach gewählten Entitätstyp

    var entryTypeName;
    if (title === 'Referenzdokument') {
        entryTypeName = DocumentEntity
    } 
    else if (title === 'Fachmodell') {
        entryTypeName = ModelEntity
    } 
    else if (title === 'Gruppe') {
        entryTypeName = GroupEntity
    } 
    else if (title === 'Klasse') {
        entryTypeName = ClassEntity
    } 
    else if (title === 'Merkmalsgruppe') {
        entryTypeName = PropertyGroupEntity
    } 
    else if (title === 'Merkmal') {
        entryTypeName = PropertyEntity
    } 
    else if (title === 'Größe') {
        entryTypeName = MeasureEntity
    } 
    else if (title === 'Maßeinheit') {
        entryTypeName = UnitEntity
    } 
    else if (title === 'Wert') {
        entryTypeName = ValueEntity
    } 
    else {
        entryTypeName = ClassEntity
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={4}>
                <Paper className={classes.searchList}>
                    <Typography variant="h5">
                        {titlePlural}
                    </Typography>
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
                        aria-label="Mehr Ergebnisse"
                        disabled={height >= 1500}
                        onClick={() => setHeight(height + 250)}
                        startIcon={<PlusIcon/>}
                    >
                        Mehr Ergebnisse
                    </Button>

                    <CreateEntryButton EntryType={entryTypeName}/>

                </Paper>
            </Grid>
            <Grid item xs={8}>
                <Paper className={classes.paper}>
                    <Typography variant="h5">
                        {title} bearbeiten
                    </Typography>
                    {id ? (
                        renderForm(id)
                    ) : (
                        <Typography className={classes.hint} variant="body1">
                            {title} in der Listenansicht auswählen um Eigenschaften anzuzeigen.
                        </Typography>
                    )}
                </Paper>
            </Grid>
        </Grid>
    )
}

export default CompositeCatalogEntryView;

