import { styled } from "@mui/material/styles";
import {TextFieldProps} from "@mui/material/TextField";

// Export the default field options
export const defaultFormFieldOptions: TextFieldProps = {
    autoComplete: "off",
    fullWidth: true,
    size: "small",
    variant: "outlined" as const,
};

// Create a styled form component that can be exported
export const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

// Keep the hook for backward compatibility
const useFormStyles = () => {
    return {
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: 16, // Equivalent to theme.spacing(2)
        }
    };
};

export default useFormStyles;
