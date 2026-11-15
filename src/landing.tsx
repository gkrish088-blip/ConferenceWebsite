import { mount } from "./components/mount";
import { LandingApp } from "./app/LandingApp";
import "./styles/base.css";
mount(<LandingApp fullMode={import.meta.env.VITE_LAUNCH_MODE !== "landing"} />);
