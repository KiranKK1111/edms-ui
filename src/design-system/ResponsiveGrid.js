import React from "react";

const bp = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1280,
};

const ResponsiveGrid = ({
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = "var(--space-4)",
  className,
  style,
  children,
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const id = React.useId ? React.useId() : `rg-${Math.random().toString(36).slice(2, 8)}`;
  const safeId = `ds-grid-${id.replace(/[:]/g, "")}`;

  const rules = Object.keys(bp)
    .filter((k) => columns[k])
    .map((k) => {
      const cols = columns[k];
      if (k === "xs") {
        return `.${safeId}{grid-template-columns:repeat(${cols},minmax(0,1fr));}`;
      }
      return `@media (min-width:${bp[k]}px){.${safeId}{grid-template-columns:repeat(${cols},minmax(0,1fr));}}`;
    })
    .join("");

  return (
    <>
      <style>{rules}</style>
      <div
        className={[safeId, className].filter(Boolean).join(" ")}
        style={{ display: "grid", gap, ...(style || {}) }}
      >
        {children}
      </div>
    </>
  );
};

export default ResponsiveGrid;
