import React from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { T, useTranslate } from "@tolgee/react";
import { InfoButton } from "../InfoButton";

interface AttributeRequirementProps {
  requirement: any;
  index: number;
  applicabilityType: "type" | "classification";
  modelOptions: any[];
  allClassOptions: any[];
  onRequirementChange: (idx: number, value: any) => void;
  getPropertySetUri: (name: string) => string;
  getClassificationUri: (modelId: string) => string; // Für Classification URI
  DATA_TYPE_OPTIONS: string[];
}

export const AttributeRequirement: React.FC<AttributeRequirementProps> = ({
  requirement: req,
  index: idx,
  applicabilityType,
  modelOptions,
  allClassOptions,
  onRequirementChange: handleRequirementChange,
  getPropertySetUri,
  getClassificationUri, // Neue Prop für Classification URI
  DATA_TYPE_OPTIONS,
}) => {
  const { t } = useTranslate();

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
      <Autocomplete
        id={`attribute-autocomplete-${idx}`}
        options={applicabilityType === "classification" ? modelOptions : allClassOptions}
        getOptionLabel={(option: any) => 
          applicabilityType === "classification" 
            ? option.name || ""
            : `${option.name}${option.themeName ? ` (${option.themeName})` : ""}`
        }
        getOptionKey={(option: any) => option.id} // Eindeutige Keys
        value={
          applicabilityType === "classification"
            ? modelOptions.find((opt: any) => opt.id === req.value) || null
            : allClassOptions.find((opt: any) => opt.id === req.value) || null
        }
        onChange={(event, newValue) => {
          handleRequirementChange(idx, newValue?.id || "");
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={applicabilityType === "classification" 
              ? <T keyName="ids_export.labels.classification_system_select" />
              : <T keyName="ids_export.labels.class_select" />
            }
            placeholder={
              applicabilityType === "classification" 
                ? t("ids_export.placeholders.classification_system_search")
                : t("ids_export.placeholders.attribute_class_search")
            }
          />
        )}
        clearOnEscape
        clearIcon={req.value ? undefined : null}
      />
      
      {/* URI automatisch anzeigen für Attribute */}
      {req.value && (
        <TextField
          label={<T keyName="ids_export.labels.uri_automatic" />}
          value={
            applicabilityType === "classification"
              ? getClassificationUri(req.value) // Verwende getClassificationUri für Classification
              : getPropertySetUri(allClassOptions.find((c: any) => c.id === req.value)?.name || "")
          }
          fullWidth
          sx={{ mb: 1 }}
          InputProps={{ readOnly: true }}
        />
      )}
      
      {/* dataType Auswahl für Attribute */}
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <T keyName="ids_export.labels.datatype_optional" />
          </Typography>
          <InfoButton 
            titleKey="info_dialogs.datatype.title" 
            contentKey="info_dialogs.datatype.content" 
          />
        </Box>
        <Autocomplete
          id={`datatype-autocomplete-attribute-${idx}`}
          options={DATA_TYPE_OPTIONS}
          value={req.dataType || null}
          onChange={(event, newValue) => {
            handleRequirementChange(idx, {
              ...req,
              dataType: newValue || "",
            });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t("ids_export.placeholders.datatype_search")}
            />
          )}
          clearOnEscape
          clearIcon={req.dataType ? undefined : null}
        />
      </Box>
      
      {/* cardinality für Attribute */}
      <FormControl fullWidth sx={{ mb: 1 }}>
        <InputLabel id={`cardinality-attribute-label-${idx}`}><T keyName="ids_export.labels.cardinality" /></InputLabel>
        <Select
          labelId={`cardinality-attribute-label-${idx}`}
          value={req.cardinality || "required"}
          label={<T keyName="ids_export.labels.cardinality" />}
          onChange={(e) =>
            handleRequirementChange(idx, {
              ...req,
              cardinality: e.target.value,
            })
          }
        >
          <MenuItem value="required"><T keyName="ids_export.cardinality.required" /></MenuItem>
          <MenuItem value="optional"><T keyName="ids_export.cardinality.optional" /></MenuItem>
          <MenuItem value="prohibited"><T keyName="ids_export.cardinality.prohibited" /></MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
