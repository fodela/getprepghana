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

        // 1. Remove any existing fill colors if present (the file has fill="#6f9c76")
        let processed = svgContent.replace(/fill="[^"]*"/g, '');

        // 2. Add base classes to all paths
        // We look for <path and add class="..."
        // We also need to ensure we don't break existing attributes.
        // The file has <path d="..." id="..." name="...">

        // We want to inject: className="fill-accent hover:fill-secondary transition-colors duration-300 cursor-pointer"
        // BUT for the active region, we want "fill-primary ..."

        // We can do a global replace to add the common classes.
        // And then a specific replace for the active ID.

        const baseClass = "fill-accent hover:fill-secondary transition-colors duration-300 cursor-pointer";
        const activeClass = "fill-primary hover:fill-secondary transition-colors duration-300 cursor-pointer";

        // Replace <path with <path class="BASE_CLASS"
        // Note: SVG uses 'class' attribute, not 'className' when string injected.
        processed = processed.replace(/<path/g, `<path class="${baseClass}"`);

        // Now find the active region and replace its class.
        // We look for id="ACTIVE_ID" ... class="BASE_CLASS" (order might vary)
        // Or easier: just replace the specific ID's class.
        // We know we just added class="${baseClass}" right after <path.
        // So we can look for `<path class="${baseClass}" ... id="${activeRegion}"`
        // Regex is tricky because attributes order is unknown.

        // Alternative: Split by id="activeRegion" and replace the class before it?
        // Let's try to be specific if possible.
        // The file format is consistent: <path d="..." id="GHxx" name="...">

        if (activeRegion) {
            // We can use a regex that finds the path with the specific ID
            // and replaces the previously added base class with the active class.
            // Since we prepended the class, it's `<path class="BASE" ... id="ACTIVE" ...`
            // We can match `<path class="${baseClass}"([^>]*?)id="${activeRegion}"`
            const activeRegex = new RegExp(`<path class="${baseClass}"([^>]*?)id="${activeRegion}"`, "g");
            processed = processed.replace(activeRegex, `<path class="${activeClass}"$1id="${activeRegion}"`);
        }

        return processed;
    };

    const finalSvg = getProcessedSvg();

    if (!finalSvg) return <div className="w-full h-64 flex items-center justify-center text-muted-foreground">Loading map...</div>;

    return (
        <div
            className="w-full h-auto filter drop-shadow-xl"
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
