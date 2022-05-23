import React, {FC} from "react";
import FormSet, {FormSetDescription, FormSetTitle} from "./FormSet";
import {
    TranslationInput,
    TranslationPropsFragment,
    TranslationUpdateInput,
    useAddCommentMutation,
    useDeleteCommentMutation,
    useUpdateCommentMutation
} from "../../generated/types";
import {useSnackbar} from "notistack";
import TranslationFormSet from "./TranslationFormSet";
import makeStyles from "@material-ui/core/styles/makeStyles";

type CommentFormSetProps = {
    catalogEntryId: string,
    comments: TranslationPropsFragment[]
}

const useStyles = makeStyles(theme => ({
    description: {
        marginBottom: theme.spacing(1)
    }
}));

const CommentFormSet: FC<CommentFormSetProps> = (props) => {
    const {catalogEntryId, comments} = props;
    const classes = useStyles();

    const {enqueueSnackbar} = useSnackbar();
    const [addComment] = useAddCommentMutation();
    const [updateComment] = useUpdateCommentMutation();
    const [deleteComment] = useDeleteCommentMutation();

    const handleOnAdd = async (comment: TranslationInput) => {
        await addComment({
            variables: {
                input: {catalogEntryId, comment}
            }
        });
        enqueueSnackbar("Kommentar hinzugefügt.");
    };

    const handleOnUpdate = async (comment: TranslationUpdateInput) => {
        await updateComment({
            variables: {
                input: {catalogEntryId, comment}
            }
        });
        enqueueSnackbar("Kommentar aktualisiert.");
    };

    const handleOnDelete = async (commentId: string) => {
        await deleteComment({
            variables: {
                input: {catalogEntryId, commentId}
            }
        });
        enqueueSnackbar("Kommentar gelöscht.")
    };

    return (
        <FormSet>
            <FormSetTitle><b>Kommentar</b></FormSetTitle>
            <FormSetDescription className={classes.description}>
                Ermöglicht Bearbeitern den Austausch von zusätzlichen Informationen z.B. über den Bearbeitungsstand des Konzepts.
            </FormSetDescription>
            <TranslationFormSet
                label="Kommentar"
                translations={comments}
                min={0}
                onAdd={handleOnAdd}
                onUpdate={handleOnUpdate}
                onDelete={handleOnDelete}
                TextFieldProps={{
                    multiline: true,
                    rowsMax: 10,
                }}
            />
        </FormSet>
    );
};

export default CommentFormSet;
