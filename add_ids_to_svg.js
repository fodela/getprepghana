const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'src/public/images/gh.svg');

try {
    let svgContent = fs.readFileSync(svgPath, 'utf8');
    let regionCount = 0;

    // Replace each <path ...> with <path id="region-N" name="Region N" ...>
    // We use a regex with a callback function to increment the counter
    const newSvgContent = svgContent.replace(/<path/g, (match) => {
        regionCount++;
        return `<path id="region-${regionCount}" name="Region ${regionCount}"`;
    });

    fs.writeFileSync(svgPath, newSvgContent, 'utf8');
    console.log(`Successfully added IDs to ${regionCount} regions in ${svgPath}`);

} catch (error) {
    console.error('Error processing SVG:', error);
}
