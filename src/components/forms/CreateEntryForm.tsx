import React, { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import { defaultFormFieldOptions } from "../../hooks/useFormStyles";
import { Button } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";
import { T } from "@tolgee/react";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    "& > *": {
      marginBottom: theme.spacing(1.5),
    },
  },
}));

export type CreateEntryFormValues = {
  id: string;
  versionId: string;
  versionDate: string;
  name: string;
  description: string;
  comment: string;
};

export type CreateEntryFormProps = {
  defaultValues: CreateEntryFormValues;
  onSubmit(values: CreateEntryFormValues): void;
};

const CreateEntryForm: FC<CreateEntryFormProps> = (props) => {
  const { defaultValues, onSubmit } = props;
  const classes = useStyles();
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={classes.root}>
      <Controller
        name="name"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <TextField
            {...field}
            autoFocus
            label={<T keyName="create_entry_form.name_label">Name (de)</T>}
            helperText={
              <T keyName="create_entry_form.name_helper">
                Benennen Sie das Konzept im fachlichen Kontext und möglichst genau. Trennen Sie Synonyme durch Semikolon voneinander ab.
              </T>
            }
            error={!!errors.name}
            required
            {...defaultFormFieldOptions}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={<T keyName="create_entry_form.description_label">Beschreibung (de)</T>}
            helperText={
              <T keyName="create_entry_form.description_helper">
                Beschreiben Sie das Konzept in seiner Bedeutung. Nutzen Sie die Beschreibung insbesondere, um es von womöglich gleich benannten, aber fachlich verschiedenen Konzepten abzugrenzen.
              </T>
            }
            error={!!errors.description}
            {...defaultFormFieldOptions}
          />
        )}
      />
      <Controller
        name="comment"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={<T keyName="create_entry_form.comment_label">Kommentar (de)</T>}
            helperText={
              <T keyName="create_entry_form.comment_helper">
                Hinterlassen Sie einen Kommentar zu diesem Konzept. Hier können zusätzliche Informationen zwischen Bearbeitern ausgetauscht werden.
              </T>
            }
            error={!!errors.comment}
            {...defaultFormFieldOptions}
          />
        )}
      />
      <Controller
        name="id"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={<T keyName="create_entry_form.id_label">ID</T>}
            helperText={
              <T keyName="create_entry_form.id_helper">
                Die ID wird in der Regel automatisch generiert. Eine ID kann angegeben werden, wenn diese bereits in einem übergeordnetem Kontext für das Konzept vergeben wurde.
              </T>
            }
            error={!!errors.id}
            {...defaultFormFieldOptions}
          />
        )}
      />
      <Controller
        name="versionId"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={<T keyName="create_entry_form.version_id_label">Version ID</T>}
            error={!!errors.versionId}
            {...defaultFormFieldOptions}
          />
        )}
      />
      <Controller
        name="versionDate"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={<T keyName="create_entry_form.version_date_label">Version date</T>}
            error={!!errors.versionDate}
            {...defaultFormFieldOptions}
          />
        )}
      />

      <Button type="submit" variant="contained">
        <T keyName="create_entry_form.save_button">Speichern</T>
      </Button>
    </form>
  );
};

export default CreateEntryForm;
