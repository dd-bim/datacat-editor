import { createTheme, Theme } from '@mui/material/styles';

// Light Theme (based on existing theme)
export const lightTheme: Theme = createTheme({
  spacing: 8,
  palette: {
    mode: 'light',
    primary: {
      main: '#607D8B',
      light: '#CFD8DC',
      dark: '#455A64',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#9E9E9E',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
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
        },
      },
    },
  },
});