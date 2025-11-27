import React, { useEffect, useState } from 'react';
import ghSvgPath from '../public/images/gh.svg';

interface InteractiveMapProps {
    activeRegion?: string;
    onRegionClick?: (regionId: string) => void;
}

export function InteractiveMap({ activeRegion, onRegionClick }: InteractiveMapProps) {
    const [svgContent, setSvgContent] = useState<string | null>(null);

    useEffect(() => {
        const fetchMap = async () => {
            try {
                const response = await fetch(ghSvgPath);
                const text = await response.text();

                // We need to inject classes into the paths.
                // The SVG contains <path ... id="GHxx" ... >
                // We will replace the path tags to include the class logic.
                // Since we can't easily run JS logic inside the string replacement for every single render efficiently without parsing,
                // we will do a string replacement that sets a DEFAULT class, and then we might need a different approach for the ACTIVE one if we want it to be reactive without re-fetching/re-parsing.

                // BETTER APPROACH:
                // Parse the SVG string into a DOM object, manipulate it, and serialize it back?
                // Or just use the string and replace the active one specifically?
                // Replacing specifically is hard with regex if we don't know the exact ID location.

                // Let's use a simple regex to add the BASE classes to ALL paths first.
                // The paths in the file don't have classes yet.

                // 1. Add base classes and event handlers (conceptually)
                // Actually, for React `dangerouslySetInnerHTML`, we can't easily attach React event handlers to the inner HTML elements.
                // We would need to use native event delegation on the container.

                setSvgContent(text);
            } catch (error) {
                console.error("Failed to load map:", error);
            }
        };

        fetchMap();
    }, []);

    // Effect to update the SVG content when activeRegion changes? 
    // No, re-parsing/replacing on every prop change is expensive but maybe acceptable for this size.
    // A better way for React is to convert the SVG string to React elements, but that's complex without a library.

    // Let's stick to string manipulation for now, it's the most robust "no-library" way.
    // We will memoize the base content and apply active class on top.

    const getProcessedSvg = () => {
        if (!svgContent) return null;

        // Remove any existing fill colors so classes can take effect
        let processed = svgContent.replace(/fill="[^"]*"/g, '');

        // Replace the SVG tag with the desired attributes exactly as requested
        processed = processed.replace(/<svg[^>]*>/, '<svg class="h-full w-full" width="auto" height="910" viewBox="0 0 625 910" xmlns="http://www.w3.org/2000/svg">');

        const baseClass = "fill-accent hover:fill-secondary transition-colors duration-300 cursor-pointer";
        const activeClass = "fill-primary hover:fill-secondary transition-colors duration-300 cursor-pointer";

        // Inject base class into all paths
        processed = processed.replace(/<path/g, `<path class="${baseClass}"`);

        // Handle active region if specified
        if (activeRegion) {
            // We look for the path that now has the base class and the matching ID
            const activeRegex = new RegExp(`<path class="${baseClass}"([^>]*?)id="${activeRegion}"`, "g");
            processed = processed.replace(activeRegex, `<path class="${activeClass}"$1id="${activeRegion}"`);
        }

        return processed;
    };

    const finalSvg = getProcessedSvg();

    if (!finalSvg) return <div className="w-full h-64 flex items-center justify-center text-muted-foreground">Loading map...</div>;

    return (
        <div
            className=" h-auto w-auto filter drop-shadow-xl"
            // viewBox="200 100 600 800"
            dangerouslySetInnerHTML={{ __html: finalSvg }}
            onClick={(e) => {
                // Event delegation for clicks
                const target = e.target as HTMLElement;
                const path = target.closest('path');
                if (path && path.id && onRegionClick) {
                    onRegionClick(path.id);
                }
            }}
        />
    );
}
