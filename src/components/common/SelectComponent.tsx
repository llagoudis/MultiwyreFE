import { InputLabel, MenuItem, Select, type SelectProps } from "@mui/material";
import { type FC } from "react";
import { Controller } from "react-hook-form";

type optionType = Record<string, any>;

interface InputProps {
  name: string;
  options: optionType[];
  label: string;
  control: any;
  required?: boolean;
  labelKey?: string;
  valueKey?: string;
  getOptionLabel?(option: optionType): string;
  rules?: {
    required?: string | { value: boolean; message: string };
    validate?: any;
  };
}

const SelectComponent: FC<InputProps> = ({
  name,
  label,
  control,
  rules,
  required,
  options,
  valueKey,
  labelKey,
  getOptionLabel,
  ...props
}) => {
  // <label htmlFor={name} className="subText mb-3 block">
  //       {label}
  //       {/* {required && <span className=" text-[#565656]">*</span>} */}
  //     </label>
  return (
    <div className="w-full">
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <div>
            {/* <InputLabel id="demo-simple-select-label"> {label}</InputLabel> */}
            <Select
              size="small"
              {...props}
              {...field}
              value={field.value || ""}
              className="w-full rounded bg-white"
              // disabled={disabled}
              displayEmpty
              inputProps={{ "aria-label": "Without label" }}
            >
              <MenuItem value="">
                <span className=" text-gray-400">{label}</span>
              </MenuItem>
              {options.map((code) => (
                <MenuItem
                  key={valueKey ? code[valueKey] : code.value}
                  value={valueKey ? code[valueKey] : code.value}
                  className="font-small cursor-pointer "
                >
                  {getOptionLabel
                    ? getOptionLabel(code)
                    : labelKey
                    ? code[labelKey]
                    : code.label}
                </MenuItem>
              ))}
            </Select>
            {error && <p className="text-sm text-red-500">{error?.message}</p>}
          </div>
        )}
      />
    </div>
  );
};

export default SelectComponent;
