// components/InputField.tsx
import React from "react";
import {
  Controller,
  type RegisterOptions,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { TextField } from "@mui/material";

type InputFieldProps = {
  name: string;
  control: Control<any>;
  label: string;
  placeholder: string;
  errors: FieldErrors;
  rules?: RegisterOptions;
  disabled?: boolean;
  type?: string;
};

const InputField: React.FC<InputFieldProps> = ({
  name,
  control,
  label,
  placeholder,
  errors,
  rules,
  type,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <TextField
          {...field}
          {...props}
          type={type}
          label={label}
          placeholder={placeholder}
          fullWidth
          size="small"
          variant="outlined"
          error={!!errors[name]}
          helperText={errors[name]?.message as string}
          InputLabelProps={{
            shrink: true,
            sx: {
              fontFamily: "Manrope, sans-serif",
              fontWeight: "bold",
              color: "#000",
            },
          }}
          sx={{
            fontFamily: "Manrope, sans-serif",
            "& .MuiOutlinedInput-root": {
              height: 48,
              fontFamily: "Manrope, sans-serif",
              "& fieldset": {
                borderColor: "#E5E7EB",
                border: "1px solid #E5E7EB",
              },
              "&:hover fieldset": {
                borderColor: "#E5E7EB",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#E5E7EB",
              },
            },
            "& label.Mui-focused": {
              fontWeight: "bold",
              color: "#000",
            },
            "& label": {
              color: "#000",
            },
          }}
        />
      )}
    />
  );
};

export default InputField;
