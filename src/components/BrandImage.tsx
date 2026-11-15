import { useContext, type ImgHTMLAttributes } from "react";
import { ThemeContext } from "./ThemeContext";
type BrandSource = { src: string; darkSrc?: string; alt: string };
export function BrandImage({
  image,
  ...props
}: { image: BrandSource } & Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt"
>) {
  const theme = useContext(ThemeContext);
  return (
    <img
      {...props}
      src={theme === "dark" ? (image.darkSrc ?? image.src) : image.src}
      alt={image.alt}
    />
  );
}
