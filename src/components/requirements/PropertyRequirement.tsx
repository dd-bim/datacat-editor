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
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

interface PropertyRequirementProps {
  requirement: any;
  index: number;
  propertyGroupOptions: any[];
  allTags: string[];
  selectedTagForProperties: string | null;
  allItemsLoading: boolean;
  onRequirementChange: (idx: number, value: any) => void;
  onTagFilterForProperties: (tag: string | null) => void;
  onAddPropertiesByTag: (propertySet: string, tag: string, idx: number) => void;
  onCreatePropertySetOpen: () => void;
  getPropertySetUri: (name: string) => string;
  getPropertiesForPropertySet: (name: string) => any[];
  getValuesForProperty: (id: string) => any[];
  DATA_TYPE_OPTIONS: string[];
}

export const PropertyRequirement: React.FC<PropertyRequirementProps> = ({
  requirement: req,
  index: idx,
  propertyGroupOptions,
  allTags,
  selectedTagForProperties,
  allItemsLoading,
  onRequirementChange: handleRequirementChange,
  onTagFilterForProperties: handleTagFilterForProperties,
  onAddPropertiesByTag: addPropertiesByTag,
  onCreatePropertySetOpen: setCreatePropertySetDialogOpen,
  getPropertySetUri,
  getPropertiesForPropertySet,
  getValuesForProperty,
  DATA_TYPE_OPTIONS,
}) => {
  const { t } = useTranslate();

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
      {/* propertySet Auswahl */}
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, mb: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <T keyName="ids_export.labels.property_group_select" />
            </Typography>
            <InfoButton 
              titleKey="info_dialogs.property_group.title" 
              contentKey="info_dialogs.property_group.content" 
            />
          </Box>
          <Autocomplete
            id={`property-set-autocomplete-${idx}`}
            options={propertyGroupOptions}
            getOptionLabel={(option: any) => option.name || ""}
            getOptionKey={(option: any) => option.id || option.name} // Eindeutige Keys
            value={propertyGroupOptions.find((opt: any) => opt.name === req.propertySet) || null}
            onChange={(event, newValue) => {
              handleRequirementChange(idx, {
                ...req,
                propertySet: newValue?.name || "",
                baseNames: [],
                valueMap: {},
              });
            }}
            disabled={allItemsLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={t("ids_export.placeholders.property_set_search")}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <Box component="li" key={key} {...otherProps}>
                  <Box>
                    <Typography variant="body2">
                      {option.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {option.isLocal 
                        ? t("ids_export.labels.local_created")
                        : option.tags && Array.isArray(option.tags)
                        ? option.tags.map((t: any) => t.name).join(", ")
                        : ""
                      }
                    </Typography>
                  </Box>
                </Box>
              );
            }}
            clearOnEscape
            clearIcon={req.propertySet ? undefined : null}
          />
        </Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setCreatePropertySetDialogOpen()}
          sx={{ 
            height: "56px",
            px: 3,
            fontSize: '0.875rem',
            fontWeight: 'bold',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            }
          }}
          startIcon={<AddIcon />}
        >
          <T keyName="ids_export.buttons.create_pset" />
        </Button>
      </Box>
      
      {/* URI automatisch anzeigen - nur für PropertySets mit URL (nicht lokal erstellt) */}
      {req.propertySet && getPropertySetUri(req.propertySet) !== "" && (
        <TextField
          label={<T keyName="ids_export.labels.uri_automatic" />}
          value={getPropertySetUri(req.propertySet)}
          fullWidth
          sx={{ mb: 1 }}
          InputProps={{ readOnly: true }}
        />
      )}
      
      {/* baseNames Auswahl (Mehrfachauswahl Merkmale) */}
      {req.propertySet && (
        <Box sx={{ position: 'relative', mb: 1 }}>
          {/* Tag-based Property Selection */}
          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
              <T keyName="ids_export.tag_filter.properties" />
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Autocomplete
                size="small"
                options={allTags}
                value={selectedTagForProperties}
                onChange={(event, newValue) => handleTagFilterForProperties(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={t("ids_export.placeholders.tag_select")}
                    size="small"
                  />
                )}
                sx={{ minWidth: 200 }}
              />
              <Button
                size="small"
                variant="contained"
                disabled={!selectedTagForProperties || !req.propertySet}
                onClick={() => selectedTagForProperties && addPropertiesByTag(req.propertySet, selectedTagForProperties, idx)}
              >
                <T keyName="ids_export.buttons.add_by_tag" />
              </Button>
            </Box>
          </Box>
          
          {/* Property Selection Autocomplete */}
          <Autocomplete
            multiple
            id={`property-basenames-autocomplete-${idx}`}
            options={getPropertiesForPropertySet(req.propertySet ?? "")}
            getOptionLabel={(option: any) => option.name || option.id}
            getOptionKey={(option: any) => option.id} // Eindeutige Keys basierend auf ID
            value={getPropertiesForPropertySet(req.propertySet ?? "").filter((prop: any) => 
              (req.baseNames || []).includes(prop.id)
            )}
            onChange={(event, newValue) => {
              handleRequirementChange(idx, {
                ...req,
                baseNames: newValue.map((item: any) => item.id),
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={<T keyName="ids_export.labels.select_properties" />}
                placeholder={t("ids_export.labels.search_properties")}
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
                      backgroundColor: 'secondary.main',
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
                        const newBaseNames = (req.baseNames || []).filter((id: string) => id !== option.id);
                        handleRequirementChange(idx, {
                          ...req,
                          baseNames: newBaseNames,
                        });
                      }}
                    />
                  </Box>
                );
              })
            }
            filterOptions={(options, { inputValue }) => {
              return options.filter((option: any) =>
                (option.name || '').toLowerCase().includes(inputValue.toLowerCase())
              );
            }}
          />
          
          {getPropertiesForPropertySet(req.propertySet ?? "").length > 0 && (
            <Button
              size="small"
              variant="outlined"
              sx={{ mt: 1, mb: 1 }}
              onClick={() => {
                const allPropertyIds = getPropertiesForPropertySet(req.propertySet ?? "").map((prop: any) => prop.id);
                handleRequirementChange(idx, {
                  ...req,
                  baseNames: allPropertyIds,
                });
              }}
            >
              <T keyName="ids_export.buttons.select_all_properties" /> ({getPropertiesForPropertySet(req.propertySet ?? "").length})
            </Button>
          )}
        </Box>
      )}
      
      {/* Value Selection for each selected Property - nur anzeigen wenn Werte verfügbar */}
      {req.propertySet &&
        Array.isArray(req.baseNames) &&
        req.baseNames.map((baseId: string) => {
          const propertyName = getPropertiesForPropertySet(req.propertySet ?? "").find((p) => p.id === baseId)?.name;
          const availableValues = getValuesForProperty(baseId);
          
          // Nur anzeigen wenn Werte verfügbar sind
          if (!availableValues || availableValues.length === 0) {
            return null;
          }
          
          return (
            <Box key={baseId} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <T keyName="ids_export.value_labels.values_for" /> {propertyName}
                </Typography>
                <InfoButton 
                  titleKey="info_dialogs.property_values.title" 
                  contentKey="info_dialogs.property_values.content" 
                />
              </Box>
              <Autocomplete
                multiple
                id={`property-values-autocomplete-${idx}-${baseId}`}
                options={availableValues}
                getOptionLabel={(option: any) => option.name || option.id}
                getOptionKey={(option: any) => option.id} // Eindeutige Keys
                value={availableValues.filter((val: any) => 
                  (req.valueMap?.[baseId] || []).includes(val.id)
                )}
                onChange={(event, newValue) => {
                  const newValueMap = { ...(req.valueMap || {}) };
                  newValueMap[baseId] = newValue.map((item: any) => item.id);
                  handleRequirementChange(idx, {
                    ...req,
                    valueMap: newValueMap,
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={t("ids_export.labels.search_values")}
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
                          backgroundColor: 'success.main',
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
                            const newValueMap = { ...(req.valueMap || {}) };
                            newValueMap[baseId] = (newValueMap[baseId] || []).filter((id: string) => id !== option.id);
                            handleRequirementChange(idx, {
                              ...req,
                              valueMap: newValueMap,
                            });
                          }}
                        />
                      </Box>
                    );
                  })
                }
                filterOptions={(options, { inputValue }) => {
                  return options.filter((option: any) =>
                    (option.name || '').toLowerCase().includes(inputValue.toLowerCase())
                  );
                }}
              />
              {availableValues.length > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1, mb: 1 }}
                  onClick={() => {
                    const allValueIds = availableValues.map((val: any) => val.id);
                    const newValueMap = { ...(req.valueMap || {}) };
                    newValueMap[baseId] = allValueIds;
                    handleRequirementChange(idx, {
                      ...req,
                      valueMap: newValueMap,
                    });
                  }}
                >
                  <T keyName="ids_export.buttons.select_all_values" /> ({availableValues.length})
                </Button>
              )}
            </Box>
          );
        })}
      
      {/* dataType Auswahl */}
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
          id={`datatype-autocomplete-property-${idx}`}
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
      
      {/* cardinality */}
      <FormControl fullWidth sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <T keyName="ids_export.labels.cardinality" />
          </Typography>
          <InfoButton 
            titleKey="info_dialogs.cardinality.title" 
            contentKey="info_dialogs.cardinality.content" 
          />
        </Box>
        <Select
          value={req.cardinality || "required"}
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
