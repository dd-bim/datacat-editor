import IconButton from "@material-ui/core/IconButton";
import UndoIcon from '@material-ui/icons/Undo';
import SaveIcon from "@material-ui/icons/Save";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import React, {FC} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {FormState} from "react-hook-form";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    }
}));

type InlineButtonGroupProps = {
    formState: FormState<any>
    onReset?(): void,
    onDelete?(): void
}

const InlineButtonGroup: FC<InlineButtonGroupProps> = (props) => {
    const {
        formState: {isDirty, isValid},
        onReset,
        onDelete
    } = props;
    const classes = useStyles();
    return (
        <div className={classes.root}>
            {onReset && (
                <IconButton
                    disabled={!isDirty}
                    onClick={onReset}
                    size="small"
                >
                    <UndoIcon/>
                </IconButton>
            )}
            {onDelete && (
                <IconButton
                    onClick={onDelete}
                    size="small"
                >
                    <DeleteForeverIcon/>
                </IconButton>
            )}
            <IconButton
                type="submit"
                disabled={!isDirty || !isValid}
                color="secondary"
                size="small"
            >
                <SaveIcon/>
            </IconButton>
        </div>
    )
};

export default InlineButtonGroup;
