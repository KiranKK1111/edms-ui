import React from "react";
import { TRUSTMARK, WORDMARK } from "./scbLogoPaths";

/*
  ScbLogo — inline SVG of the Standard Chartered logo.

  Rendered inline (not via background-image) so the "standard chartered"
  wordmark can use currentColor and follow the active theme (dark on light,
  light on dark), while the trustmark keeps its fixed blue/green brand palette.
  The long SVG path geometry lives in scbLogoPaths.js to keep this component
  small.
*/
const ScbLogo = ({ className, title = "Standard Chartered" }) => (
  <svg
    className={className}
    width="130"
    height="48"
    viewBox="0 0 130 48"
    role="img"
    aria-label={title}
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>{title}</title>
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g transform="translate(-1189.000000, -48.000000)" fillRule="nonzero">
        <g transform="translate(910.000000, 0.000000)">
          <g transform="translate(279.000000, 48.000000)">
            <g transform="translate(0.214514, 0.343745)">
              {TRUSTMARK.map((seg, idx) => (
                <path key={`tm-${idx}`} d={seg.d} fill={seg.fill} />
              ))}
            </g>
            <g transform="translate(48.121047, 10.966227)" fill="currentColor">
              {WORDMARK.map((d, idx) => (
                <path key={`wm-${idx}`} d={d} />
              ))}
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
);

export default ScbLogo;
