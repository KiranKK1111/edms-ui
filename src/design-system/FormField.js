import React from "react";
import { Controller } from "react-hook-form";
import {
  Autocomplete,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

/*
  FormField — react-hook-form Controller wrapper for MUI inputs.

  Usage:
    const { control } = useForm({ defaultValues: { ... } });
    <FormField name="username" label="Username" control={control} required />
    <FormField name="password" label="Password" type="password" control={control} required />
    <FormField name="status" type="select" options={[{ value, label }]} control={control} />

  Props:
    name      : field name (RHF)
    label     : input label
    control   : RHF control object
    rules     : RHF validation rules (or set `required` shortcut)
    required  : convenience for { required: "<label> is required" }
    type      : "text" | "password" | "number" | "select" | "switch" | "checkbox" | "radio" | "textarea"
    options   : for "select" / "radio" — Array<{ value, label, disabled? }>
    helperText: static helper text (overridden by error)
    Any other props pass through to the underlying MUI control.
*/

const buildRules = ({ rules, required, label }) => {
  const merged = { ...(rules || {}) };
  if (required && !merged.required) {
    merged.required =
      typeof required === "string"
        ? required
        : `${label || "This field"} is required`;
  }
  return merged;
};

const FormField = ({
  name,
  label,
  control,
  rules,
  required,
  type = "text",
  options = [],
  helperText,
  multiline,
  rows,
  fullWidth = true,
  size = "small",
  disabled,
  placeholder,
  InputProps,
  inputProps,
  startAdornment,
  endAdornment,
  defaultValue,
  onChange: onChangeProp,
  onBlur: onBlurProp,
  ...rest
}) => {
  const finalRules = buildRules({ rules, required, label });

  // Compose a consumer-supplied handler with react-hook-form's own handler so
  // custom onChange/onBlur (e.g. live validation) run WITHOUT clobbering the
  // field state update. Without this, passing onChange to a field stops it
  // from registering keystrokes.
  const compose = (rhfHandler, customHandler) => (event) => {
    rhfHandler(event);
    if (customHandler) customHandler(event);
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={finalRules}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        const error = fieldState.error;
        const helper = error ? error.message : helperText;

        if (type === "autocomplete") {
          // Searchable combobox. Supports string options or {value,label}.
          const isObj =
            options.length > 0 && typeof options[0] === "object";
          const getLabel = (o) =>
            o == null ? "" : isObj ? o.label ?? o.value ?? "" : String(o);
          const selected = isObj
            ? options.find((o) => o.value === field.value) ?? null
            : field.value ?? null;
          return (
            <Autocomplete
              options={options}
              value={selected}
              onChange={(_, newVal) => {
                const v = newVal == null ? "" : isObj ? newVal.value : newVal;
                field.onChange(v);
                if (onChangeProp) onChangeProp(v);
              }}
              onBlur={compose(field.onBlur, onBlurProp)}
              getOptionLabel={getLabel}
              isOptionEqualToValue={(opt, val) =>
                isObj ? opt.value === (val?.value ?? val) : opt === val
              }
              disabled={disabled}
              fullWidth={fullWidth}
              size={size}
              slotProps={{
                paper: { sx: { maxHeight: 200 } },
                listbox: { sx: { maxHeight: 168 } },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={label}
                  placeholder={placeholder}
                  error={!!error}
                  helperText={helper}
                  inputRef={field.ref}
                />
              )}
              {...rest}
            />
          );
        }

        if (type === "select") {
          return (
            <FormControl
              size={size}
              fullWidth={fullWidth}
              error={!!error}
              disabled={disabled}
            >
              {label && <InputLabel id={`${name}-label`}>{label}</InputLabel>}
              <Select
                labelId={`${name}-label`}
                label={label}
                value={field.value ?? ""}
                onChange={compose(field.onChange, onChangeProp)}
                onBlur={compose(field.onBlur, onBlurProp)}
                inputRef={field.ref}
                MenuProps={{
                  anchorOrigin: { vertical: "bottom", horizontal: "left" },
                  transformOrigin: { vertical: "top", horizontal: "left" },
                  slotProps: {
                    paper: { sx: { maxHeight: 180 } },
                  },
                  sx: {
                    "& .MuiMenu-paper, & .MuiPaper-root": { maxHeight: 180 },
                  },
                }}
                {...rest}
              >
                {options.map((opt, idx) =>
                  typeof opt === "string" ? (
                    <MenuItem key={`${opt}-${idx}`} value={opt}>
                      {opt}
                    </MenuItem>
                  ) : (
                    <MenuItem
                      key={`${opt.value}-${idx}`}
                      value={opt.value}
                      disabled={opt.disabled}
                    >
                      {opt.label ?? opt.value}
                    </MenuItem>
                  )
                )}
              </Select>
              {helper && <FormHelperText>{helper}</FormHelperText>}
            </FormControl>
          );
        }

        if (type === "switch") {
          return (
            <FormControl error={!!error} disabled={disabled}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    {...rest}
                  />
                }
                label={label}
              />
              {helper && <FormHelperText>{helper}</FormHelperText>}
            </FormControl>
          );
        }

        if (type === "checkbox") {
          return (
            <FormControl error={!!error} disabled={disabled}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    {...rest}
                  />
                }
                label={label}
              />
              {helper && <FormHelperText>{helper}</FormHelperText>}
            </FormControl>
          );
        }

        if (type === "radio") {
          return (
            <FormControl error={!!error} disabled={disabled}>
              {label && <InputLabel shrink>{label}</InputLabel>}
              <RadioGroup
                value={field.value ?? ""}
                onChange={compose(field.onChange, onChangeProp)}
                onBlur={compose(field.onBlur, onBlurProp)}
                row={rest.row}
              >
                {options.map((opt) => {
                  const o =
                    typeof opt === "string"
                      ? { value: opt, label: opt }
                      : opt;
                  return (
                    <FormControlLabel
                      key={o.value}
                      value={o.value}
                      control={<Radio />}
                      label={o.label ?? o.value}
                      disabled={o.disabled}
                    />
                  );
                })}
              </RadioGroup>
              {helper && <FormHelperText>{helper}</FormHelperText>}
            </FormControl>
          );
        }

        if (type === "date") {
          return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={label}
                value={field.value || null}
                onChange={(val) => {
                  field.onChange(val);
                  if (onChangeProp) onChangeProp(val);
                }}
                format={rest.format || "DD/MMM/YYYY"}
                disabled={disabled}
                minDate={rest.minDate}
                maxDate={rest.maxDate}
                shouldDisableDate={rest.shouldDisableDate}
                slotProps={{
                  textField: {
                    fullWidth,
                    size,
                    error: !!error,
                    helperText: helper,
                    placeholder,
                    onBlur: compose(field.onBlur, onBlurProp),
                  },
                }}
              />
            </LocalizationProvider>
          );
        }

        return (
          <TextField
            {...field}
            value={field.value ?? ""}
            onChange={compose(field.onChange, onChangeProp)}
            onBlur={compose(field.onBlur, onBlurProp)}
            label={label}
            type={type === "textarea" ? "text" : type}
            multiline={type === "textarea" || multiline}
            rows={type === "textarea" ? rows || 4 : rows}
            placeholder={placeholder}
            error={!!error}
            helperText={helper}
            fullWidth={fullWidth}
            size={size}
            disabled={disabled}
            slotProps={{
              input: {
                ...(startAdornment ? { startAdornment } : {}),
                ...(endAdornment ? { endAdornment } : {}),
                ...InputProps,
              },
              htmlInput: inputProps,
            }}
            {...rest}
          />
        );
      }}
    />
  );
};

export default FormField;
