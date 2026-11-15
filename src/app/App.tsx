import { MembraneSiteApp } from "./MembraneSiteApp";
import { LandingApp } from "./LandingApp";
import "../styles/base.css";
export function App({
  pathname = "/",
  fullMode = true,
}: {
  pathname?: string;
  fullMode?: boolean;
}) {
  if (!fullMode || /^\/countdown\/*$/.test(pathname))
    return <LandingApp fullMode={fullMode} />;
  return <MembraneSiteApp initialPath={pathname} />;
}
