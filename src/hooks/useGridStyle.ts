import makeStyles from "@mui/styles/makeStyles";

const useGridStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(2),
    },
    paragraph: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1.5)
    },
    form: {
        "& > *": {
            marginBottom: theme.spacing(1.5)
        }
    }
}));

export default useGridStyles;
