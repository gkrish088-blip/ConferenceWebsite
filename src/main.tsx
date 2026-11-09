import React from "react";
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root")!);

const fullMode = import.meta.env.VITE_LAUNCH_MODE !== "landing";
const countdown = /^\/countdown\/*$/.test(window.location.pathname);

if (!fullMode || countdown) {
  void Promise.all([
    import("./styles/base.css"),
    import("./app/LandingApp"),
  ]).then(([, { LandingApp }]) => {
    root.render(
      <React.StrictMode>
        <LandingApp fullMode={fullMode} />
      </React.StrictMode>,
    );
  });
} else {
  void import("./app/FlowExampleApp").then(({ FlowExampleApp }) => {
    root.render(
      <React.StrictMode>
        <FlowExampleApp />
      </React.StrictMode>,
    );
  });
}
