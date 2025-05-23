import React from "react";
import FormSet, {FormSetDescription, FormSetTitle} from "./FormSet";
import {
    TranslationInput,
    TextPropsFragment,
    UpdateTextInput,
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
    comments: TextPropsFragment[]
    refetch: () => Promise<any>;
}

const CommentFormSet = (props: CommentFormSetProps) => {
    const {catalogEntryId, comments, refetch } = props;
    const {enqueueSnackbar} = useSnackbar();
    const [addComment] = useAddCommentMutation();
    const [updateComment] = useUpdateCommentMutation();
    const [deleteComment] = useDeleteCommentMutation();

    const handleOnAdd = async (text: TranslationInput) => {
        await addComment({
            variables: {
                input: {catalogEntryId, text}
            }
        });
        enqueueSnackbar("Kommentar hinzugefügt.");
        await refetch();
    };

    const handleOnUpdate = async (comment: UpdateTextInput) => {
        await updateComment({
            variables: {
                input: comment
            }
        });
        enqueueSnackbar("Kommentar aktualisiert.");
    };

    const handleOnDelete = async (textId: string) => {
        await deleteComment({
            variables: {
                input: { textId }
            }
        });
        enqueueSnackbar("Kommentar gelöscht.")
        await refetch();
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
