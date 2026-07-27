import React from "react";
import { Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

/*
  FieldLabel — uniform label markup for every form field.

  Renders:  Label * (i)
    - Label   : the field name, left-aligned
    - *       : optional red required asterisk at the end of the label text
    - (i)     : optional info icon, hovering shows the tooltip text

  Use this for both antd Form.Item labels and MUI form fields so every page
  in the app has the same label style.

  Props:
    text     : label text (string or node)
    required : if true, renders the red asterisk after the label text
    tooltip  : tooltip text — when set, renders an info icon at the end
    className: appended to root element
*/

const FieldLabel = ({ text, required, tooltip, className }) => (
  <span
    className={["page-form-label", className].filter(Boolean).join(" ")}
  >
    <span className="page-form-label-text">{text}</span>
    {required && (
      <span className="page-form-label-required" aria-hidden="true">
        *
      </span>
    )}
    {tooltip && (
      <Tooltip title={tooltip} arrow placement="top">
        <InfoOutlinedIcon
          className="page-form-label-info"
          fontSize="inherit"
          aria-label="More info"
        />
      </Tooltip>
    )}
  </span>
);

export default FieldLabel;
