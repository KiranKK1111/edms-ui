import React from "react";
import PageHero from "./PageHero";
import "./PageLayout.css";

/*
  PageLayout — single reusable page shell for the whole app.

  Composition:

      ┌────────────────────────────────────────────────┐
      │ PageHero                                       │
      │   breadcrumb · title · subtitle · actions      │
      │   (heroChildren — optional inline content)     │
      └────────────────────────────────────────────────┘
      ┌────────────────────────────────────────────────┐
      │ children (the page's main content)             │
      └────────────────────────────────────────────────┘

  Use this as the outer wrapper for every top-level page so the breadcrumb,
  title, and subtitle have the same rhythm everywhere (Catalogue, Master
  Data, Subscriptions, dataset details, etc.).

  Props:
    breadcrumb     : Array<{ name, url? }>     crumbs after the home icon
    title          : string | ReactNode        page title
    subtitle       : string | ReactNode        muted descriptive line
    backTo         : string | null              optional back-arrow target
    badge          : { color, ... } | null      optional dot beside title
    actions        : ReactNode                  right-aligned hero actions
    heroChildren   : ReactNode                  rendered inside the hero card
    children       : ReactNode                  the page body
    className      : string                     appended to the root class
    bounded        : boolean                    if true, fits the viewport
                                                (no page-level scroll). The
                                                page body becomes a flex
                                                column that the inner card
                                                can fill via flex:1.
*/
const PageLayout = ({
  breadcrumb,
  title,
  subtitle,
  backTo,
  badge,
  actions,
  heroChildren,
  children,
  className,
  bounded = false,
}) => (
  <div
    className={[
      "page-layout",
      bounded ? "page-layout-bounded" : null,
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    <div className="page-layout-hero">
      <PageHero
        breadcrumb={breadcrumb}
        title={title}
        subtitle={subtitle}
        backTo={backTo}
        badge={badge}
        actions={actions}
      >
        {heroChildren}
      </PageHero>
    </div>
    <div className="page-layout-content">{children}</div>
  </div>
);

export default PageLayout;
