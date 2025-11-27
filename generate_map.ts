import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const svgPath = join(process.cwd(), "src/public/images/gh.svg");
const componentPath = join(process.cwd(), "src/components/InteractiveMap.tsx");

try {
  const svgContent = readFileSync(svgPath, "utf-8");

  // Extract paths using regex
  // We need to be careful to capture the full path tag
  const pathRegex = /<path[\s\S]*?\/>|<\path[\s\S]*?><\/path>/g;
  // Actually, the file seems to use <path ... > ... </path> based on previous view
  // Let's use a simpler regex that captures attributes

  // Better approach: match all path tags and extract attributes
  const allPaths = [];
  const regex = /<path([^>]*)>/g;
  let match;

  while ((match = regex.exec(svgContent)) !== null) {
    const attributes = match[1];
    const dMatch = attributes.match(/d="([^"]*)"/);
    const idMatch = attributes.match(/id="([^"]*)"/);
    const nameMatch = attributes.match(/name="([^"]*)"/);

    if (dMatch && idMatch && nameMatch) {
      allPaths.push({
        d: dMatch[1],
        id: idMatch[1],
        name: nameMatch[1]
      });
    }
  }

  const reactPaths = allPaths.map(p => {
    return `        <path
          d="${p.d}"
          id="${p.id}"
          name="${p.name}"
          className={\`transition-colors duration-300 cursor-pointer \${activeRegion === "${p.id}" ? "fill-primary" : "fill-accent hover:fill-secondary"}\`}
          onClick={() => onRegionClick && onRegionClick("${p.id}")}
          key="${p.id}"
        />`;
  });

  const componentContent = `import React from 'react';

interface InteractiveMapProps {
  activeRegion?: string;
  onRegionClick?: (regionId: string) => void;
}

export function InteractiveMap({ activeRegion, onRegionClick }: InteractiveMapProps) {
  return (
    <svg
      baseProfile="tiny"
      viewBox="0 0 1000 1000"
      version="1.2"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto filter drop-shadow-xl"
    >
      <g id="features">
${reactPaths.join("\n")}
      </g>
    </svg>
  );
}
`;

  writeFileSync(componentPath, componentContent);
  console.log(`Successfully generated InteractiveMap.tsx with ${reactPaths.length} paths.`);

} catch (error) {
  console.error("Error generating map:", error);
  process.exit(1);
}
