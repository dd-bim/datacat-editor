import React from "react";
import {
  Box,
  TextField,
  Button,
  Autocomplete,
  Typography,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { T, useTranslate } from "@tolgee/react";
import { InfoButton } from "../InfoButton";
import CloseIcon from "@mui/icons-material/Close";

interface ClassificationRequirementProps {
  requirement: any;
  index: number;
  modelOptions: any[];
  allTags: string[];
  selectedTagForClasses: string | null;
  onRequirementChange: (idx: number, value: any) => void;
  onTagFilterForClasses: (tag: string | null) => void;
  onAddClassesByTag: (modelId: string, tag: string, idx: number) => void;
  getPropertySetUri: (name: string) => string;
  getClassificationUri: (modelId: string) => string;
  getClassesForModel: (modelId: string) => any[];
  DATA_TYPE_OPTIONS: string[];
}

export const ClassificationRequirement: React.FC<ClassificationRequirementProps> = ({
  requirement: req,
  index: idx,
  modelOptions,
  allTags,
  selectedTagForClasses,
  onRequirementChange: handleRequirementChange,
  onTagFilterForClasses: handleTagFilterForClasses,
  onAddClassesByTag: addClassesByTag,
  getPropertySetUri,
  getClassificationUri,
  getClassesForModel,
  DATA_TYPE_OPTIONS,
}) => {
  const { t } = useTranslate();

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Modell/Fachmodell Auswahl */}
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <T keyName="ids_export.labels.classification_system_select" />
          </Typography>
          <InfoButton 
            titleKey="info_dialogs.classification_system.title" 
            contentKey="info_dialogs.classification_system.content" 
          />
        </Box>
        <Autocomplete
          id={`classification-system-autocomplete-${idx}`}
          options={modelOptions}
          getOptionLabel={(option: any) => option.name || ""}
          value={modelOptions.find((opt: any) => opt.id === req.value) || null}
          onChange={(event, newValue) => {
            handleRequirementChange(idx, newValue?.id || "");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t("ids_export.placeholders.classification_system_search")}
            />
          )}
          clearOnEscape
          clearIcon={req.value ? undefined : null}
        />
      </Box>
      
      {/* URI automatisch anzeigen für Classification - immer sichtbar */}
      <TextField
        label={<T keyName="ids_export.labels.uri_automatic" />}
        value={req.value ? getClassificationUri(req.value) : ""}
        fullWidth
        sx={{ mb: 1 }}
        InputProps={{ readOnly: true }}
        helperText={req.value ? "" : "Klassifikationssystem auswählen um URI zu sehen"}
      />
      
      {/* Optionale Klassenauswahl */}
      {req.value && (
        <Box sx={{ position: 'relative' }}>
          {/* Tag-based Class Selection */}
          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
              <T keyName="ids_export.tag_filter.classes" />
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Autocomplete
                size="small"
                options={allTags}
                value={selectedTagForClasses}
                onChange={(event, newValue) => handleTagFilterForClasses(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Tag auswählen..."
                    size="small"
                  />
                )}
                sx={{ minWidth: 200 }}
              />
              <Button
                size="small"
                variant="contained"
                disabled={!selectedTagForClasses || !req.value}
                onClick={() => selectedTagForClasses && addClassesByTag(req.value, selectedTagForClasses, idx)}
              >
                <T keyName="ids_export.buttons.add_by_tag" />
              </Button>
            </Box>
          </Box>
          
          <Autocomplete
            multiple
            id={`class-autocomplete-req-${idx}`}
            options={getClassesForModel(req.value)}
            getOptionLabel={(option: any) => `${option.name}${option.themeName ? ` (${option.themeName})` : ''}`}
            getOptionKey={(option: any) => option.id} // Eindeutige Keys basierend auf ID
            value={getClassesForModel(req.value).filter((classOpt: any) => 
              (req.selectedClasses || []).includes(classOpt.id)
            )}
            onChange={(event, newValue) => {
              handleRequirementChange(idx, {
                selectedClasses: newValue.map((item: any) => item.id)
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={<T keyName="ids_export.labels.select_classes_optional" />}
                placeholder={t("ids_export.labels.search_classes")}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option: any, index: number) => {
                const { key, onDelete, ...safeTagProps } = getTagProps({ index }); // onDelete herausfiltern
                return (
                  <Box
                    key={key}
                    component="span"
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      borderRadius: '16px',
                      padding: '4px 8px',
                      margin: '2px',
                      fontSize: '0.875rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                    {...safeTagProps} // Nur sichere Props verwenden
                  >
                    {option.name}
                    <CloseIcon 
                      sx={{ 
                        ml: 0.5, 
                        fontSize: '16px', 
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.7 }
                      }}
                      onClick={() => {
                        const newSelected = (req.selectedClasses || []).filter((id: string) => id !== option.id);
                        handleRequirementChange(idx, {
                          selectedClasses: newSelected
                        });
                      }}
                    />
                  </Box>
                );
              })
            }
            filterOptions={(options, { inputValue }) => {
              return options.filter((option: any) =>
                option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                (option.themeName && option.themeName.toLowerCase().includes(inputValue.toLowerCase()))
              );
            }}
          />
          {getClassesForModel(req.value).length > 0 && (
            <Button
              size="small"
              variant="outlined"
              sx={{ mt: 1, mb: 1 }}
              onClick={() => {
                const allClassIds = getClassesForModel(req.value).map((cls: any) => cls.id);
                handleRequirementChange(idx, {
                  selectedClasses: allClassIds
                });
              }}
            >
              <T keyName="ids_export.actions.select_all" /> ({getClassesForModel(req.value).length})
            </Button>
          )}
        </Box>
      )}
      
      {/* dataType Auswahl für Classification */}
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
          id={`datatype-autocomplete-classification-${idx}`}
          options={DATA_TYPE_OPTIONS}
          value={req.dataType || null}
          onChange={(event, newValue) => {
            // Für Classification: dataType separat setzen
            const updatedReq = {
              ...req,
              dataType: newValue || "",
            };
            // Nur den value (Model-ID) als String + das komplette req-Objekt übergeben
            handleRequirementChange(idx, updatedReq);
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
      
      {/* cardinality für Classification */}
      <FormControl fullWidth sx={{ mb: 1 }}>
        <InputLabel id={`cardinality-classification-label-${idx}`}><T keyName="ids_export.labels.cardinality" /></InputLabel>
        <Select
          labelId={`cardinality-classification-label-${idx}`}
          value={req.cardinality || "required"}
          label={<T keyName="ids_export.labels.cardinality" />}
          onChange={(e) => {
            // Für Classification: cardinality separat setzen
            const updatedReq = {
              ...req,
              cardinality: e.target.value,
            };
            // Komplettes req-Objekt übergeben
            handleRequirementChange(idx, updatedReq);
          }}
        >
          <MenuItem value="required"><T keyName="ids_export.cardinality.required" /></MenuItem>
          <MenuItem value="optional"><T keyName="ids_export.cardinality.optional" /></MenuItem>
          <MenuItem value="prohibited"><T keyName="ids_export.cardinality.prohibited" /></MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
