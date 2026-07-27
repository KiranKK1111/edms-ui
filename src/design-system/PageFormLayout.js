import React from "react";
import { Box, Step, StepLabel, Stepper, Typography } from "@mui/material";

import PageLayout from "./PageLayout";
import "./PageFormLayout.css";

/*
  PageFormLayout — single reusable wizard shell for every Add / Edit form
  in the app. Wraps the new PageLayout so the breadcrumb + title + actions
  follow the same rhythm as the rest of the app.

  Composition:

    ┌────────────────────────────────────────────────┐
    │ PageHero (via PageLayout)                      │
    │   breadcrumb · title · subtitle · [actions]    │
    └────────────────────────────────────────────────┘
    ┌────────────────────────────────────────────────┐
    │ Meta grid (optional) — key/value tiles         │
    │   DATA FEED ID         DATA FEED STATUS  ...   │
    └────────────────────────────────────────────────┘
    ┌────────────────────────────────────────────────┐
    │ Stepper (optional)                             │
    │ ── content ──                                  │
    │ <FormSection title="Main Configuration">       │
    │   <FormGrid>field field field</FormGrid>       │
    │ ── footer (stepActions) ──                     │
    └────────────────────────────────────────────────┘

  Props:
    title         : page title (string)
    subtitle      : optional descriptive line under title
    breadcrumb    : Array<{ name, url? }> for the Breadcrumb component
    backTo        : optional path; renders the back arrow on the title
    headerActions : right-aligned buttons in the hero (Cancel / Submit)
    meta          : Array<{ label, value }> rendered as a key/value tile grid
    steps         : Array<{ title, description?, icon?, status? }>
    current       : index of the active step
    stepActions   : footer node (Previous / Next / Submit buttons)
    children      : the active step's content
    className     : appended to root
*/

export const MetaGrid = ({ items }) => {
  if (!items || items.length === 0) return null;
  return (
    <Box className="page-form-meta-card">
      <Box className="page-form-meta">
        {items.map((item, idx) => (
          <Box key={item.label || idx} className="page-form-meta-item">
            <Typography component="div" className="page-form-meta-label">
              {item.label}
            </Typography>
            <Box className="page-form-meta-value">{item.value ?? "NA"}</Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const FormSection = ({ title, description, children, className }) => (
  <Box
    className={["page-form-section", className].filter(Boolean).join(" ")}
  >
    {title && (
      <Box className="page-form-section-head">
        <Typography component="h3" className="page-form-section-title">
          {title}
        </Typography>
        {description && (
          <Typography component="p" className="page-form-section-desc">
            {description}
          </Typography>
        )}
      </Box>
    )}
    <Box className="page-form-section-body">{children}</Box>
  </Box>
);

export const FormGrid = ({ columns = 3, children, className }) => (
  <Box
    className={["page-form-grid", className].filter(Boolean).join(" ")}
    sx={{
      "--form-grid-cols": columns,
    }}
  >
    {children}
  </Box>
);

const PageFormLayout = ({
  title,
  subtitle,
  breadcrumb,
  backTo,
  headerActions,
  meta,
  steps,
  current,
  stepActions,
  children,
  className,
}) => {
  return (
    <PageLayout
      breadcrumb={breadcrumb}
      title={title}
      subtitle={subtitle}
      backTo={backTo}
      actions={headerActions}
      className={["page-form", className].filter(Boolean).join(" ")}
    >
      {meta && meta.length > 0 && <MetaGrid items={meta} />}

      <Box className="page-form-card">
        {steps && steps.length > 0 && (
          <Box className="page-form-steps">
            <Stepper activeStep={current ?? 0} alternativeLabel>
              {steps.map((step, idx) => {
                const error = step.status === "error";
                return (
                  <Step
                    key={step.title || step.key || idx}
                    completed={step.status === "finish"}
                  >
                    <StepLabel
                      icon={step.icon}
                      error={error}
                      optional={
                        step.description ? (
                          <Box component="span" sx={{ fontSize: 12 }}>
                            {step.description}
                          </Box>
                        ) : undefined
                      }
                    >
                      {step.title}
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </Box>
        )}

        <Box className="page-form-content">{children}</Box>

        {stepActions && <Box className="page-form-actions">{stepActions}</Box>}
      </Box>
    </PageLayout>
  );
};

export default PageFormLayout;
