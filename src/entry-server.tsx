import { renderToString } from "react-dom/server";
import { App } from "./app/App";
import { setRenderTime } from "./lib/renderTime";
import { site } from "./content";
export function render(pathname: string, fullMode: boolean, timestamp: number) {
  setRenderTime(timestamp);
  return renderToString(<App pathname={pathname} fullMode={fullMode} />);
}
export { site };
