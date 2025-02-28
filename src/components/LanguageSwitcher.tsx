import React, { useState } from "react";
import { Switch, FormControlLabel } from "@mui/material";
import { styled } from "@mui/material/styles";

const CustomSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase': {
        color: "#ffffff", // White color
        '&.Mui-checked': {
            color: "#ffffff", // White color when checked
        },
        '&.Mui-checked + .MuiSwitch-track': {
            backgroundColor: "#ffffff", // Track color when checked
        },
    },
    '& .MuiSwitch-track': {
        backgroundColor: "#a9a9a9", // Track color when unchecked (primary color)
    },
}));
(Switch);

const LanguageSwitcher: React.FC = () => {
    const [language, setLanguage] = useState("de");

    const toggleLanguage = () => {
        const newLanguage = language === "de" ? "en" : "de";
        setLanguage(newLanguage);
    };

    return (
        <FormControlLabel
            control={
                <CustomSwitch
                    checked={language === "en"}
                    onChange={toggleLanguage}
                    color="primary"
                />
            }
            label={language === "de" ? "DE" : "EN"}
        />
    );
};

export default LanguageSwitcher;