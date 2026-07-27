import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Menu, MenuItem } from "@mui/material";
import { MoreHoriz as MoreHorizIcon } from "@mui/icons-material";

/*
  ActionsMenu — shared "More" overflow menu for table row actions.

  Renders a text button with a trailing icon that opens a menu of secondary
  actions. Used by the master-data tables (agreements, licences, datasets,
  data feeds) so every overflow menu looks and behaves identically.

  Props:
    items    : Array<{
                 key?     : string,
                 icon?    : ReactNode,
                 label    : ReactNode,
                 to?      : string | object,   // router link target (optional)
                 onClick? : () => void,
                 disabled?: boolean,
                 danger?  : boolean,           // red, destructive styling
               }>
    disabled : boolean   disables the trigger button
    label    : string    trigger label (defaults to "More")
*/
const ActionsMenu = ({ items = [], disabled = false, label = "More" }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Button
        variant="text"
        size="small"
        onClick={handleOpen}
        disabled={disabled}
        endIcon={<MoreHorizIcon />}
      >
        {label}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {items.map((item, idx) => (
          <MenuItem
            key={item.key || idx}
            disabled={item.disabled}
            onClick={() => {
              handleClose();
              if (typeof item.onClick === "function") item.onClick();
            }}
            sx={{ gap: 1, color: item.danger ? "error.main" : "text.primary" }}
            component={item.to ? Link : "div"}
            to={item.to}
          >
            {item.icon}
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ActionsMenu;
