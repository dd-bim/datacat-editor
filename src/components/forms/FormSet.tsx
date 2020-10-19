import React, {FC} from "react";
import {Typography} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {TranslationPropsFragment} from "../../generated/types";

export const sortByLanguage = ({language: a}: TranslationPropsFragment, {language: b}: TranslationPropsFragment) => {
    return a.languageTag.localeCompare(b.languageTag);
};

export const useFormSetStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        marginBottom: theme.spacing(2),
        "& > *": {
            marginBottom: theme.spacing(1)
        },
    },
    title: {
        marginBottom: theme.spacing(0)
    },
    description: {
        marginBottom: theme.spacing(2)
    },
    addButton: {
        textAlign: "right"
    }
}));
type FormSetProps = {
    title: React.ReactNode
    description: string
}
export const FormSet: FC<FormSetProps> = (props) => {
    const {title, description, children} = props;
    const classes = useFormSetStyles();

    return (
        <div className={classes.root}>
            <Typography variant="subtitle2" className={classes.title}>
                {title}
            </Typography>

            <Typography variant="body2" color="textSecondary" className={classes.description}>
                {description}
            </Typography>

            {children}
        </div>
    );
}
