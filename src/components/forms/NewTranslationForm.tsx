import { Controller, useForm } from "react-hook-form";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { defaultFormFieldOptions } from "../../hooks/useFormStyles";
import LanguageSelectField from "./LanguageSelectField";
import InlineButtonGroup from "./InlineButtonGroup";
import { useEffect } from "react";
import {
  LanguagePropsFragment
} from "../../generated/graphql";
import { styled } from "@mui/material/styles";
import { T } from "@tolgee/react";

// Replace makeStyles with styled component
const FormContainer = styled('form')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  "& > *": {
    marginBottom: theme.spacing(1),
  },
}));

type NewTranslationFormValues = {
  id: string;
  languageTag: string;
  value: string;
};

type NewTranslationFormProps = {
  languageFilter?: string[];
  onCancel(): void;
  onSubmit(values: NewTranslationFormValues): void;
  TextFieldProps: Partial<
    Pick<TextFieldProps, "label" & "multiline" & "rows" & "maxRows">
  >;
};

const NewTranslationForm = (props: NewTranslationFormProps) => {
  const { languageFilter, onCancel, onSubmit, TextFieldProps } = props;
  const {
    watch,
    register,
    control,
    setValue,
    setError,
    handleSubmit,
    formState: { errors },
    formState,
  } = useForm<NewTranslationFormValues>({
    mode: "onChange",
    defaultValues: { id: "", languageTag: "", value: "" },
  });

  useEffect(() => {
    register("id");
    register("languageTag", { required: true });
  }, [register]);

  const lang = watch("languageTag");

  const onChange = (value: LanguagePropsFragment) => {
    if (value) {
      setValue("languageTag", value.code, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      setError("languageTag", {
        message: "Bitte wählen Sie eine Sprache.",
        type: "required",
      });
    }
  };
  return (
    <FormContainer
      onSubmit={handleSubmit(onSubmit)}
      lang={lang}
    >
      <div style={{ marginBottom: "12px" }}></div>

      <LanguageSelectField
        filter={languageFilter}
        onChange={onChange}
        TextFieldProps={{
          focused: true,
          id: "languageTag",
          required: true,
          label: <T keyName={"translation_form.language"} />,
          helperText: <T keyName={"translation_form.language_helper"} />,
        }}
      />
      <Controller
        control={control}
        name="value"
        rules={{ required: true }}
        render={({ field }) => (
          <TextField
            {...field}
            {...defaultFormFieldOptions}
            {...TextFieldProps}
            error={!!errors.value}
            required
          />
        )}
      />
      <div>
        <InlineButtonGroup formState={formState} onReset={onCancel} />
      </div>
    </FormContainer>
  );
};

export default NewTranslationForm;
