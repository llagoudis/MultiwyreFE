import { MenuItem, Select } from "@mui/material";
import { Fragment } from "react";
import { Controller } from "react-hook-form";

interface InputProps {
  name: string;
  label: string;
  control: any;
  rules?: {
    required?: string;
    validate?: any;
  };
  options: any[];
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  valueKey?: string;
  labelKey?: string;
  onChange?: (value: any) => void;
}

const ExchangeDropdown: React.FC<InputProps> = ({
  name,
  label,
  control,
  rules,
  options,
  placeholder,
  disabled,
  valueKey = "value",
  labelKey = "label",
}) => {
  return (
    <div className="mb-4 mt-3">
      <label className="mb-1 block">
        {label}
        {rules?.required && <span className="text-red-500">*</span>}
      </label>

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({
          field: { value = "", onChange },
          fieldState: { error },
        }) => (
          <Fragment>
            <Select
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e5e7eb",
                },
              }}
              MenuProps={{
                style: { maxWidth: "200px" },
              }}
              value={value}
              defaultValue={value}
              renderValue={(val) => {
                if (!val) {
                  return (
                    <span className="font-extralight text-[#bfbfbf]">
                      {placeholder}
                    </span>
                  );
                }
                return options.find((item) => item[valueKey] === val)?.[
                  labelKey
                ];
              }}
              fullWidth
              size="small"
              displayEmpty
              variant="outlined"
              onChange={onChange}
              disabled={disabled}
            >
              {options?.map((option) => (
                <MenuItem
                  style={{ whiteSpace: "normal" }}
                  key={option[valueKey]}
                  value={option[valueKey]}
                >
                  {option[labelKey]}
                </MenuItem>
              ))}
            </Select>
            <p className="text-xs text-red-500">{error?.message}</p>
          </Fragment>
        )}
      />
    </div>
  );
};

export default ExchangeDropdown;
