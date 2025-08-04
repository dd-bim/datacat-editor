import React, { useState } from 'react';
import { 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Box
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { T } from '@tolgee/react';

interface InfoButtonProps {
  titleKey: string;
  contentKey: string;
  size?: 'small' | 'medium' | 'large';
}

export const InfoButton: React.FC<InfoButtonProps> = ({ 
  titleKey, 
  contentKey, 
  size = 'small' 
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        size={size}
        onClick={() => setOpen(true)}
        sx={{ 
          ml: 0.5, 
          color: 'info.main',
          '&:hover': { color: 'info.dark' }
        }}
        aria-label="Info"
      >
        <InfoIcon fontSize={size} />
      </IconButton>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="info" />
            <T keyName={titleKey} />
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            <T keyName={contentKey} />
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            <T keyName="common.close">Schließen</T>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
