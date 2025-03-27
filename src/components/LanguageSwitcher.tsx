import React, { useEffect, useState, useContext } from "react";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Backdrop, CircularProgress } from "@mui/material";
import { useTolgee } from "@tolgee/react";
import { styled } from "@mui/material/styles";
import { AppContext } from "../context/AppContext";

const WhiteSelect = styled(Select)<{ borderColor: string }>(({ borderColor }) => ({
  color: "#ffffff",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: borderColor,
  },
  "& .MuiSvgIcon-root": {
    color: "#ffffff",
  },
  "& .MuiInputLabel-root": {
    color: "#ffffff",
  },
  "& .MuiMenuItem-root": {
    color: "#000000",
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  height: 36.5, // Match the height of other buttons
  display: 'flex',
  justifyContent: 'center',
  '& .MuiInputBase-root': {
    height: '36.5px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderWidth: '1px',
  },
  '& .MuiInputLabel-outlined': {
    transform: 'translate(14px, 9px) scale(1)',
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(14px, -6px) scale(0.75)',
  }
}));

interface LanguageSwitcherProps {
  textColor?: string;
  dropdownColor?: string;
  borderColor?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  textColor = 'white',
  dropdownColor = 'white',
  borderColor = 'white',
}) => {
  const tolgee = useTolgee();
  const [language, setLanguage] = useState(localStorage.getItem("language") || "de");
  const [isLoading, setIsLoading] = useState(false);
  const { refreshApp } = useContext(AppContext) || { refreshApp: () => {} };

  useEffect(() => {
    tolgee.changeLanguage(language);
  }, [language, tolgee]);

  const handleLanguageChange = (event: SelectChangeEvent<unknown>) => {
    const newLanguage = event.target.value as string;
    
    // Show loading overlay
    setIsLoading(true);
    
    // Save language settings
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
    
    // Change language
    tolgee.changeLanguage(newLanguage).then(() => {
      // Force a context refresh instead of page reload
      if (refreshApp) {
        refreshApp();
      }
      
      // Publish a custom event for components to listen to
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLanguage }));
      
      // Hide overlay after a short delay to allow components to re-render
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    });
  };

  // Check for scroll restoration after page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const scrollPos = urlParams.get('scrollPos');
    
    if (scrollPos) {
      // Remove the parameter from URL without refreshing
      const newUrl = window.location.pathname + 
        window.location.search.replace(/[?&]scrollPos=\d+/, '');
      window.history.replaceState({}, document.title, newUrl);
      
      // Restore scroll position
      window.scrollTo(0, parseInt(scrollPos));
    }
  }, []);

  const getPlaceholderText = () => {
    switch (language) {
      case "de":
        return "Sprache";
      case "en":
        return "Language";
      case "es":
        return "Idioma";
      case "it":
        return "Lingua";
      case "nl":
        return "Taal";
      case "zh":
        return "语言";
      default:
        return "Sprache";
    }
  };

  return (
    <>
      <StyledFormControl variant="outlined" size="small" style={{ color: textColor }}>
        <InputLabel id="language-select-label" style={{ color: textColor }}>
          {getPlaceholderText()}
        </InputLabel>
        <WhiteSelect
          labelId="language-select-label"
          id="language-select"
          value={language}
          onChange={handleLanguageChange}
          label={getPlaceholderText()}
          style={{ color: dropdownColor }}
          borderColor={borderColor}
        >
          <MenuItem value="de">Deutsch</MenuItem>
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="es">Español</MenuItem>
          <MenuItem value="it">Italiano</MenuItem>
          <MenuItem value="nl">Nederlands</MenuItem>
          <MenuItem value="zh">中文 (简体)</MenuItem>
        </WhiteSelect>
      </StyledFormControl>
      
      {/* Loading overlay */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default LanguageSwitcher;
