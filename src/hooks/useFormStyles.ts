import makeStyles from "@mui/styles/makeStyles";
import {TextFieldProps} from "@mui/material/TextField";

export const defaultFormFieldOptions: TextFieldProps = {
    autoComplete: "off",
    // fullWidth: true,
    size: "small",
    variant: "outlined",
};

const useFormStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(1),
    },
    form: {
        display: "flex",
        flexDirection: "column",
        "& > *": {
            marginBottom: theme.spacing(3)
        }
    },
    buttonGroup: {
        alignSelf: "end"
    }
}));

export default useFormStyles;
