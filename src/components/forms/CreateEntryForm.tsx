import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import { defaultFormFieldOptions } from "../../hooks/useFormStyles";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { T } from "@tolgee/react";

const FormContainer = styled('form')(({ theme }) => ({
  "& > *": {
    marginBottom: theme.spacing(1.5),
  },
}));

export type CreateEntryFormValues = {
  id: string;
  majorVersion: number;
  minorVersion: number;
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
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues,
  });

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <div style={{ marginBottom: "12px" }}></div>

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
                Benennen Sie das Konzept im fachlichen Kontext und möglichst
                genau. Trennen Sie Synonyme durch Semikolon voneinander ab.
              </T>
            }
            error={!!errors.name}
            required
            {...defaultFormFieldOptions}
          />
        )}
      />
      <div style={{ marginBottom: "12px" }}></div>

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={
              <T keyName="create_entry_form.description_label">
                Beschreibung (de)
              </T>
            }
            helperText={
              <T keyName="create_entry_form.description_helper">
                Beschreiben Sie das Konzept in seiner Bedeutung. Nutzen Sie die
                Beschreibung insbesondere, um es von womöglich gleich benannten,
                aber fachlich verschiedenen Konzepten abzugrenzen.
              </T>
            }
            error={!!errors.description}
            {...defaultFormFieldOptions}
          />
        )}
      />
      <div style={{ marginBottom: "12px" }}></div>

      <Controller
        name="comment"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={
              <T keyName="create_entry_form.comment_label">Kommentar (de)</T>
            }
            helperText={
              <T keyName="create_entry_form.comment_helper">
                Hinterlassen Sie einen Kommentar zu diesem Konzept. Hier können
                zusätzliche Informationen zwischen Bearbeitern ausgetauscht
                werden.
              </T>
            }
            error={!!errors.comment}
            {...defaultFormFieldOptions}
          />
        )}
      />
      <div style={{ marginBottom: "12px" }}></div>

      <Controller
        name="id"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={<T keyName="create_entry_form.id_label">ID</T>}
            helperText={
              <T keyName="create_entry_form.id_helper">
                Die ID wird in der Regel automatisch generiert. Eine ID kann
                angegeben werden, wenn diese bereits in einem übergeordnetem
                Kontext für das Konzept vergeben wurde.
              </T>
            }
            error={!!errors.id}
            {...defaultFormFieldOptions}
          />
        )}
      />
      <div style={{ marginBottom: "12px" }}></div>

      <Controller
        name="majorVersion"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={
              <T keyName="create_entry_form.version_id_label">Version ID</T>
            }
            error={!!errors.majorVersion}
            {...defaultFormFieldOptions}
          />
        )}
      />
      <Controller
        name="minorVersion"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={
              <T keyName="create_entry_form.version_date_label">Version date</T>
            }
            error={!!errors.minorVersion}
            {...defaultFormFieldOptions}
          />
        )}
      />

      <Button type="submit" variant="contained">
        <T keyName="create_entry_form.save_button">Speichern</T>
      </Button>
    </FormContainer>
  );
};

export default CreateEntryForm;
