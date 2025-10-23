import { createTheme, Theme } from '@mui/material/styles';

// Dark Theme
export const darkTheme: Theme = createTheme({
  spacing: 8,
  palette: {
    mode: 'dark',
    primary: {
      main: '#90A4AE',
      light: '#CFD8DC',
      dark: '#607D8B',
      contrastText: '#000000'
    },
    secondary: {
      main: '#BDBDBD',
      contrastText: '#000000'
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#a0a0a0',
    },
    divider: '#333333',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default MUI gradient
          backgroundColor: '#1e1e1e',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          color: '#e0e0e0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e',
          color: '#e0e0e0',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#444444',
            },
            '&:hover fieldset': {
              borderColor: '#666666',
            },
          },
        },
      },
    },

  },
});