import React, {ReactNode} from "react";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles(theme => ({
    root: {
        // "& > :not(:last-child)": {
        //     marginBottom: theme.spacing(1)
        // }
    }
}));

export type FormProps<T> = {
    id: string;
    onDelete?(): void;
};

export type WithChildren<T> = T & {
    children?: ReactNode
}

export default function FormView(props: WithChildren<{}>) {
    const {children} = props;
    const classes = useStyles();

    return (
        <div className={classes.root}>
            {children}
        </div>
    );
}
