import { MainApp } from "./MainApp";
import { LandingApp } from "./LandingApp";
import "../styles/base.css";
export function App({
  pathname = "/",
  fullMode = true,
}: {
  pathname?: string;
  fullMode?: boolean;
}) {
  if (!fullMode) return <LandingApp />;
  return <MainApp pathname={pathname} />;
}
