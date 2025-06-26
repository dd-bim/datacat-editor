import FormSet, { FormSetTitle } from "./FormSet";
import { FC } from "react";
import { useEffect } from "react";
import {
  useUpdateDataTypeMutation,
  DataTypeEnum
} from "../../generated/types";
import { useSnackbar } from "notistack";
import { styled } from "@mui/material/styles";
import { T } from "@tolgee/react";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { Controller, useForm } from "react-hook-form";

type DataTypeFormSetProps = {
  catalogEntryId: string;
  dataType: DataTypeEnum;
};

type DataTypeFormValues = {
  selectedDataType: DataTypeEnum;
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

// Replace makeStyles with styled component
const FormContainer = styled('form')(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  "& > *": {
    marginRight: theme.spacing(1),
  },
}));
const DataTypeFormSet: FC<DataTypeFormSetProps> = (props) => {
  const { catalogEntryId, dataType } = props;
  const { enqueueSnackbar } = useSnackbar();

  const [setDataType] = useUpdateDataTypeMutation();
  const {
    control,
    reset
  } = useForm<DataTypeFormValues>({
    mode: "onChange",
    defaultValues: { selectedDataType: dataType },
  });

  useEffect(() => {
    reset({ selectedDataType: dataType });
  }, [status, reset]);

  const handleChange = async (
    e: SelectChangeEvent<DataTypeEnum>,
    field: { onChange: (value: any) => void }
  ) => {
    field.onChange(e);
    await setDataType({
      variables: {
        input: { catalogEntryId, dataType: e.target.value },
      },
    });
    enqueueSnackbar("Datentyp aktualisiert.");
  };

  return (
    <FormSet>
      <FormContainer>
        <FormSetTitle sx={{ mr: 1 }}>
          <b>
            <T keyName="property.dataType" />
          </b>
        </FormSetTitle>
        <Controller
          name="selectedDataType"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              value={field.value}
              onChange={e => handleChange(e, field)}
              size="small"
              sx={{ minWidth: 120 }}
            >
              {dataTypeOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </FormContainer>
    </FormSet>
  );
};

export default DataTypeFormSet;
