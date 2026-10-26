import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/base.css";

const root = createRoot(document.getElementById("root")!);

if (import.meta.env.VITE_LAUNCH_MODE === "landing") {
  void import("./app/LandingApp").then(({ LandingApp }) => {
    root.render(
      <React.StrictMode>
        <LandingApp fullMode={false} />
      </React.StrictMode>,
    );
  });
} else {
  void import("./app/MainApp").then(({ MainApp }) => {
    root.render(
      <React.StrictMode>
        <MainApp />
      </React.StrictMode>,
    );
  });
}
