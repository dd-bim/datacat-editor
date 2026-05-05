import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Autocomplete,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "notistack";
import { T, useTranslate } from "@tolgee/react";
import { useQuery } from "@apollo/client/react";
import { 
  PropertyTreeDocument,
  FindPropertiesMinimalDocument,
  CatalogRecordType,
} from "../generated/graphql";
import AddIcon from "@mui/icons-material/Add";

// Tag styling components (similar to IDSExportView)
const TagButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  marginBottom: theme.spacing(1),
  gap: theme.spacing(0.5),
}));

const TagChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.25),
  fontSize: theme.typography.fontSize,
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
}));

const TagFilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

interface CreatePropertySetDialogProps {
  open: boolean;
  onClose: () => void;
  onPropertySetCreated: (propertySetName: string, propertySetId: string, selectedProperties: any[], propertyValues?: Record<string, string[]>) => void;
  availableTags?: string[];
}

export const CreatePropertySetDialog: React.FC<CreatePropertySetDialogProps> = ({
  open,
  onClose,
  onPropertySetCreated,
  availableTags = [],
}) => {
  const { t } = useTranslate();
  const [propertySetName, setPropertySetName] = useState("");
  const [selectedProperties, setSelectedProperties] = useState<any[]>([]);
  const [propertyValues, setPropertyValues] = useState<Record<string, string[]>>({}); // Werte pro Property
  const [rawTextValues, setRawTextValues] = useState<Record<string, string>>({}); // Rohe Texteingabe pro Property
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Lade ALLE Properties aus DataCat - Optimierte Query mit minimalen Feldern
  const { data: allPropertiesData, loading: allPropertiesLoading } = useQuery(FindPropertiesMinimalDocument, {
    variables: {
      input: {
        entityTypeIn: [CatalogRecordType.Property],
      },
      pageSize: 1000, // Reduziert von 10000 wegen Backend Connection Pool Limits
      pageNumber: 0,
    },
    fetchPolicy: "cache-first",
  });

  // Lade PropertyTree für Werte-Zuordnung - zeitlich gestaffelt
  const { data: propertyData } = useQuery(PropertyTreeDocument, {
    fetchPolicy: "cache-first",
    skip: allPropertiesLoading, // Warte bis Properties geladen sind
  });

  // Extrahiere alle verfügbaren Properties (KEINE Dictionary-Filterung)
  const allProperties = useMemo(() => {
    if (!allPropertiesData?.search?.nodes) return [];
    
    return allPropertiesData.search.nodes
      .filter((node: any) => node.recordType === CatalogRecordType.Property)
      .map((node: any) => ({
        id: node.id,
        name: node.name || `Property ${node.id}`,
        tags: node.tags || [],
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [allPropertiesData?.search?.nodes]);

  // Lade verfügbare Werte für eine Property
  const getValuesForProperty = useMemo(() => {
    return (propertyId: string) => {
      if (!propertyData?.hierarchy?.nodes) return [];
      
      const propertyNode = propertyData.hierarchy.nodes.find((node: any) => node.id === propertyId);
      if (!propertyNode) return [];
      
      // Finde alle Value-Kinder dieser Property
      const values = propertyData.hierarchy.nodes
        .filter((node: any) => 
          node.recordType === "Value" && 
          node.parentId === propertyId
        )
        .map((node: any) => ({
          id: node.id,
          name: node.name || `Value ${node.id}`,
          description: node.description || "",
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      
      return values;
    };
  }, [propertyData?.hierarchy?.nodes]);

  // Lade ALLE verfügbaren Werte aus DataCat (unabhängig von der Merkmal-Verbindung)
  const allAvailableValues = useMemo(() => {
    if (!propertyData?.hierarchy?.nodes) return [];
    
    return propertyData.hierarchy.nodes
      .filter((node: any) => node.recordType === "Value")
      .map((node: any) => ({
        id: node.id,
        name: node.name || `Value ${node.id}`,
        description: node.description || "",
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [propertyData?.hierarchy?.nodes]);

  // Tag filtering handler
  const handleTagFilter = useCallback((tag: string | null) => {
    setSelectedTag(tag);
  }, []);

  // Helper function to add properties by tag
  const addPropertiesByTag = useCallback((tagName: string) => {
    if (!tagName) return;
    
    const taggedProperties = allProperties.filter((property: any) => {
      if (!property.tags || !Array.isArray(property.tags)) return false;
      return property.tags.some((tag: any) => tag.name === tagName || tag.id === tagName);
    });

    if (taggedProperties.length > 0) {
      const newSelectedProperties = [...selectedProperties];
      taggedProperties.forEach((prop: any) => {
        if (!newSelectedProperties.some(p => p.id === prop.id)) {
          newSelectedProperties.push(prop);
        }
      });
      setSelectedProperties(newSelectedProperties);
      enqueueSnackbar(
        <T keyName="create_property_set.notifications.properties_with_tag_added" params={{ count: taggedProperties.length, tag: tagName }} />, 
        { variant: "success" }
      );
    } else {
      enqueueSnackbar(
        <T keyName="create_property_set.notifications.no_properties_with_tag" params={{ tag: tagName }} />, 
        { variant: "info" }
      );
    }
  }, [allProperties, selectedProperties, enqueueSnackbar]);

  // Reset Dialog beim Schließen
  useEffect(() => {
    if (!open) {
      setPropertySetName("");
      setSelectedProperties([]);
      setPropertyValues({});
      setRawTextValues({});
      setIsCreating(false);
      setSelectedTag(null);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!propertySetName.trim()) {
      enqueueSnackbar(
        <T keyName="create_property_set.notifications.name_required" />, 
        { variant: "warning" }
      );
      return;
    }

    setIsCreating(true);

    try {
      // Generiere eine lokale ID für die PropertySet
      const newPropertySetId = `local-property-set-${Date.now()}`;
      
      enqueueSnackbar(
        <T keyName="create_property_set.notifications.created_successfully" params={{ name: propertySetName }} />, 
        { variant: "success" }
      );

      // Callback aufrufen um die neue PropertySet zu verwenden
      onPropertySetCreated(propertySetName.trim(), newPropertySetId, selectedProperties, propertyValues);
      
      onClose();
    } catch (error: any) {
      console.error("Fehler beim Erstellen des Propertysets:", error);
      enqueueSnackbar(
        <T keyName="create_property_set.notifications.creation_error" params={{ error: error.message || error }} />, 
        { variant: "error" }
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveProperty = (propertyToRemove: any) => {
    setSelectedProperties(prev => prev.filter(p => p.id !== propertyToRemove.id));
    // Entferne auch die Werte für diese Property
    setPropertyValues(prev => {
      const newValues = { ...prev };
      delete newValues[propertyToRemove.id];
      return newValues;
    });
    // Entferne auch die Raw Text Values
    setRawTextValues(prev => {
      const newValues = { ...prev };
      delete newValues[propertyToRemove.id];
      return newValues;
    });
  };

  // Hilfsfunktion zur Verarbeitung der Komma-getrennten Eingabe
  const processCustomValues = (propertyId: string, inputValue: string) => {
    const customValues = inputValue
      .split(',')
      .map(v => v.trim())
      .filter((v, index, arr) => v.length > 0 && arr.indexOf(v) === index); // Duplikate entfernen
    
    // Behalte DataCat-Werte bei
    const currentValues = propertyValues[propertyId] || [];
    const datacatValues = currentValues.filter(v => allAvailableValues.some(av => av.name === v));
    const uniqueValues = [...new Set([...datacatValues, ...customValues])]; // Weitere Duplikat-Entfernung
    
    setPropertyValues(prev => ({
      ...prev,
      [propertyId]: uniqueValues
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <T keyName="create_property_set.title" />
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {/* Name des IFC Propertysets */}
          <TextField
            label={<T keyName="create_property_set.labels.property_set_name" />}
            value={propertySetName}
            onChange={(e) => setPropertySetName(e.target.value)}
            fullWidth
            required
            placeholder={t("create_property_set.placeholders.property_set_example")}
            autoFocus
          />

          <Divider sx={{ my: 1 }} />

          {/* Property-Auswahl */}
          <Typography variant="h6" component="h3">
            <T keyName="create_property_set.labels.assign_properties" />
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <T keyName="create_property_set.info.selection_help" />
          </Alert>

          {/* Tag Filter für Merkmale */}
          {availableTags.length > 0 && (
            <TagFilterSection>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                <T keyName="create_property_set.tag_filter.properties" />
              </Typography>
              <TagButtonContainer>
                {availableTags.map((tag) => (
                  <TagChip
                    key={tag}
                    label={tag}
                    clickable
                    size="small"
                    color={selectedTag === tag ? "secondary" : "default"}
                    onClick={() => handleTagFilter(tag)}
                  />
                ))}
                <TagChip
                  label={<T keyName="create_property_set.tag_filter.all" />}
                  clickable
                  size="small"
                  color={selectedTag === null ? "secondary" : "default"}
                  onClick={() => handleTagFilter(null)}
                />
                {selectedTag && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => addPropertiesByTag(selectedTag)}
                    sx={{ ml: 1 }}
                  >
                    <T keyName="create_property_set.actions.add_all_with_tag" params={{ tag: selectedTag }} />
                  </Button>
                )}
              </TagButtonContainer>
            </TagFilterSection>
          )}

          {/* Merkmal-Auswahl */}
          <Autocomplete
              multiple
              options={allProperties}
              getOptionLabel={(option: any) => option.name}
              value={selectedProperties}
              onChange={(event, newValue) => setSelectedProperties(newValue)}
              loading={allPropertiesLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={<T keyName="create_property_set.labels.select_properties" />}
                  placeholder={t("create_property_set.placeholders.search_and_select")}
                  helperText={allPropertiesLoading ? "Lade Merkmale..." : `${allProperties.length} Merkmale verfügbar`}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option: any, index: number) => {
                  const { key, onDelete, ...otherTagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={option.name}
                      {...otherTagProps}
                      onDelete={() => handleRemoveProperty(option)}
                      deleteIcon={<CloseIcon />}
                      color="primary"
                      variant="outlined"
                    />
                  );
                })
              }
              filterOptions={(options, { inputValue }) => {
                return options.filter((option: any) =>
                  option.name.toLowerCase().includes(inputValue.toLowerCase())
                );
              }}
              disabled={isCreating || allPropertiesLoading}
            />

          {selectedProperties.length > 0 && (
            <>
              <Typography variant="body2" color="text.secondary">
                <T keyName="create_property_set.status.properties_selected" params={{ 
                  count: selectedProperties.length, 
                  plural: selectedProperties.length !== 1 ? "e" : "" 
                }} />
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Werte für jede ausgewählte Property */}
              <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                <T keyName="create_property_set.labels.property_values_optional" />
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <T keyName="create_property_set.info.values_help" />
              </Alert>

              {selectedProperties.map((property) => {
                const propertySpecificValues = getValuesForProperty(property.id);
                const currentValues = propertyValues[property.id] || [];
                
                return (
                  <Box key={property.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                      {property.name}
                    </Typography>
                    
                    {/* Alle DataCat Werte (nicht nur merkmalsspezifische) */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                        <T keyName="create_property_set.labels.values_from_datacat" />
                        {propertySpecificValues.length > 0 && (
                          <span style={{ fontSize: '0.8em', fontStyle: 'italic' }}>
                            {' '}({propertySpecificValues.length} spezifisch für dieses Merkmal)
                          </span>
                        )}
                      </Typography>
                      <Autocomplete
                        multiple
                        options={allAvailableValues}
                        getOptionLabel={(option: any) => option.name}
                        value={allAvailableValues.filter((val: any) => currentValues.includes(val.name))}
                        onChange={(event, newValue) => {
                          const valueNames = newValue.map((item: any) => item.name);
                          // Behalte auch custom values bei
                          const customValues = currentValues.filter(v => !allAvailableValues.some(av => av.name === v));
                          setPropertyValues(prev => ({
                            ...prev,
                            [property.id]: [...valueNames, ...customValues]
                          }));
                          
                          // Update auch die Raw Text Values um die custom values zu erhalten
                          setRawTextValues(prev => ({
                            ...prev,
                            [property.id]: customValues.join(', ')
                          }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder={t("create_property_set.placeholders.select_values_from_datacat")}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option: any, index: number) => {
                            const { key, onDelete, ...otherTagProps } = getTagProps({ index });
                            const isPropertySpecific = propertySpecificValues.some(pv => pv.name === option.name);
                            return (
                              <Chip
                                key={key}
                                label={option.name}
                                {...otherTagProps}
                                onDelete={() => {
                                  const newValues = currentValues.filter(v => v !== option.name);
                                  setPropertyValues(prev => ({
                                    ...prev,
                                    [property.id]: newValues
                                  }));
                                }}
                                deleteIcon={<CloseIcon />}
                                size="small"
                                color={isPropertySpecific ? "primary" : "secondary"}
                                variant="outlined"
                              />
                            );
                          })
                        }
                        filterOptions={(options, { inputValue }) => {
                          // Zeige zuerst merkmalsspezifische Werte, dann alle anderen
                          const propertySpecificIds = propertySpecificValues.map(pv => pv.id);
                          const filtered = options.filter((option: any) =>
                            option.name.toLowerCase().includes(inputValue.toLowerCase())
                          );
                          
                          return filtered.sort((a: any, b: any) => {
                            const aIsSpecific = propertySpecificIds.includes(a.id);
                            const bIsSpecific = propertySpecificIds.includes(b.id);
                            
                            if (aIsSpecific && !bIsSpecific) return -1;
                            if (!aIsSpecific && bIsSpecific) return 1;
                            return a.name.localeCompare(b.name);
                          });
                        }}
                      />
                    </Box>
                    
                    {/* Eigene Werte eingeben - verbesserte Komma-Trennung */}
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                        <T keyName="create_property_set.labels.custom_values" />
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={t("create_property_set.placeholders.enter_custom_values")}
                        helperText={<T keyName="create_property_set.help.custom_values_format" />}
                        value={rawTextValues[property.id] || ''}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Speichere die rohe Eingabe
                          setRawTextValues(prev => ({
                            ...prev,
                            [property.id]: inputValue
                          }));
                        }}
                        onBlur={(e) => {
                          // Verarbeite die Eingabe beim Verlassen des Feldes
                          const inputValue = e.target.value;
                          processCustomValues(property.id, inputValue);
                        }}
                        onKeyDown={(e) => {
                          // Verarbeite die Eingabe auch bei Enter
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            const inputValue = target.value;
                            processCustomValues(property.id, inputValue);
                            e.preventDefault(); // Verhindere Form-Submit
                          }
                        }}
                      />
                      {/* Anzeige aller aktuell gesetzten Werte als Chips */}
                      {currentValues.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {currentValues.map((value, index) => {
                            const isFromDataCat = allAvailableValues.some(av => av.name === value);
                            const isPropertySpecific = propertySpecificValues.some(pv => pv.name === value);
                            return (
                              <Chip
                                key={`${property.id}-${value}-${index}`}
                                label={value}
                                size="small"
                                color={isFromDataCat ? (isPropertySpecific ? "primary" : "secondary") : "default"}
                                variant={isFromDataCat ? "filled" : "outlined"}
                                onDelete={() => {
                                  const newValues = currentValues.filter(v => v !== value);
                                  setPropertyValues(prev => ({
                                    ...prev,
                                    [property.id]: newValues
                                  }));
                                  
                                  // Update auch die Raw Text Values
                                  const remainingCustomValues = newValues.filter(v => !allAvailableValues.some(av => av.name === v));
                                  setRawTextValues(prev => ({
                                    ...prev,
                                    [property.id]: remainingCustomValues.join(', ')
                                  }));
                                }}
                                deleteIcon={<CloseIcon />}
                                sx={{ 
                                  fontSize: '0.75rem',
                                  '& .MuiChip-label': {
                                    fontSize: '0.75rem'
                                  }
                                }}
                              />
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isCreating}>
          <T keyName="create_property_set.actions.cancel" />
        </Button>
        <Button 
          onClick={handleCreate} 
          variant="contained" 
          disabled={!propertySetName.trim() || isCreating}
        >
          {isCreating ? <T keyName="create_property_set.actions.creating" /> : <T keyName="create_property_set.actions.create" />}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePropertySetDialog;
