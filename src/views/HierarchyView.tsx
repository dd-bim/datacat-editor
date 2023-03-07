import React, {FC} from "react";
import {useHistory, useRouteMatch} from "react-router-dom";
import LinearProgress from "@material-ui/core/LinearProgress";
import {Paper} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "@material-ui/core/Grid";
import {Route, Switch} from "react-router";
import DomainModelForm from "./forms/DomainModelForm";
import {Hierarchy} from "../components/Hierarchy";
import {ConceptPropsFragment, usePropertyTreeQuery} from "../generated/types";
import DomainGroupForm from "./forms/DomainGroupForm";
import DomainClassForm from "./forms/DomainClassForm";
import PropertyGroupForm from "./forms/PropertyGroupForm";
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
    }
}));

const HierarchyView: FC = () => {
    const history = useHistory();
    let {path, url} = useRouteMatch();
    const classes = useStyles();
    const {loading, error, data} = usePropertyTreeQuery({});

    const handleOnSelect = ({id, recordType, tags}: ConceptPropsFragment) => {
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

    let content;
    if (loading) {
        content = <LinearProgress/>;
    } else if (error) {
        content = <p>Beim Aufrufen des Merkmalsbaums ist ein Fehler aufgetreten.</p>;
    } else {
        content = (
            <Hierarchy
                leaves={data!.hierarchy.nodes}
                paths={data!.hierarchy.paths}
                onSelect={handleOnSelect}
            />
        );
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={5}>
                <Paper className={classes.paper}>
                    <Typography variant="h5">
                        Katalog durchsuchen
                    </Typography>
                    {content}
                </Paper>
            </Grid>
            <Grid item xs={7}>
                <Paper className={classes.paper}>
                    <Switch>
                        <Route exact path={`${path}/${ModelEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <DomainModelIcon/> Fachmodell bearbeiten
                                    </Typography>
                                    <DomainModelForm id={id} onDelete={handleOnDelete}/>
                                </React.Fragment>
                            );
                        }}/>
                        <Route exact path={`${path}/${GroupEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <DomainGroupIcon/> Gruppe bearbeiten
                                    </Typography>
                                    <DomainGroupForm id={id} onDelete={handleOnDelete}/>
                                </React.Fragment>
                            );
                        }}/>
                        <Route exact path={`${path}/${ClassEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <DomainClassIcon/> Klasse bearbeiten
                                    </Typography>
                                    <DomainClassForm id={id} onDelete={handleOnDelete}/>
                                </React.Fragment>
                            );
                        }}/>
                        <Route exact path={`${path}/${PropertyGroupEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <PropertyGroupIcon/> Merkmalsgruppe bearbeiten
                                    </Typography>
                                    <PropertyGroupForm id={id} onDelete={handleOnDelete}/>
                                </React.Fragment>
                            );
                        }}/>
                        <Route exact path={`${path}/${PropertyEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <PropertyIcon/> Merkmal bearbeiten
                                    </Typography>
                                    <PropertyForm id={id} onDelete={handleOnDelete}/>
                                </React.Fragment>
                            );
                        }}/>
                        <Route exact path={`${path}/${MeasureEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <MeasureIcon/> Größe bearbeiten
                                    </Typography>
                                    <MeasureForm id={id} onDelete={handleOnDelete}/>
                                </React.Fragment>
                            );
                        }}/>
                        <Route exact path={`${path}/${UnitEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <UnitIcon/> Einheit bearbeiten
                                    </Typography>
                                    <UnitForm id={id} onDelete={handleOnDelete}/>
                                </React.Fragment>
                            );
                        }}/>
                        <Route exact path={`${path}/${ValueEntity.path}/:id`} render={renderProps => {
                            const id: string = renderProps.match.params.id;
                            return (
                                <React.Fragment>
                                    <Typography variant="h5">
                                        <ValueIcon/> Wert bearbeiten
                                    </Typography>
                                    <ValueForm id={id} onDelete={handleOnDelete}/>
                                </React.Fragment>
                            );
                        }}/>
                        <Route>
                            <Typography className={classes.hint} variant="body1">
                                Konzept in der Baumansicht auswählen um Eigenschaften anzuzeigen.
                            </Typography>
                        </Route>
                    </Switch>
                </Paper>
            </Grid>
        </Grid>
    );
}

export default HierarchyView;
