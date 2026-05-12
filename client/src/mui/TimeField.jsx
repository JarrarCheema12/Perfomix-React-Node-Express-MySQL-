import React from "react";
import TextField from "@mui/material/TextField";
import { Stack } from "@mui/system";

const TimeField = ({name="Time",value, change,...otherProps }) => {
  return (
    <Stack >
      <TextField
        // sx={{ minWidth: { xs: 200, sm: 320 } }}
        name="someDate"
        label={name}
        // defaultValue={new Date().toISOString().split('T')[1]}
        InputLabelProps={{ shrink: true, required: true }}
        type="time"
        size="large"
        value={value}
        onChange={change}
        required={true}
        {...otherProps}
        // defaultValue={values.someDate}
      />
    </Stack>
  );
};

export default TimeField;
