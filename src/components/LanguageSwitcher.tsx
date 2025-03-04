import React, { useEffect, useState } from "react";
import { Switch, FormControlLabel } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTolgee } from "@tolgee/react";

const CustomSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase": {
    color: "#ffffff",
    "&.Mui-checked": { color: "#ffffff" },
    "&.Mui-checked + .MuiSwitch-track": { backgroundColor: "#ffffff" },
  },
  "& .MuiSwitch-track": { backgroundColor: "#a9a9a9" },
}));

const LanguageSwitcher: React.FC = () => {
  const tolgee = useTolgee();
  const [language, setLanguage] = useState(localStorage.getItem("language") || "de");

  useEffect(() => {
    tolgee.changeLanguage(language);
  }, [language, tolgee]);

  const toggleLanguage = () => {
    const newLanguage = language === "de" ? "en" : "de";
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
    tolgee.changeLanguage(newLanguage);
  };

  return (
    <FormControlLabel
      control={<CustomSwitch checked={language === "en"} onChange={toggleLanguage} />}
      label={language.toUpperCase()}
    />
  );
};

export default LanguageSwitcher;
