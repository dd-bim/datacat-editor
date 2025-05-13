import IconButton from "@mui/material/IconButton";
import UndoIcon from '@mui/icons-material/Undo';
import SaveIcon from "@mui/icons-material/Save";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import React from "react";
import { styled } from "@mui/material/styles";
import { FormState } from "react-hook-form";

// Replace makeStyles with styled component
const ButtonContainer = styled('div')({
  display: "flex",
  flexDirection: "row",
  alignItems: "center"
});

type InlineButtonGroupProps = {
  formState: FormState<any>
  onReset?(): void,
  onDelete?(): void
}

const InlineButtonGroup = (props: InlineButtonGroupProps) => {
  const {
    formState: {isDirty, isValid},
    onReset,
    onDelete
  } = props;
  
  return (
    <ButtonContainer>
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
    </ButtonContainer>
  )
};

export default InlineButtonGroup;
