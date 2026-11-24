import { renderToString } from "react-dom/server";
import { MainApp } from "./app/MainApp";
import { setRenderTime } from "./lib/renderTime";
import { site } from "./content";
export function render(pathname: string, timestamp: number) {
  setRenderTime(timestamp);
  return renderToString(<MainApp pathname={pathname} />);
}
export { site };
