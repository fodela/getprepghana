import React, { useEffect, useState } from 'react';
import ghSvgPath from '../public/images/gh.svg';

interface InteractiveMapProps {
    activeRegion?: string;
    onRegionClick?: (regionId: string, regionName: string, pathData: string) => void;
}

export function InteractiveMap({ activeRegion, onRegionClick }: InteractiveMapProps) {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [hoveredRegion, setHoveredRegion] = useState<{ name: string, x: number, y: number } | null>(null);

    useEffect(() => {
        const fetchMap = async () => {
            try {
                const response = await fetch(ghSvgPath);
                const text = await response.text();
                setSvgContent(text);
            } catch (error) {
                console.error("Failed to load map:", error);
            }
        };

        fetchMap();
    }, []);

    const getProcessedSvg = () => {
        if (!svgContent) return null;

        // Remove any existing fill colors so classes can take effect
        let processed = svgContent.replace(/fill="[^"]*"/g, '');

        // Replace the SVG tag with the desired attributes exactly as requested
        processed = processed.replace(/<svg[^>]*>/, '<svg class="h-full w-full" width="auto" height="910" viewBox="0 0 625 910" xmlns="http://www.w3.org/2000/svg">');

        const baseClass = "fill-accent hover:fill-secondary transition-colors duration-300 cursor-pointer";
        const activeClass = "fill-primary hover:fill-secondary transition-colors duration-300 cursor-pointer";

        // Region mapping based on user input
        const regionMap: { [key: number]: { id: string, name: string } } = {
            1: { id: "AHAFO", name: "Ahafo" },
            3: { id: "ASHANTI", name: "Ashanti" },
            4: { id: "BONO_EAST", name: "Bono East" },
            5: { id: "BONO", name: "Bono" },
            6: { id: "CENTRAL", name: "Central" },
            7: { id: "EASTERN", name: "Eastern" },
            8: { id: "GREATER_ACCRA", name: "Greater Accra" },
            9: { id: "NORTHERN", name: "Northern" },
            10: { id: "NORTH_EAST", name: "North East" },
            11: { id: "OTI", name: "Oti" },
            12: { id: "SAVANNAH", name: "Savannah" },
            13: { id: "UPPER_WEST", name: "Upper West" },
            14: { id: "UPPER_EAST", name: "Upper East" },
            15: { id: "VOLTA", name: "Volta" },
            17: { id: "WESTERN", name: "Western" },
            19: { id: "WESTERN_NORTH", name: "Western North" }
        };

        // Inject base class and IDs into all paths
        let regionCount = 0;
        processed = processed.replace(/<path/g, () => {
            regionCount++;
            const region = regionMap[regionCount];
            if (region) {
                return `<path id="${region.id}" name="${region.name}" class="${baseClass}"`;
            }
            return `<path class="${baseClass}"`;
        });

        // Handle active region if specified
        if (activeRegion) {
            const activeRegex = new RegExp(`<path id="${activeRegion}"([^>]*?)class="${baseClass}"`, "g");
            processed = processed.replace(activeRegex, `<path id="${activeRegion}"$1class="${activeClass}"`);
        }

        return processed;
    };

    const finalSvg = getProcessedSvg();

    if (!finalSvg) return <div className="w-full h-64 flex items-center justify-center text-muted-foreground">Loading map...</div>;

    return (
        <>
            <div
                className=" h-auto w-auto filter drop-shadow-xl relative"
                dangerouslySetInnerHTML={{ __html: finalSvg }}
                onClick={(e) => {
                    // Event delegation for clicks
                    const target = e.target as HTMLElement;
                    const path = target.closest('path');
                    if (path) {
                        const regionId = path.id;
                        const regionName = path.getAttribute('name') || regionId;
                        const pathData = path.getAttribute('d') || "";

                        console.log("Clicked Region:", regionId, regionName);

                        if (regionId && onRegionClick) {
                            onRegionClick(regionId, regionName, pathData);
                        }
                    }
                }}
                onMouseMove={(e) => {
                    const target = e.target as HTMLElement;
                    const path = target.closest('path');
                    if (path) {
                        const name = path.getAttribute('name');
                        if (name) {
                            setHoveredRegion({ name, x: e.clientX, y: e.clientY });
                            return;
                        }
                    }
                    setHoveredRegion(null);
                }}
                onMouseLeave={() => setHoveredRegion(null)}
            />
            {hoveredRegion && (
                <div
                    style={{ top: hoveredRegion.y - 40, left: hoveredRegion.x }}
                    className="fixed z-50 bg-popover text-popover-foreground px-3 py-1.5 rounded-md shadow-md text-sm font-bold pointer-events-none transform -translate-x-1/2 border border-border animate-in fade-in duration-200"
                >
                    {hoveredRegion.name}
                </div>
            )}
        </>
    );
}
