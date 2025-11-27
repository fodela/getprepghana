import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const svgPath = join(process.cwd(), "src/public/images/gh.svg");
const outputPath = join(process.cwd(), "map_bounds.json");

try {
    const svgContent = readFileSync(svgPath, "utf-8");

    // Regex to find all path data
    const pathRegex = /d="([^"]*)"/g;
    let match;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    while ((match = pathRegex.exec(svgContent)) !== null) {
        const d = match[1];
        // Match all numbers that are part of coordinates
        // Commands are M, L, etc. followed by numbers.
        // We just want all numbers.
        // SVG paths can be complex, but usually space or comma separated numbers.
        // We need to handle relative commands (lower case) too? 
        // If the SVG uses relative commands (dx, dy), simple parsing is hard.
        // Let's assume absolute or try to parse best effort.
        // Looking at the file content from previous turn: "M304.3 727.8l-0.7-0.2..."
        // It uses 'l' (relative line to). This makes simple regex parsing of coordinates impossible for bounding box without a real parser.

        // If it uses relative coordinates, we can't easily calculate bounds without a full SVG parser library.
        // However, we can try to find a library-less approach or just ask the user.

        // Wait, if I can't parse it easily, maybe I can just use a standard Ghana bounding box?
        // Ghana is roughly Longitude -3.5 to 1.5, Latitude 4.5 to 11.5.
        // The SVG coordinates 0-1000 likely map to this.

        // Let's look at the first point: M304.3 727.8.
        // If 0,0 is top-left.
        // 304, 727 is somewhere.

        // Maybe I can just ask the user to visually inspect or I can try to guess.
        // OR, I can try to use a simpler heuristic:
        // Just grab all absolute Move (M) coordinates?
        // M x y.
        // That gives starting points of paths.
        // It might give a rough idea.

        // Better idea: The user said "trim off empty spaces".
        // I can try `viewBox="150 0 700 1000"` (trimming 150 from left/right).
        // Ghana is roughly 5 degrees wide, 7 degrees tall. Aspect ratio ~0.7.
        // 1000 height -> 700 width.
        // So 0-1000 width has 300 extra.
        // Centered: 150 left, 150 right.
        // So x=150, width=700.

        // Let's try to write a script that just extracts ALL numbers and finds min/max?
        // No, relative coordinates will mess that up (e.g. l-0.7 means move left 0.7, not coordinate -0.7).

        // Let's try to find the absolute M commands.
        const mRegex = /M\s*(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/gi;
        let mMatch;
        while ((mMatch = mRegex.exec(d)) !== null) {
            const x = parseFloat(mMatch[1]);
            const y = parseFloat(mMatch[2]);
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    }

    // This is very approximate (only start points of paths).
    // But for a map of regions, the start points are usually distributed.

    const width = maxX - minX;
    const height = maxY - minY;

    // Add some padding (5%)
    const paddingX = width * 0.05;
    const paddingY = height * 0.05;

    const finalMinX = Math.floor(minX - paddingX);
    const finalMinY = Math.floor(minY - paddingY);
    const finalWidth = Math.ceil(width + paddingX * 2);
    const finalHeight = Math.ceil(height + paddingY * 2);

    const result = {
        viewBox: `${finalMinX} ${finalMinY} ${finalWidth} ${finalHeight}`,
        details: { minX, minY, maxX, maxY }
    };

    writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log("Calculated bounds:", result);

} catch (error) {
    console.error("Error:", error);
}
