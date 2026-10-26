import React from "react";
import { createRoot } from "react-dom/client";
import { LandingApp } from "./app/LandingApp";
import "./styles/base.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LandingApp fullMode={import.meta.env.VITE_LAUNCH_MODE !== "landing"} />
  </React.StrictMode>,
);
