import { useCallback, useEffect, useState } from "react";
import { site } from "../content";

export type PageId = (typeof site.nav)[number]["id"];

export const pathFor = (id: string) => (id === "about" ? "/" : `/${id}/`);

export function pageFromPath(pathname: string): PageId {
  const slug = pathname.replace(/^\/+|\/+$/g, "");
  const match = site.nav.find((item) => item.id === slug);
  return (match ? match.id : "about") as PageId;
}

export function usePage(initialPath = "/") {
  const [page, setPage] = useState<PageId>(() => pageFromPath(initialPath));

  useEffect(() => {
    const onPop = () => setPage(pageFromPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((id: PageId) => {
    const path = pathFor(id);
    if (window.location.pathname !== path || window.location.hash) {
      window.history.pushState(null, "", path);
    }
    setPage(id);
    window.scrollTo(0, 0);
    requestAnimationFrame(() =>
      document.getElementById("main-content")?.focus({ preventScroll: true }),
    );
  }, []);

  return { page, navigate };
}
