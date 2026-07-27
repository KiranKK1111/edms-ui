import { memo } from "react";
import Headers from "../pages/header/Header";
import "./AppLayout.css";

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <div className="app-shell-header">
        <Headers />
      </div>
      <main className="app-shell-main" id="app-main">
        {children}
      </main>
    </div>
  );
}

export default memo(AppLayout);