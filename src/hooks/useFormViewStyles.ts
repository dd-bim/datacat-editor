import makeStyles from "@mui/styles/makeStyles";

const useFormViewStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        "& > *": {
            marginBottom: theme.spacing(1)
        }
    },
    heading: {
        "& > svg": {
            verticalAlign: "text-bottom"
        }
    },
    addButton: {
        textAlign: "right"
    }
}));

export default useFormViewStyles;
