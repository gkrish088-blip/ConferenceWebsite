import { StrictMode, type ReactNode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
export function mount(content: ReactNode) {
  const container = document.getElementById("root")!;
  const app = <StrictMode>{content}</StrictMode>;
  if (container.hasChildNodes()) hydrateRoot(container, app);
  else createRoot(container).render(app);
}
