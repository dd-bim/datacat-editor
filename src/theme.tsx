import { createTheme } from '@mui/material/styles';
import { Theme as MUITheme } from '@mui/material/styles';

// Create theme with MUI v7 compatible settings
const theme = createTheme({
  // In MUI v7, spacing works with a multiplier system (8px by default)
  spacing: 8,
  palette: {
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
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    // Additional component overrides can be defined here
  },
});

export default theme;