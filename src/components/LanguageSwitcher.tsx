import React, { useEffect, useState } from "react";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useTolgee } from "@tolgee/react";
import { styled } from "@mui/material/styles";

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

  useEffect(() => {
    tolgee.changeLanguage(language);
  }, [language, tolgee]);

  const handleLanguageChange = (event: SelectChangeEvent<unknown>) => {
    const newLanguage = event.target.value as string;
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
    tolgee.changeLanguage(newLanguage);
  };

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
    <FormControl variant="outlined" size="small" style={{ color: textColor }}>
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
    </FormControl>
  );
};

export default LanguageSwitcher;
