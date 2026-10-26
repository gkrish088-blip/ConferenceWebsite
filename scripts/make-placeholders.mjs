import { mkdir, access, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../public/", import.meta.url));
const assets = [
  ["assets/logos/iitr.svg", logo("IITR")],
  ["assets/logos/csir-iip.svg", logo("CSIR-IIP")],
  ["assets/logos/hkust.svg", logo("HKUST")],
  ["placeholders/portrait.svg", portrait()],
  ["placeholders/hospitality.svg", hospitality()],
];

for (const [relativePath, svg] of assets) {
  const file = join(root, relativePath);
  if (relativePath === "placeholders/portrait.svg") {
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, svg, "utf8");
    console.log(`Updated ${relativePath}`);
    continue;
  }
  try {
    await access(file);
  } catch {
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, svg, "utf8");
    console.log(`Created ${relativePath}`);
  }
}

function logo(mark) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="216" height="72" viewBox="0 0 216 72"><rect width="216" height="72" fill="#DCE9F1"/><path d="M12 57H204" stroke="#1F5F8B" stroke-width="2"/><text x="14" y="32" fill="#10263F" font-family="Arial,sans-serif" font-size="20" font-weight="700">${mark}</text><text x="14" y="51" fill="#6B6A60" font-family="Arial,sans-serif" font-size="14">Logo placeholder</text></svg>`;
}

function portrait() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400" viewBox="0 0 320 400"><rect width="320" height="400" fill="#FBFCFD"/><circle cx="160" cy="133" r="61" fill="#DCE9F1" stroke="#1F5F8B" stroke-opacity=".42" stroke-width="3"/><path d="M56 354c8-66 47-113 104-113s96 47 104 113c1 11-7 19-18 19H74c-11 0-19-8-18-19Z" fill="#DCE9F1" stroke="#1F5F8B" stroke-opacity=".42" stroke-width="3" stroke-linejoin="round"/></svg>';
}

function hospitality() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#DCE9F1"/><path d="M24 48C84 20 130 24 180 49S276 78 376 40M24 84C84 56 130 60 180 85S276 114 376 76M24 120C84 92 130 96 180 121S276 150 376 112M24 156H376" fill="none" stroke="#1F5F8B" stroke-width="2"/><rect x="72" y="184" width="256" height="70" fill="#FBFCFD" stroke="#1F5F8B" stroke-width="2"/><text x="200" y="226" text-anchor="middle" fill="#10263F" font-family="Arial,sans-serif" font-size="18">Image placeholder</text></svg>';
}
