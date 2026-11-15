import { mount } from "./components/mount";
import { App } from "./app/App";
mount(
  <App
    pathname={window.location.pathname}
    fullMode={import.meta.env.VITE_LAUNCH_MODE !== "landing"}
  />,
);
