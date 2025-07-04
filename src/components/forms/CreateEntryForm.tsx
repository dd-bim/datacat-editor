import { FC, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import { defaultFormFieldOptions } from "../../hooks/useFormStyles";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { T } from "@tolgee/react";
import { Entity, DocumentEntity, ValueEntity, PropertyEntity, UnitEntity, ValueListEntity, DictionaryEntity } from "../../domain";
import LanguageSelectField from "./LanguageSelectField";
import CountrySelectField from "./CountrySelectField";
import Autocomplete from "@mui/material/Autocomplete";
import DictionarySelectField from "./DictionarySelectField";
import { useFindItemLazyQuery } from "../../generated/types";


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
  languageOfCreator: string;
  countryOfOrigin: string;
  languageTag?: string[];
  uri?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  dateOfPublication?: string;
  nominalValue?: string;
  dataType?: string;
  dataFormat?: string;
  scale?: string;
  base?: string;
  valueListLanguage?: string;
  dictionary?: string;
};

const dataTypeOptions = [
  { value: "XTD_STRING", label: "String" },
  { value: "XTD_INTEGER", label: "Integer" },
  { value: "XTD_REAL", label: "Real" },
  { value: "XTD_BOOLEAN", label: "Boolean" },
  { value: "XTD_RATIONAL", label: "Rational" },
  { value: "XTD_DATETIME", label: "DateTime" },
  { value: "XTD_COMPLEX", label: "Complex" }
];

const scaleOptions = [
  { value: "XTD_LINEAR", label: "Linear" },
  { value: "XTD_LOGARITHMIC", label: "Logarithmic" }
];

const baseOptions = [
  { value: "XTD_ONE", label: "1" },
  { value: "XTD_TWO", label: "2" },
  { value: "XTD_E", label: "e" },
  { value: "XTD_PI", label: "Pi" },
  { value: "XTD_TEN", label: "10" }
];

export type CreateEntryFormProps = {
  defaultValues: CreateEntryFormValues;
  onSubmit(values: CreateEntryFormValues): void;
  entityType: Entity;
};

const CreateEntryForm: FC<CreateEntryFormProps> = (props) => {
  const { defaultValues, onSubmit, entityType } = props;
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues,
    mode: "onChange"
  });
  const [checkName, { data }] = useFindItemLazyQuery();
  const [nameExists, setNameExists] = useState(false);

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <div style={{ marginBottom: "12px" }}></div>

      <Controller
        name="name"
        control={control}
        rules={{
          required: true,
          validate: async (value) => {
            if (!value) {
              setNameExists(false);
              return true;
            }
            const { data } = await checkName({
              variables: {
                input: { query: value },
                pageSize: 1,
                pageNumber: 0,
              },
              fetchPolicy: "network-only",
            });
            const exists = data?.search?.nodes?.some(
              (node) =>
                typeof node.name === "string" &&
                node.name.toLowerCase() === value.toLowerCase()
            );
            setNameExists(!!exists);
            return true;
          }
        }}
        render={({ field }) => (
          <TextField
            {...field}
            autoFocus
            label={<T keyName="create_entry_form.name_label">Name (de)</T>}
            helperText={
              errors.name
                ? errors.name.message
                : nameExists
                  ? (
                    <span style={{ color: "#e69138" }}>
                      <T keyName="create_entry_form.name_duplicate_hint"/>
                    </span>
                  )
                  : (
                    <T keyName="create_entry_form.name_helper"/>
                  )
            }
            error={!!errors.name}
            required
            {...defaultFormFieldOptions}
          />
        )}
      />
      <div style={{ marginBottom: "12px" }}></div>

      {entityType !== DictionaryEntity && (
        <div>
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
                  <T keyName="version.majorVersion_label" />
                }
                error={!!errors.majorVersion}
                {...defaultFormFieldOptions}
              />
            )}
          />
          <div style={{ marginBottom: "12px" }}></div>

          <Controller
            name="minorVersion"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  <T keyName="version.minorVersion_label" />
                }
                error={!!errors.minorVersion}
                {...defaultFormFieldOptions}
              />
            )}
          />
          <div style={{ marginBottom: "12px" }}></div>
        </div>
      )}

      {entityType !== ValueEntity && entityType !== DictionaryEntity && (
        <div>
          <Controller
            name="languageOfCreator"
            control={control}
            render={({ field }) => (
              <LanguageSelectField
                onChange={value => {
                  const codes = Array.isArray(value)
                    ? value.map(lang => lang.code)
                    : value?.code ? value.code : [];
                  field.onChange(codes);
                }}
                TextFieldProps={{
                  focused: true,
                  id: "languageOfCreator",
                  required: true,
                  label: <T keyName={"create_entry_form.languageOfCreator"} />,
                  helperText: <T keyName={"create_entry_form.languageOfCreator_helper"} />,
                }}
              />
            )}
          />
          <div style={{ marginBottom: "12px" }}></div>
          <Controller
            name="countryOfOrigin"
            control={control}
            render={({ field }) => (
              <CountrySelectField
                onChange={value => {
                  const codes = Array.isArray(value)
                    ? value.map(country => country.code)
                    : value?.code ? value.code : [];
                  field.onChange(codes);
                }}
                TextFieldProps={{
                  focused: true,
                  id: "countryOfOrigin",
                  required: true,
                  label: <T keyName={"create_entry_form.countryOfOrigin"} />,
                  helperText: <T keyName={"create_entry_form.countryOfOrigin_helper"} />,
                }}
              />
            )}
          />
        </div>
      )}

      <div style={{ marginBottom: "12px" }}></div>

      {entityType === DocumentEntity && (
        <div>
          <Controller
            name="uri"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  <T keyName="document.uri" />
                }
                helperText={
                  <T keyName="document.uri_helper" />
                }
                error={!!errors.uri}
                {...defaultFormFieldOptions}
              />
            )}
          />
          <div style={{ marginBottom: "12px" }}></div>

          <Controller
            name="author"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  <T keyName="document.author" />
                }
                helperText={
                  <T keyName="document.author_helper" />
                }
                error={!!errors.author}
                {...defaultFormFieldOptions}
              />
            )}
          />
          <div style={{ marginBottom: "12px" }}></div>

          <Controller
            name="isbn"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  <T keyName="document.isbn" />
                }
                helperText={
                  <T keyName="document.isbn_helper" />
                }
                error={!!errors.isbn}
                {...defaultFormFieldOptions}
              />
            )}
          />
          <div style={{ marginBottom: "12px" }}></div>

          <Controller
            name="publisher"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  <T keyName="document.publisher" />
                }
                helperText={
                  <T keyName="document.publisher_helper" />
                }
                error={!!errors.publisher}
                {...defaultFormFieldOptions}
              />
            )}
          />
          <div style={{ marginBottom: "12px" }}></div>

          <Controller
            name="dateOfPublication"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                label={
                  <T keyName="document.dateOfPublication" />
                }
                helperText={
                  <T keyName="document.dateOfPublication_helper" />
                }
                error={!!errors.dateOfPublication}
                slotProps={{
                  inputLabel: { shrink: true }
                }}
                {...defaultFormFieldOptions}
              />
            )}
          />
          <div style={{ marginBottom: "12px" }}></div>

          <Controller
            name="languageTag"
            control={control}
            render={({ field }) => (
              <LanguageSelectField
                multiple
                onChange={value => {
                  const codes = Array.isArray(value)
                    ? value.map(lang => lang.code)
                    : value?.code ? [value.code] : [];
                  field.onChange(codes);
                }}
                TextFieldProps={{
                  focused: true,
                  id: "languageTag",
                  required: false,
                  label: <T keyName={"translation_form.language"} />,
                  helperText: <T keyName={"translation_form.language_helper"} />,
                }}
              />
            )}
          />
        </div>
      )}

      {entityType === ValueEntity && (
        <Controller
          name="nominalValue"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={
                <T keyName="value.nominalValue" />
              }
              helperText={
                <T keyName="value.nominalValue_helper" />
              }
              error={!!errors.nominalValue}
              {...defaultFormFieldOptions}
            />
          )}
        />
      )}

      {entityType === PropertyEntity && (
        <div>
          <Controller
            name="dataType"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Autocomplete
                options={dataTypeOptions}
                value={dataTypeOptions.find(option => option.value === field.value) || null}
                onChange={(_, value) => field.onChange(value ? value.value : undefined)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={<T keyName="property.dataType" />}
                    helperText={<T keyName="property.dataType_helper" />}
                    error={!!errors.dataType}
                    {...defaultFormFieldOptions}
                  />
                )}
              />
            )}
          />
          <div style={{ marginBottom: "12px" }}></div>

          <Controller
            name="dataFormat"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  <T keyName="property.dataFormat" />
                }
                helperText={
                  <T keyName="property.dataFormat_helper" />
                }
                error={!!errors.dataFormat}
                {...defaultFormFieldOptions}
              />
            )}
          />
        </div>
      )}

      {entityType === UnitEntity && (
        <div>
          <Controller
            name="scale"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Autocomplete
                options={scaleOptions}
                value={scaleOptions.find(option => option.value === field.value) || null}
                onChange={(_, value) => field.onChange(value ? value.value : undefined)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={<T keyName="unit.scale" />}
                    helperText={<T keyName="unit.scale_helper" />}
                    error={!!errors.scale}
                    {...defaultFormFieldOptions}
                  />
                )}
              />
            )}
          />
          <div style={{ marginBottom: "12px" }}></div>

          <Controller
            name="base"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Autocomplete
                options={baseOptions}
                value={baseOptions.find(option => option.value === field.value) || null}
                onChange={(_, value) => field.onChange(value ? value.value : undefined)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={<T keyName="unit.base" />}
                    helperText={<T keyName="unit.base_helper" />}
                    error={!!errors.base}
                    {...defaultFormFieldOptions}
                  />
                )}
              />
            )}
          />
        </div>
      )}

      {entityType === ValueListEntity && (
        <Controller
          name="valueListLanguage"
          control={control}
          render={({ field }) => (
            <LanguageSelectField
              onChange={value => {
                const codes = Array.isArray(value)
                  ? value.map(lang => lang.code)
                  : value?.code ? value.code : [];
                field.onChange(codes);
              }}
              TextFieldProps={{
                focused: true,
                id: "valueListLanguage",
                required: true,
                label: <T keyName={"valuelist.language"} />,
                helperText: <T keyName={"valuelist.language_helper"} />,
              }}
            />
          )}
        />
      )}

      {entityType !== UnitEntity && entityType !== DictionaryEntity && (
        <Controller
          name="dictionary"
          control={control}
          render={({ field }) => (
            <DictionarySelectField
              onChange={dict => field.onChange(dict ? dict.id : null)}
              TextFieldProps={{
                focused: true,
                id: "dictionary",
                required: true,
                label: <T keyName={"create_entry_form.dictionary"} />,
                helperText: <T keyName={"create_entry_form.dictionary_helper"} />,
              }}
            />
          )}
        />
      )}

      <Button type="submit" variant="contained">
        <T keyName="create_entry_form.save_button">Speichern</T>
      </Button>
    </FormContainer>
  );
};

export default CreateEntryForm;
