import React from "react";
import TextField from "@mui/material/TextField";
import { Stack } from "@mui/material";
import { FaRegCalendarAlt } from "react-icons/fa"; // Import the date icon from React Icons

const DateField = ({ name = "Date", value, change, ...otherProps }) => {
  return (
    <Stack sx={{ width: '48%' }}> {/* Set the width of the container */}
      <TextField
        name="someDate"
        label={name}
        InputLabelProps={{ shrink: true }}
        type="date"
        size="large"
        value={value}
        onChange={change}
        required
        {...otherProps}
        sx={{ width: '100%' }} // Ensure TextField takes the full width of the Stack
      />
    </Stack>
  );
};

export default DateField;
