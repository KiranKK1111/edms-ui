import React from "react";
import {
  WORDMARK_PATH,
  MARK_CLIP_PATH,
  MARK_BLUE_POINTS,
  MARK_GREEN_POINTS,
  MARK_GREY_PATH,
} from "./brandLogoPaths";

/*
  BrandLogo — inline SVG version of the EDP logo.

  Rendered inline (not via <img>) so the "External Data Platform" wordmark can
  use currentColor and follow the active theme (dark/light) via CSS, while the
  brand mark keeps its fixed blue/green/grey palette. The long SVG path
  geometry lives in brandLogoPaths.js to keep this component small.
*/
const BrandLogo = ({ className, title = "External Data Platform" }) => (
  <svg
    className={className}
    width="240"
    height="50"
    viewBox="0 0 185 24"
    role="img"
    aria-label={title}
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <title>{title}</title>
    <defs>
      <path d={MARK_CLIP_PATH} id="brand-logo-path" />
    </defs>
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g transform="translate(-24.000000, -96.000000)">
        <g transform="translate(0.000000, 80.000000)">
          <g transform="translate(24.000000, 16.000000)">
            <path d={WORDMARK_PATH} fill="currentColor" fillRule="nonzero" />
            <g>
              <mask id="brand-logo-mask" fill="white">
                <use xlinkHref="#brand-logo-path" />
              </mask>
              <polygon
                fill="#0075EA"
                mask="url(#brand-logo-mask)"
                points={MARK_BLUE_POINTS}
              />
              <polygon
                fill="#37D202"
                mask="url(#brand-logo-mask)"
                points={MARK_GREEN_POINTS}
              />
              <path
                d={MARK_GREY_PATH}
                fill="#525355"
                mask="url(#brand-logo-mask)"
              />
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
);

export default BrandLogo;
