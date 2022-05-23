import React from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import LinearProgress from "@material-ui/core/LinearProgress";
import { ButtonGroup, Paper } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "@material-ui/core/Grid";
import { Route, Switch } from "react-router";
import DomainModelForm from "./forms/DomainModelForm";
import {
    FindPropGroupWithoutProp,
    FindPropWithoutSubjectOrPropGroup,
    FindModelWithoutGroup,
    FindGroupWithoutSubject,
    FindSubjectWithoutProp,
    FindMeasureWithoutProp,
    FindUnitWithoutMeasure,
    FindValueWithoutMeasure,
    FindMissingEnglishName,
    FindMultipleIDs,
    FindMissingDescription,
    FindMissingEnglishDescription,
    FindMultipleNames,
    FindMultipleNamesAcrossClasses
} from "../components/Verification";
import {
    ConceptPropsFragment,
    useFindPropGroupWithoutPropTreeQuery,
    useFindPropWithoutSubjectOrPropGroupTreeQuery,
    useFindModelWithoutGroupTreeQuery,
    useFindGroupWithoutSubjectTreeQuery,
    useFindSubjectWithoutPropTreeQuery,
    useFindMeasureWithoutPropTreeQuery,
    useFindUnitWithoutMeasureTreeQuery,
    useFindValueWithoutMeasureTreeQuery,
    useFindMissingEnglishNameTreeQuery,
    useFindMultipleIDsTreeQuery,
    useFindMissingDescriptionTreeQuery,
    useFindMissingEnglishDescriptionTreeQuery,
    useFindMultipleNamesTreeQuery,
    useFindMultipleNamesAcrossClassesTreeQuery
}
    from "../generated/types";
import DomainGroupForm from "./forms/DomainGroupForm";
import DomainClassForm from "./forms/DomainClassForm";
import PropertyGroupForm from "./forms/PropertyGroupForm";
import Button from "@material-ui/core/Button";
import {
    ClassEntity,
    DomainClassIcon,
    DomainGroupIcon,
    DomainModelIcon,
    getEntityType,
    GroupEntity,
    MeasureEntity,
    MeasureIcon,
    ModelEntity,
    PropertyEntity,
    PropertyGroupEntity,
    PropertyGroupIcon,
    PropertyIcon,
    UnitEntity,
    UnitIcon,
    ValueEntity,
    ValueIcon
} from "../domain";
import PropertyForm from "./forms/PropertyForm";
import MeasureForm from "./forms/MeasureForm";
import UnitForm from "./forms/UnitForm";
import ValueForm from "./forms/ValueForm";

const useStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(2),
    },
    tree: {
        display: "flex",
        padding: theme.spacing(1)
    },
    form: {
        display: "flex",
        flexDirection: "column",
        padding: theme.spacing(1),
        borderLeft: `${theme.spacing(.5)}px solid ${theme.palette.primary.light}`,
        borderRadius: theme.shape.borderRadius,
    },
    hint: {
        flexGrow: 1,
        textAlign: "center",
        color: theme.palette.grey[600],
        padding: theme.spacing(5)
    },
    headline: {
        marginBottom: 5,
        marginTop: 5
    }
}));

export function VerificationView() {

    const history = useHistory();
    let { path, url } = useRouteMatch();
    const classes = useStyles();
    const [selectButton, setSelectButton] = React.useState("");
    const [selectCategory, setSelectCategory] = React.useState("");

    const handleOnSelect = ({ id, recordType, tags }: ConceptPropsFragment) => {
        const entityType = getEntityType(recordType, tags.map(x => x.id));
        if (entityType) {
            history.push(`${url}/${entityType.path}/${id}`);
        } else {
            history.push(url);
        }
    };

    const handleOnDelete = () => {
        history.push(path);
    };

    const handleIntegrität = () => {
        setSelectButton('Integrität');
    };

    const handleEindeutigkeit = () => {
        setSelectButton('Eindeutigkeit');
    };

    const handleSprache = () => {
        setSelectButton('Sprache');
    };


    const handleIntegrität1 = () => {
        setSelectCategory('Fachmodelle ohne Gruppe');
    }

    const handleIntegrität2 = () => {
        setSelectCategory('Gruppen ohne Klasse');
    }

    const handleIntegrität3 = () => {
        setSelectCategory('Klassen ohne Merkmale/Merkmalsgruppen');
    }

    const handleIntegrität4 = () => {
        setSelectCategory('Merkmalsgruppen ohne Merkmale');
    }

    const handleIntegrität5 = () => {
        setSelectCategory('Merkmale ohne Klasse oder Merkmalsgruppe');
    }

    const handleIntegrität6 = () => {
        setSelectCategory('Größen die keinem Merkmal zugeordnet sind');
    }

    const handleIntegrität7 = () => {
        setSelectCategory('Einheiten ohne Größe');
    }

    const handleIntegrität8 = () => {
        setSelectCategory('Werte ohne Größe');
    }


    const handleEindeutigkeit1 = () => {
        setSelectCategory('ID-Duplikate');
    }

    const handleEindeutigkeit2 = () => {
        setSelectCategory('Namen-Duplikate (innerhalb eines Types)');
    }

    const handleEindeutigkeit3 = () => {
        setSelectCategory('Namen-Duplikate (gesamter Datenbestand)');
    }


    const handleSprache1 = () => {
        setSelectCategory('Fehlende Beschreibung');
    }

    const handleSprache2 = () => {
        setSelectCategory('Fehlende Beschreibung (englisch)');
    }

    const handleSprache3 = () => {
        setSelectCategory('Fehlende Namens-Übersetzung (englisch)');
    }

    function Kategorie() {
        return (
            <div>
                <Typography variant="h5">
                    Kategorie
                </Typography>
                <p></p>
            </div>
        )
    }

    function ShowButtons() {
        switch (selectButton) {
            case 'Integrität':
                return (
                    <div>
                        <Kategorie />
                        {/* <ButtonGroup orientation="vertical"> */}
                        <Grid container direction="column" alignItems="stretch">
                            <Grid item><Button onClick={() => handleIntegrität1()} style={{ textAlign: 'left' }}>Fachmodelle ohne Gruppe</Button></Grid>
                            <Grid item><Button onClick={() => handleIntegrität2()} style={{ textAlign: 'left' }}>Gruppen ohne Klasse</Button></Grid>
                            <Grid item><Button onClick={() => handleIntegrität3()} style={{ textAlign: 'left' }}>Klassen ohne Merkmale oder Merkmalsgruppen</Button></Grid>
                            <Grid item><Button onClick={() => handleIntegrität4()} style={{ textAlign: 'left' }}>Merkmalsgruppen ohne Merkmale</Button></Grid>
                            <Grid item><Button onClick={() => handleIntegrität5()} style={{ textAlign: 'left' }}>Merkmale ohne Klasse oder Merkmalsgruppe</Button></Grid>
                            <Grid item><Button onClick={() => handleIntegrität6()} style={{ textAlign: 'left' }}>Größen ohne Merkmal</Button></Grid>
                            <Grid item><Button onClick={() => handleIntegrität7()} style={{ textAlign: 'left' }}>Einheiten ohne Größe</Button></Grid>
                            <Grid item><Button onClick={() => handleIntegrität8()} style={{ textAlign: 'left' }}>Werte ohne Größe</Button></Grid>
                            {/* </ButtonGroup> */}
                        </Grid>
                    </div>
                )

            case 'Eindeutigkeit':
                return (
                    <div>
                        <Kategorie />
                        {/* <ButtonGroup orientation="vertical"> */}
                        <Grid container direction="column" alignItems="stretch">
                            <Grid item><Button onClick={() => handleEindeutigkeit1()} style={{ textAlign: 'left' }}>ID-Duplikate</Button></Grid>
                            <Grid item><Button onClick={() => handleEindeutigkeit2()} style={{ textAlign: 'left' }}>Namen-Duplikate (innerhalb eines Types)</Button></Grid>
                            <Grid item><Button onClick={() => handleEindeutigkeit3()} style={{ textAlign: 'left' }}>Namen-Duplikate (gesamter Datenbestand)</Button></Grid>
                            {/* </ButtonGroup> */}
                        </Grid>
                    </div>
                )

            case 'Sprache':
                return (
                    <div>
                        <Kategorie />
                        {/* <ButtonGroup orientation="vertical"> */}
                        <Grid container direction="column" alignItems="stretch" >
                            <Grid item><Button onClick={() => handleSprache1()} style={{ textAlign: 'left' }}>Fehlende Beschreibung</Button></Grid>
                            <Grid item><Button onClick={() => handleSprache2()} style={{ textAlign: 'left' }}>Fehlende Beschreibung (englisch)</Button></Grid>
                            <Grid item><Button onClick={() => handleSprache3()} style={{ textAlign: 'left' }}>Fehlende Namens-Übersetzung (englisch)</Button></Grid>
                            {/* </ButtonGroup> */}
                        </Grid>
                    </div>
                )

            default:
                return (
                    // <Paper className={classes.paper}>
                    //     <Typography variant="h5">
                    //         Bitte Kategorie zur Überprüfung auswählen!
                    //     </Typography>
                    // </Paper>
                    <div></div>
                );
        }
    }

    function ShowElements() {
        switch (selectCategory) {

            case 'Merkmalsgruppen ohne Merkmale':
                return (
                    <Paper className={classes.paper}>
                        <Typography variant="h5">
                            Merkmalsgruppen ohne Merkmale
                        </Typography>
                        <ThisFindPropGroupWithoutProp />
                    </Paper>
                )

            case 'Merkmale ohne Klasse oder Merkmalsgruppe':
                return (
                    <Paper className={classes.paper}>
                        <Typography variant="h5">
                            Merkmale ohne Klasse oder Merkmalsgruppe
                        </Typography>
                        <ThisFindPropWithoutSubjectOrPropGroup />
                    </Paper>
                )

            case 'Fachmodelle ohne Gruppe':
                return (
                    <Paper className={classes.paper}>
                        <Typography variant="h5">
                            Fachmodelle ohne Gruppe
                        </Typography>
                        <ThisFindModelWithoutGroup />
                    </Paper>
                )

            case 'Gruppen ohne Klasse':
                return (
                    <Paper className={classes.paper}>
                        <Typography variant="h5">
                            Gruppen ohne Klasse
                        </Typography>
                        <ThisFindGroupWithoutSubject />
                    </Paper>
                )

            case 'Klassen ohne Merkmale/Merkmalsgruppen':
                return (
                    <Paper className={classes.paper}>
                        <Typography variant="h5">
                            Klassen ohne Merkmale oder Merkmalsgruppen
                        </Typography>
                        <ThisFindSubjectWithoutProp />
                    </Paper>
                )

            case 'Werte ohne Größe':
                return (
                    <Paper className={classes.paper}>
                        <Typography variant="h5">
                            Werte ohne Größe
                        </Typography>
                        <ThisFindValueWithoutMeasure />
                    </Paper>
                )

            case 'Einheiten ohne Größe':
                return (
                    <Paper className={classes.paper}>
                        <Typography variant="h5">
                            Einheiten ohne Größe
                        </Typography>
                        <ThisFindUnitWithoutMeasure />
                    </Paper>
                )

            case 'Größen die keinem Merkmal zugeordnet sind':
                return (
                    <Paper className={classes.paper}>
                        <Typography variant="h5">
                            Größen die keinem Merkmal zugeordnet sind
                        </Typography>
                        <ThisFindMeasureWithoutProp />
                    </Paper>
                )

            case 'Fehlende Namens-Übersetzung (englisch)':
                return (
                    <Paper className={classes.paper}>
                        <Typography variant="h5">
                            Fehlende Namens-Übersetzung (englisch)
                        </Typography>
                        <ThisFindMissingEnglishName />
                    </Paper>
                );

            case 'ID-Duplikate':
                return (
                    <Paper className={classes.paper}>
                        <Typography variant="h5">
                            ID-Duplikate
                        </Typography>
                        <ThisFindMultipleIDs />
                    </Paper>
                );

            case 'Fehlende Beschreibung':
                return (
                    <Paper className={classes.paper}>
                        <Typography variant="h5">
                            Fehlende Beschreibung
                        </Typography>
                        <ThisFindMissingDescription />
                    </Paper>
                );

            case 'Fehlende Beschreibung (englisch)':
                return (
                    <Paper className={classes.paper}>
                        <Typography variant="h5">
                            Fehlende Beschreibung (englisch)
                        </Typography>
                        <ThisFindMissingEnglishDescription />
                    </Paper>
                );

            case 'Namen-Duplikate (innerhalb eines Types)':
                return (
                    <Paper className={classes.paper}>
                        <Typography variant="h5">
                            Namen-Duplikate (innerhalb eines Types)
                        </Typography>
                        <ThisFindMultipleNames />
                    </Paper>
                );

            case 'Namen-Duplikate (gesamter Datenbestand)':
                return (
                    <Paper className={classes.paper}>
                        <Typography variant="h5">
                            Namen-Duplikate  (gesamter Datenbestand)
                        </Typography>
                        <ThisFindMultipleNamesAcrossClasses />
                    </Paper>
                    );

            default:
                return (
                    <Paper className={classes.paper}>

                        <Typography className={classes.hint} variant="body1">
                            Prüfkriterium und Kategorie auswählen.
                        </Typography>

                    </Paper>
                );
        }
    }

    function ThisFindPropGroupWithoutProp() {
        const { loading, error, data } = useFindPropGroupWithoutPropTreeQuery({});
        let content;
        if (loading) {
            content = <LinearProgress />;
        } else if (error) {
            content = <p>Beim Aufrufen der Prüfroutine ist ein Fehler aufgetreten.</p>;
        } else {
            content = (
                <FindPropGroupWithoutProp
                    leaves={data!.findPropGroupWithoutProp.nodes}
                    paths={data!.findPropGroupWithoutProp.paths}
                    onSelect={handleOnSelect}
                />
            );
        }
        return content;
    }

    function ThisFindPropWithoutSubjectOrPropGroup() {
        const { loading, error, data } = useFindPropWithoutSubjectOrPropGroupTreeQuery({});
        let content;
        if (loading) {
            content = <LinearProgress />;
        } else if (error) {
            content = <p>Beim Aufrufen der Prüfroutine ist ein Fehler aufgetreten.</p>;
        } else {
            content = (
                <FindPropWithoutSubjectOrPropGroup
                    leaves={data!.findPropWithoutSubjectOrPropGroup.nodes}
                    paths={data!.findPropWithoutSubjectOrPropGroup.paths}
                    onSelect={handleOnSelect}
                />
            );
        }
        return content;
    }

    function ThisFindModelWithoutGroup() {
        const { loading, error, data } = useFindModelWithoutGroupTreeQuery({});
        let content;
        if (loading) {
            content = <LinearProgress />;
        } else if (error) {
            content = <p>Beim Aufrufen der Prüfroutine ist ein Fehler aufgetreten.</p>;
        } else {
            content = (
                <FindModelWithoutGroup
                    leaves={data!.findModelWithoutGroup.nodes}
                    paths={data!.findModelWithoutGroup.paths}
                    onSelect={handleOnSelect}
                />
            );
        }
        return content;
    }

    function ThisFindGroupWithoutSubject() {
        const { loading, error, data } = useFindGroupWithoutSubjectTreeQuery({});
        let content;
        if (loading) {
            content = <LinearProgress />;
        } else if (error) {
            content = <p>Beim Aufrufen der Prüfroutine ist ein Fehler aufgetreten.</p>;
        } else {
            content = (
                <FindGroupWithoutSubject
                    leaves={data!.findGroupWithoutSubject.nodes}
                    paths={data!.findGroupWithoutSubject.paths}
                    onSelect={handleOnSelect}
                />
            );
        }
        return content;
    }

    function ThisFindSubjectWithoutProp() {
        const { loading, error, data } = useFindSubjectWithoutPropTreeQuery({});
        let content;
        if (loading) {
            content = <LinearProgress />;
        } else if (error) {
            content = <p>Beim Aufrufen der Prüfroutine ist ein Fehler aufgetreten.</p>;
        } else {
            content = (
                <FindSubjectWithoutProp
                    leaves={data!.findSubjectWithoutProp.nodes}
                    paths={data!.findSubjectWithoutProp.paths}
                    onSelect={handleOnSelect}
                />
            );
        }
        return content;
    }

    function ThisFindMeasureWithoutProp() {
        const { loading, error, data } = useFindMeasureWithoutPropTreeQuery({});
        let content;
        if (loading) {
            content = <LinearProgress />;
        } else if (error) {
            content = <p>Beim Aufrufen der Prüfroutine ist ein Fehler aufgetreten.</p>;
        } else {
            content = (
                <FindMeasureWithoutProp
                    leaves={data!.findMeasureWithoutProp.nodes}
                    paths={data!.findMeasureWithoutProp.paths}
                    onSelect={handleOnSelect}
                />
            );
        }
        return content;
    }


    function ThisFindUnitWithoutMeasure() {
        const { loading, error, data } = useFindUnitWithoutMeasureTreeQuery({});
        let content;
        if (loading) {
            content = <LinearProgress />;
        } else if (error) {
            content = <p>Beim Aufrufen der Prüfroutine ist ein Fehler aufgetreten.</p>;
        } else {
            content = (
                <FindUnitWithoutMeasure
                    leaves={data!.findUnitWithoutMeasure.nodes}
                    paths={data!.findUnitWithoutMeasure.paths}
                    onSelect={handleOnSelect}
                />
            );
        }
        return content;
    }


    function ThisFindValueWithoutMeasure() {
        const { loading, error, data } = useFindValueWithoutMeasureTreeQuery({});
        let content;
        if (loading) {
            content = <LinearProgress />;
        } else if (error) {
            content = <p>Beim Aufrufen der Prüfroutine ist ein Fehler aufgetreten.</p>;
        } else {
            content = (
                <FindValueWithoutMeasure
                    leaves={data!.findValueWithoutMeasure.nodes}
                    paths={data!.findValueWithoutMeasure.paths}
                    onSelect={handleOnSelect}
                />
            );
        }
        return content;
    }


    function ThisFindMissingEnglishName() {
        const { loading, error, data } = useFindMissingEnglishNameTreeQuery({});
        let content;
        if (loading) {
            content = <LinearProgress />;
        } else if (error) {
            content = <p>Beim Aufrufen der Prüfroutine ist ein Fehler aufgetreten.</p>;
        } else {
            content = (
                <FindMissingEnglishName
                    leaves={data!.findMissingEnglishName.nodes}
                    paths={data!.findMissingEnglishName.paths}
                    onSelect={handleOnSelect}
                />
            );
        }
        return content;
    }

    function ThisFindMultipleIDs() {
        const { loading, error, data } = useFindMultipleIDsTreeQuery({});
        let content;
        if (loading) {
            content = <LinearProgress />;
        } else if (error) {
            content = <p>Beim Aufrufen der Prüfroutine ist ein Fehler aufgetreten.</p>;
        } else {
            content = (
                <FindMultipleIDs
                    leaves={data!.findMultipleIDs.nodes}
                    paths={data!.findMultipleIDs.paths}
                    onSelect={handleOnSelect}
                />
            );
        }
        return content;
    }

    function ThisFindMissingDescription() {
        const { loading, error, data } = useFindMissingDescriptionTreeQuery({});
        let content;
        if (loading) {
            content = <LinearProgress />;
        } else if (error) {
            content = <p>Beim Aufrufen der Prüfroutine ist ein Fehler aufgetreten.</p>;
        } else {
            content = (
                <FindMissingDescription
                    leaves={data!.findMissingDescription.nodes}
                    paths={data!.findMissingDescription.paths}
                    onSelect={handleOnSelect}
                />
            );
        }
        return content;
    }

    function ThisFindMissingEnglishDescription() {
        const { loading, error, data } = useFindMissingEnglishDescriptionTreeQuery({});
        let content;
        if (loading) {
            content = <LinearProgress />;
        } else if (error) {
            content = <div><p>Beim Aufrufen der Prüfroutine ist ein Fehler aufgetreten.</p><p>"Message: " + {error.message}</p></div>;
            console.log(error.message);
        } else {
            content = (
                <FindMissingEnglishDescription
                    leaves={data!.findMissingEnglishDescription.nodes}
                    paths={data!.findMissingEnglishDescription.paths}
                    onSelect={handleOnSelect}
                />
            );
        }
        return content;
    }

    function ThisFindMultipleNames() {
        const { loading, error, data } = useFindMultipleNamesTreeQuery({});
        let content;
        if (loading) {
            content = <LinearProgress />;
        } else if (error) {
            content = <p>Beim Aufrufen der Prüfroutine ist ein Fehler aufgetreten.</p>;
        } else {
            content = (
                <FindMultipleNames
                    leaves={data!.findMultipleNames.nodes}
                    paths={data!.findMultipleNames.paths}
                    onSelect={handleOnSelect}
                />
            );
        }
        return content;
    }

    function ThisFindMultipleNamesAcrossClasses() {
        const { loading, error, data } = useFindMultipleNamesAcrossClassesTreeQuery({});
        let content;
        if (loading) {
            content = <LinearProgress />;
        } else if (error) {
            content = <p>Beim Aufrufen der Prüfroutine ist ein Fehler aufgetreten.</p>;
        } else {
            content = (
                <FindMultipleNamesAcrossClasses
                    leaves={data!.findMultipleNamesAcrossClasses.nodes}
                    paths={data!.findMultipleNamesAcrossClasses.paths}
                    onSelect={handleOnSelect}
                />
            );
        }
        return content;
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={2}>
                <Paper className={classes.paper}>

                    <Typography variant="h5">
                        Prüfkriterium
                    </Typography>
                    <p></p>
                    <Grid container direction="column" alignItems="stretch">
                        <Grid item ><Button onClick={() => handleIntegrität()}>Integrität</Button></Grid>
                        <Grid item> <Button onClick={() => handleEindeutigkeit()}>Eindeutigkeit</Button></Grid>
                        <Grid item> <Button onClick={() => handleSprache()}>Sprache</Button></Grid>
                    </Grid>
                    {/* <Typography variant="h5">
                        Kategorie wählen
                    </Typography> */}
                    <p></p>
                    <ShowButtons />
                </Paper>
            </Grid>
            <Grid item xs={3}>
                <ShowElements />
            </Grid>
            <Grid item xs={7}>
                <Paper className={classes.paper}>
                    <Switch>
                        <Route exact path={`${path}/${ModelEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <DomainModelIcon /> Fachmodell bearbeiten
                                    </Typography>
                                    <DomainModelForm id={id} onDelete={handleOnDelete} />
                                </React.Fragment>
                            );
                        }} />
                        <Route exact path={`${path}/${GroupEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <DomainGroupIcon /> Gruppe bearbeiten
                                    </Typography>
                                    <DomainGroupForm id={id} onDelete={handleOnDelete} />
                                </React.Fragment>
                            );
                        }} />
                        <Route exact path={`${path}/${ClassEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <DomainClassIcon /> Klasse bearbeiten
                                    </Typography>
                                    <DomainClassForm id={id} onDelete={handleOnDelete} />
                                </React.Fragment>
                            );
                        }} />
                        <Route exact path={`${path}/${PropertyGroupEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <PropertyGroupIcon /> Merkmalsgruppe bearbeiten
                                    </Typography>
                                    <PropertyGroupForm id={id} onDelete={handleOnDelete} />
                                </React.Fragment>
                            );
                        }} />
                        <Route exact path={`${path}/${PropertyEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <PropertyIcon /> Merkmal bearbeiten
                                    </Typography>
                                    <PropertyForm id={id} onDelete={handleOnDelete} />
                                </React.Fragment>
                            );
                        }} />
                        <Route exact path={`${path}/${MeasureEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <MeasureIcon /> Größe bearbeiten
                                    </Typography>
                                    <MeasureForm id={id} onDelete={handleOnDelete} />
                                </React.Fragment>
                            );
                        }} />
                        <Route exact path={`${path}/${UnitEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <UnitIcon /> Einheit bearbeiten
                                    </Typography>
                                    <UnitForm id={id} onDelete={handleOnDelete} />
                                </React.Fragment>
                            );
                        }} />
                        <Route exact path={`${path}/${ValueEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <ValueIcon /> Wert bearbeiten
                                    </Typography>
                                    <ValueForm id={id} onDelete={handleOnDelete} />
                                </React.Fragment>
                            );
                        }} />
                        <Route>
                            <Typography className={classes.hint} variant="body1">
                                Prüfergebnis in der Listenansicht auswählen um Eigenschaften anzuzeigen.
                            </Typography>
                        </Route>
                    </Switch>
                </Paper>
            </Grid>
        </Grid>
    );
}

export default VerificationView;