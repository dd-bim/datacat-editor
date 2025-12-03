import React, { useEffect, useRef } from "react";
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
  CircularProgress,
} from "@mui/material";
import { T, useTranslate } from "@tolgee/react";
import { InfoButton } from "../InfoButton";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "notistack";

interface ClassificationRequirementProps {
  requirement: any;
  index: number;
  modelOptions: any[];
  allTags: string[];
  selectedTagForClasses: string | null;
  classesLoading: boolean;
  onRequirementChange: (idx: number, value: any) => void;
  onTagFilterForClasses: (tag: string | null) => void;
  onAddClassesByTag: (modelId: string, tag: string, idx: number) => void;
  getPropertySetUri: (name: string) => string;
  getClassificationUri: (modelId: string) => string;
  getClassesForModel: (modelId: string) => any[];
  // Hierarchische Props für Themen/Unterthemen/Klassen
  getThemesForDictionary: (dictionaryId: string) => any[];
  getSubThemesForTheme: (themeId: string) => any[];
  getClassesForThemeOrSubTheme: (themeId: string) => any[];
  getAllClassesForDictionary: (dictionaryId: string) => any[];
  hasSubThemes: (themeId: string) => boolean;
  DATA_TYPE_OPTIONS: string[];
}

export const ClassificationRequirement: React.FC<ClassificationRequirementProps> = ({
  requirement: req,
  index: idx,
  modelOptions,
  allTags,
  selectedTagForClasses,
  classesLoading,
  onRequirementChange: handleRequirementChange,
  onTagFilterForClasses: handleTagFilterForClasses,
  onAddClassesByTag: addClassesByTag,
  getPropertySetUri,
  getClassificationUri,
  getClassesForModel,
  // Hierarchische Props für Themen/Unterthemen/Klassen
  getThemesForDictionary,
  getSubThemesForTheme,
  getClassesForThemeOrSubTheme,
  getAllClassesForDictionary,
  hasSubThemes,
  DATA_TYPE_OPTIONS,
}) => {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  
  // Ref um zu tracken ob bereits eine Benachrichtigung gezeigt wurde
  const hasShownSubThemeHintRef = useRef(false);
  const hasShownNoClassesHintRef = useRef(false);

  // Berechne verfügbare Optionen basierend auf aktueller Auswahl
  const availableThemes = req.value ? getThemesForDictionary(req.value) : [];
  const availableSubThemes = req.selectedThemes?.length > 0 
    ? req.selectedThemes.flatMap((themeId: string) => getSubThemesForTheme(themeId))
    : [];
  
  // NEU: Alle Klassen für das ausgewählte Dictionary (ohne Themen-Filter)
  const allDictionaryClasses = req.value ? getAllClassesForDictionary(req.value) : [];
  
  // Prüfe ob eines der gewählten Themen Unterthemen hat
  const selectedThemesHaveSubThemes = req.selectedThemes?.some((themeId: string) => hasSubThemes(themeId)) || false;
  
  // Verbesserte Logik: Zeige Klassen mit Labels für Themen und Unterthemen
  const getFilteredClasses = () => {
    if (!req.value) return [];
    
    // NEU: Wenn weder Themen noch Unterthemen gewählt sind, zeige ALLE Dictionary-Klassen
    if (!req.selectedThemes?.length && !req.selectedSubThemes?.length) {
      return allDictionaryClasses.map((cls: any) => ({
        ...cls,
        displayName: `${cls.name}` // Ohne Label, da alle Klassen angezeigt werden
      }));
    }
    
    let allClasses: any[] = [];
    
    // Wenn Unterthemen gewählt sind, hole deren Klassen
    if (req.selectedSubThemes?.length > 0) {
      req.selectedSubThemes.forEach((subThemeId: string) => {
        const subThemeClasses = getClassesForThemeOrSubTheme(subThemeId);
        const subTheme = availableSubThemes.find((st: any) => st.id === subThemeId);
        const subThemeName = subTheme?.name || t('classification_hints.unknown_subtheme');
        
        // Füge Label hinzu
        allClasses.push(...subThemeClasses.map((cls: any) => ({
          ...cls,
          displayName: `${cls.name} [Unterthema: ${subThemeName}]`
        })));
      });
    }
    
    // Wenn Themen gewählt sind, hole deren direkte Klassen (falls vorhanden)
    if (req.selectedThemes?.length > 0) {
      req.selectedThemes.forEach((themeId: string) => {
        const themeClasses = getClassesForThemeOrSubTheme(themeId);
        const theme = availableThemes.find((t: any) => t.id === themeId);
        const themeName = theme?.name || t('classification_hints.unknown_theme');
        
        // Füge Label hinzu, aber nur wenn das Thema direkte Klassen hat
        if (themeClasses.length > 0) {
          allClasses.push(...themeClasses.map((cls: any) => ({
            ...cls,
            displayName: `${cls.name} [Thema: ${themeName}]`
          })));
        }
      });
    }
    
    return allClasses;
  };

  const filteredClasses = getFilteredClasses();

  // Zeige Snackbar-Hinweis wenn Themen Unterthemen haben aber keine ausgewählt sind
  useEffect(() => {
    if (req.selectedThemes?.length > 0 && selectedThemesHaveSubThemes && !req.selectedSubThemes?.length && !hasShownSubThemeHintRef.current) {
      enqueueSnackbar(
        t("classification_hints.selected_themes_have_subthemes"),
        { variant: "info", autoHideDuration: 5000 }
      );
      hasShownSubThemeHintRef.current = true;
    }
    
    // Reset wenn Unterthemen ausgewählt werden
    if (req.selectedSubThemes?.length > 0) {
      hasShownSubThemeHintRef.current = false;
    }
  }, [req.selectedThemes, selectedThemesHaveSubThemes, req.selectedSubThemes, enqueueSnackbar, t]);

  // Zeige Snackbar-Hinweis wenn Dictionary ausgewählt aber keine Klassen verfügbar
  useEffect(() => {
    if (req.value && filteredClasses.length === 0 && 
        !req.selectedThemes?.length && !req.selectedSubThemes?.length && 
        !hasShownNoClassesHintRef.current) {
      enqueueSnackbar(
        t("classification_hints.no_classes_available"),
        { variant: "info", autoHideDuration: 5000 }
      );
      hasShownNoClassesHintRef.current = true;
    }
    
    // Reset wenn Themen ausgewählt werden
    if (req.selectedThemes?.length > 0 || req.selectedSubThemes?.length > 0) {
      hasShownNoClassesHintRef.current = false;
    }
  }, [req.value, filteredClasses.length, req.selectedThemes, req.selectedSubThemes, enqueueSnackbar, t]);

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
        helperText={req.value ? "" : t("ids_export.hints.select_classification_to_see_uri")}
      />
      
      {/* Optionale hierarchische Auswahl: Themen → Unterthemen → Klassen */}
      {req.value && (
        <Box sx={{ position: 'relative' }}>
          {/* Themen-Auswahl */}
          {availableThemes.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <T keyName="ids_export.labels.themes_select" />
                </Typography>
                <InfoButton 
                  titleKey="info_dialogs.themes.title" 
                  contentKey="info_dialogs.themes.content" 
                />
              </Box>
              <Autocomplete
                multiple
                id={`themes-autocomplete-req-${idx}`}
                options={availableThemes}
                getOptionLabel={(option: any) => option.name || ""}
                value={availableThemes.filter((theme: any) => 
                  (req.selectedThemes || []).includes(theme.id)
                )}
                onChange={(event, newValue) => {
                  handleRequirementChange(idx, {
                    selectedThemes: newValue.map((item: any) => item.id),
                    selectedSubThemes: [], // Reset Unterthemen
                    selectedClasses: [] // Reset Klassen
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={t("ids_export.placeholders.themes_select")}
                  />
                )}
                clearOnEscape
              />
            </Box>
          )}

          {/* Unterthemen-Auswahl - nur anzeigen wenn gewählte Themen Unterthemen haben */}
          {req.selectedThemes?.length > 0 && selectedThemesHaveSubThemes && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <T keyName="ids_export.labels.subthemes_select" />
                </Typography>
                <InfoButton 
                  titleKey="info_dialogs.subthemes.title" 
                  contentKey="info_dialogs.subthemes.content" 
                />
              </Box>
              <Autocomplete
                multiple
                id={`subthemes-autocomplete-req-${idx}`}
                options={availableSubThemes}
                getOptionLabel={(option: any) => option.name || ""}
                value={availableSubThemes.filter((subTheme: any) => 
                  (req.selectedSubThemes || []).includes(subTheme.id)
                )}
                onChange={(event, newValue) => {
                  handleRequirementChange(idx, {
                    selectedSubThemes: newValue.map((item: any) => item.id),
                    selectedClasses: [] // Reset Klassen
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={t("ids_export.placeholders.subthemes_select")}
                  />
                )}
                clearOnEscape
              />
            </Box>
          )}

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
                    placeholder={t("ids_export.placeholders.tag_select")}
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
          
          {/* Klassen-Auswahl */}
          {classesLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                <T keyName="ids_export.loading.classes" defaultValue="Klassen werden geladen..." />
              </Typography>
            </Box>
          ) : filteredClasses.length > 0 ? (
            <Autocomplete
              multiple
              id={`class-autocomplete-req-${idx}`}
              options={filteredClasses}
              getOptionLabel={(option: any) => option.displayName || option.name}
              getOptionKey={(option: any) => option.id} // Eindeutige Keys basierend auf ID
              value={filteredClasses.filter((classOpt: any) => 
                (req.selectedClasses || []).includes(classOpt.id)
              )}
              onChange={(event, newValue) => {
                handleRequirementChange(idx, {
                  selectedClasses: newValue.map((item: any) => item.id)
                });
              }}
              loading={classesLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={<T keyName="ids_export.labels.select_classes_optional" />}
                  placeholder={t("ids_export.labels.search_classes")}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {classesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
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
                  (option.displayName && option.displayName.toLowerCase().includes(inputValue.toLowerCase()))
                );
              }}
            />
          ) : null}
          
          {filteredClasses.length > 0 && (
            <Button
              size="small"
              variant="outlined"
              sx={{ mt: 1, mb: 1 }}
              onClick={() => {
                const allClassIds = filteredClasses.map((cls: any) => cls.id);
                handleRequirementChange(idx, {
                  selectedClasses: allClassIds
                });
              }}
            >
              <T keyName="ids_export.actions.select_all" /> ({filteredClasses.length})
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
