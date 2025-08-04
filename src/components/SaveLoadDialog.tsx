import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Tabs,
  Tab,
  Box,
  Typography,
  Divider,
  Alert
} from '@mui/material';
import { T, useTranslate } from "@tolgee/react";
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import {
  SavedIDSData,
  SavedSpecification,
  getSavedIDSFiles,
  getSavedSpecifications,
  saveIDSData,
  saveSpecification,
  loadIDSData,
  loadSpecification,
  deleteIDSData,
  deleteSpecification,
  formatTimestamp,
  getAutoSavedIDSData,
  clearAutoSavedData
} from '../utils/idsStorage';

interface SaveLoadDialogProps {
  open: boolean;
  onClose: () => void;
  currentIDSTitle: string;
  currentSpecRows: any[];
  currentSpec?: any;
  currentLocalPropertySets?: Map<string, any[]>; // Neue Eigenschaft
  onLoadIDS: (idsTitle: string, specRows: any[], localPropertySets?: Record<string, any[]>) => void;
  onLoadSpec: (spec: any) => void;
  mode: 'ids' | 'specification';
}

export const SaveLoadDialog: React.FC<SaveLoadDialogProps> = ({
  open,
  onClose,
  currentIDSTitle,
  currentSpecRows,
  currentSpec,
  currentLocalPropertySets,
  onLoadIDS,
  onLoadSpec,
  mode: initialMode
}) => {
  const { t } = useTranslate();
  const [activeTab, setActiveTab] = useState(0);
  const [savedIDSFiles, setSavedIDSFiles] = useState<SavedIDSData[]>([]);
  const [savedSpecs, setSavedSpecs] = useState<SavedSpecification[]>([]);
  const [saveName, setSaveName] = useState('');
  const [autoSaveData, setAutoSaveData] = useState<any>(null);

  useEffect(() => {
    if (open) {
      loadSavedData();
      checkAutoSave();
      if (initialMode === 'specification') {
        setActiveTab(1);
      }
    }
  }, [open, initialMode]);

  const loadSavedData = () => {
    setSavedIDSFiles(getSavedIDSFiles());
    setSavedSpecs(getSavedSpecifications());
  };

  const checkAutoSave = () => {
    const autoSave = getAutoSavedIDSData();
    setAutoSaveData(autoSave);
  };

  const handleSaveIDS = () => {
    const name = saveName.trim() || currentIDSTitle || 'Unbenannte IDS';
    saveIDSData(name, currentIDSTitle, currentSpecRows, currentLocalPropertySets);
    setSaveName('');
    loadSavedData();
  };

  const handleSaveSpec = () => {
    if (!currentSpec) return;
    const name = saveName.trim() || currentSpec.name || 'Unbenannte Specification';
    saveSpecification({ ...currentSpec, name });
    setSaveName('');
    loadSavedData();
  };

  const handleLoadIDS = (item: SavedIDSData) => {
    onLoadIDS(item.data.idsTitle, item.data.specRows, item.data.localPropertySets);
    onClose();
  };

  const handleLoadSpec = (item: SavedSpecification) => {
    onLoadSpec(item.data);
    onClose();
  };

  const handleDeleteIDS = (id: string) => {
    deleteIDSData(id);
    loadSavedData();
  };

  const handleDeleteSpec = (id: string) => {
    deleteSpecification(id);
    loadSavedData();
  };

  const handleRestoreAutoSave = () => {
    if (autoSaveData) {
      onLoadIDS(autoSaveData.data.idsTitle, autoSaveData.data.specRows, autoSaveData.data.localPropertySets);
      clearAutoSavedData();
      setAutoSaveData(null);
      onClose();
    }
  };

  const handleDiscardAutoSave = () => {
    clearAutoSavedData();
    setAutoSaveData(null);
  };

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <T keyName="save_load_dialog.title" />
      </DialogTitle>
      
      <DialogContent>
        {/* Auto-Save Warnung */}
        {autoSaveData && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  color="inherit" 
                  size="small" 
                  startIcon={<RestoreIcon />}
                  onClick={handleRestoreAutoSave}
                >
                  Wiederherstellen
                </Button>
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleDiscardAutoSave}
                >
                  Verwerfen
                </Button>
              </Box>
            }
          >
            Es wurden automatisch gespeicherte Daten gefunden vom {formatTimestamp(autoSaveData.timestamp)}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="IDS Dateien" />
          <Tab label="Spezifikationen" />
        </Tabs>

        {/* IDS Files Tab */}
        {activeTab === 0 && (
          <Box>
            {/* Save Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Aktuelle IDS speichern
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Name für gespeicherte IDS"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder={currentIDSTitle || t('ids_export.placeholders.unnamed_ids')}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveIDS}
                  disabled={currentSpecRows.length === 0}
                >
                  Speichern
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Load Section */}
            <Typography variant="h6" gutterBottom>
              Gespeicherte IDS Dateien ({savedIDSFiles.length}/10)
            </Typography>
            
            {savedIDSFiles.length === 0 ? (
              <Typography color="text.secondary">
                Keine gespeicherten IDS Dateien gefunden.
              </Typography>
            ) : (
              <List>
                {savedIDSFiles.map((item) => (
                  <ListItem key={item.id} divider>
                    <ListItemText
                      primary={item.name}
                      secondary={`${formatTimestamp(item.timestamp)} • ${item.data.specRows.length} Spezifikationen${
                        item.data.localPropertySets && Object.keys(item.data.localPropertySets).length > 0
                          ? ` • ${Object.keys(item.data.localPropertySets).length} lokale Merkmalsgruppen`
                          : ''
                      }`}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        onClick={() => handleLoadIDS(item)}
                        sx={{ mr: 1 }}
                      >
                        Laden
                      </Button>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteIDS(item.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* Specifications Tab */}
        {activeTab === 1 && (
          <Box>
            {/* Save Section */}
            {currentSpec && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Aktuelle Spezifikation speichern
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      label="Name für gespeicherte Spezifikation"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder={currentSpec.name || t('ids_export.placeholders.unnamed_specification')}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveSpec}
                    >
                      Speichern
                    </Button>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />
              </>
            )}

            {/* Load Section */}
            <Typography variant="h6" gutterBottom>
              Gespeicherte Spezifikationen ({savedSpecs.length}/10)
            </Typography>
            
            {savedSpecs.length === 0 ? (
              <Typography color="text.secondary">
                Keine gespeicherten Spezifikationen gefunden.
              </Typography>
            ) : (
              <List>
                {savedSpecs.map((item) => (
                  <ListItem key={item.id} divider>
                    <ListItemText
                      primary={item.name}
                      secondary={`${formatTimestamp(item.timestamp)} • ${item.data.applicabilityType} • ${item.data.requirements.length} Requirements`}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        onClick={() => handleLoadSpec(item)}
                        sx={{ mr: 1 }}
                      >
                        Laden
                      </Button>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteSpec(item.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Schließen
        </Button>
      </DialogActions>
    </Dialog>
  );
};
