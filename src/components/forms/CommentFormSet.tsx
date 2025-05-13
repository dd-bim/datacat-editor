import React from "react";
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
import { styled } from "@mui/material/styles";
import {T} from "@tolgee/react";

// Replace makeStyles with styled component
const StyledFormSetDescription = styled(FormSetDescription)(({ theme }) => ({
    marginBottom: theme.spacing(1)
}));

type CommentFormSetProps = {
    catalogEntryId: string,
    comments: TranslationPropsFragment[]
}

const CommentFormSet = (props: CommentFormSetProps) => {
    const {catalogEntryId, comments} = props;
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
            <FormSetTitle><b><T keyName={"comment.title"}/></b></FormSetTitle>
            <StyledFormSetDescription>
                <T keyName={"comment.description"}/>
            </StyledFormSetDescription>

            <div style={{ marginBottom: "12px" }}></div>
            
            <TranslationFormSet
                label="Kommentar"
                translations={comments}
                min={0}
                onAdd={handleOnAdd}
                onUpdate={handleOnUpdate}
                onDelete={handleOnDelete}
                TextFieldProps={{
                    multiline: true,
                    maxRows: 10,
                }}
            />
        </FormSet>
    );
};

export default CommentFormSet;
