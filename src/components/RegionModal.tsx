import React, { useEffect, useState, useRef } from 'react';

interface Facility {
    id: number;
    name: string;
    address: string;
    phone: string;
    contact_name: string;
    contact_phone: string;
    drug_status: 'available' | 'low' | 'out';
    latitude: number;
    longitude: number;
}

interface RegionModalProps {
    isOpen: boolean;
    onClose: () => void;
    regionId: string;
    regionName: string;
    pathData: string;
}

export function RegionModal({ isOpen, onClose, regionId, regionName, pathData }: RegionModalProps) {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
    const [viewBox, setViewBox] = useState("0 0 625 910");
    const [isZoomed, setIsZoomed] = useState(false);
    const pathRef = useRef<SVGPathElement>(null);

    useEffect(() => {
        if (isOpen && regionId) {
            setLoading(true);
            // Reset zoom state
            setIsZoomed(false);
            setViewBox("0 0 625 910");

            fetch(`/api/facilities?region=${regionId}`)
                .then(res => res.json())
                .then(data => {
                    setFacilities(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch facilities:", err);
                    setLoading(false);
                });
        }
    }, [isOpen, regionId]);

    // Zoom Animation Effect
    useEffect(() => {
        if (isOpen && pathRef.current) {
            // Small timeout to ensure DOM is ready and layout is calculated
            const timer = setTimeout(() => {
                if (!pathRef.current) return;

                try {
                    const bbox = pathRef.current.getBBox();

                    // Calculate target viewBox with padding
                    // We want to zoom in but keep some context
                    const paddingX = bbox.width * 0.5;
                    const paddingY = bbox.height * 0.5;

                    // Ensure we don't zoom out if the region is huge (unlikely for regions vs whole country)
                    // and constrain to the map bounds roughly
                    const targetX = Math.max(0, bbox.x - paddingX / 2);
                    const targetY = Math.max(0, bbox.y - paddingY / 2);
                    const targetWidth = bbox.width + paddingX;
                    const targetHeight = bbox.height + paddingY;

                    const start = { x: 0, y: 0, w: 625, h: 910 };
                    const end = { x: targetX, y: targetY, w: targetWidth, h: targetHeight };

                    const startTime = performance.now();
                    const duration = 1000; // 1s zoom

                    const animate = (time: number) => {
                        const elapsed = time - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Cubic ease out
                        const ease = 1 - Math.pow(1 - progress, 3);

                        const currentX = start.x + (end.x - start.x) * ease;
                        const currentY = start.y + (end.y - start.y) * ease;
                        const currentW = start.w + (end.w - start.w) * ease;
                        const currentH = start.h + (end.h - start.h) * ease;

                        setViewBox(`${currentX} ${currentY} ${currentW} ${currentH}`);

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            setIsZoomed(true);
                        }
                    };

                    requestAnimationFrame(animate);
                } catch (e) {
                    console.error("Animation error:", e);
                    // Fallback
                    setIsZoomed(true);
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [isOpen, regionId, pathData]);

    // Reset selected facility when modal closes or region changes
    useEffect(() => {
        if (!isOpen) setSelectedFacility(null);
    }, [isOpen, regionId]);

    // Approximate bounding box for Ghana to map Lat/Lng to SVG coordinates (0 0 625 910)
    // These values might need fine-tuning based on the specific projection of gh.svg
    const GHANA_BOUNDS = {
        minLat: 4.738,
        maxLat: 11.175,
        minLng: -3.260,
        maxLng: 1.200
    };

    const projectPoint = (lat: number, lng: number) => {
        const width = 625;
        const height = 910;

        const x = ((lng - GHANA_BOUNDS.minLng) / (GHANA_BOUNDS.maxLng - GHANA_BOUNDS.minLng)) * width;
        // Y is inverted in SVG (0 is top)
        const y = ((GHANA_BOUNDS.maxLat - lat) / (GHANA_BOUNDS.maxLat - GHANA_BOUNDS.minLat)) * height;

        return { x, y };
    };

    // Calculate label positions to avoid overlap
    const getLabelLayout = () => {
        const layout: { [key: number]: { x: number, y: number, anchor: string } } = {};

        // Sort facilities by latitude (top to bottom in SVG Y)
        // We want to process them in a stable order
        const sorted = [...facilities].sort((a, b) => b.latitude - a.latitude);

        const placedLabels: { x: number, y: number, width: number, height: number }[] = [];
        const LABEL_HEIGHT = 20;
        const LABEL_WIDTH_EST = 100; // Estimate

        sorted.forEach(facility => {
            const { x, y } = projectPoint(facility.latitude, facility.longitude);

            // Potential positions relative to pin (x, y)
            // 1. Top (default): y - 12
            // 2. Bottom: y + 24
            // 3. Right: x + 12
            // 4. Left: x - 12

            const positions = [
                { x: x, y: y - 12, anchor: "middle", type: 'top' },
                { x: x, y: y + 24, anchor: "middle", type: 'bottom' },
                { x: x + 12, y: y + 4, anchor: "start", type: 'right' },
                { x: x - 12, y: y + 4, anchor: "end", type: 'left' }
            ];

            let bestPos = positions[0];

            // Simple collision check
            for (const pos of positions) {
                let collision = false;
                // Define bounding box for this potential label position
                // This is rough estimation
                let bx = pos.x;
                if (pos.anchor === "middle") bx -= LABEL_WIDTH_EST / 2;
                if (pos.anchor === "end") bx -= LABEL_WIDTH_EST;

                const by = pos.y - LABEL_HEIGHT / 2; // Centered vertically on pos.y roughly

                for (const placed of placedLabels) {
                    // Check intersection
                    if (
                        bx < placed.x + placed.width &&
                        bx + LABEL_WIDTH_EST > placed.x &&
                        by < placed.y + placed.height &&
                        by + LABEL_HEIGHT > placed.y
                    ) {
                        collision = true;
                        break;
                    }
                }

                if (!collision) {
                    bestPos = pos;
                    break;
                }
            }

            // Fallback to first position if all collide, or if bestPos is somehow undefined (though it starts as positions[0])
            if (!bestPos) bestPos = positions[0];

            // Record placement
            let finalBx = bestPos.x;
            if (bestPos.anchor === "middle") finalBx -= LABEL_WIDTH_EST / 2;
            if (bestPos.anchor === "end") finalBx -= LABEL_WIDTH_EST;

            placedLabels.push({
                x: finalBx,
                y: bestPos.y - LABEL_HEIGHT / 2,
                width: LABEL_WIDTH_EST,
                height: LABEL_HEIGHT
            });

            layout[facility.id] = { x: bestPos.x, y: bestPos.y, anchor: bestPos.anchor };
        });

        return layout;
    };

    const labelLayout = getLabelLayout();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-background rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>

                {/* Left: Region Map */}
                <div className="w-full md:w-1/2 bg-muted/10 p-4 md:p-8 flex items-center justify-center relative min-h-[250px] md:min-h-[400px] shrink-0">
                    <h2 className="absolute top-4 left-4 text-xl md:text-2xl font-bold text-primary">{regionName}</h2>
                    <svg className="w-full h-full max-h-[300px] md:max-h-[400px] drop-shadow-lg transition-all duration-1000" viewBox={viewBox}>
                        <path ref={pathRef} d={pathData} className="fill-primary/20 stroke-primary stroke-2" />

                        {/* Render Facility Pins */}
                        {isZoomed && facilities.map((facility, index) => {
                            const { x, y } = projectPoint(facility.latitude, facility.longitude);
                            const isSelected = selectedFacility?.id === facility.id;
                            const layout = labelLayout[facility.id] || { x, y: y - 12, anchor: "middle" };

                            return (
                                <g
                                    key={facility.id}
                                    className="cursor-pointer group"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFacility(facility);
                                    }}
                                >
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={isSelected ? "10" : "6"}
                                        className={`stroke-white stroke-2 transition-all duration-300 group-hover:r-8 ${facility.drug_status === 'out' ? 'fill-red-500' :
                                            facility.drug_status === 'low' ? 'fill-yellow-500' : 'fill-primary'
                                            } ${isSelected ? 'stroke-4 shadow-lg' : ''} animate-in zoom-in fade-in slide-in-from-bottom-4 duration-500`}
                                        style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
                                    />
                                    <text
                                        x={layout.x}
                                        y={layout.y}
                                        textAnchor={layout.anchor as "middle" | "start" | "end"}
                                        className="fill-foreground font-bold select-none pointer-events-none drop-shadow-md text-lg lg:text-2xl bg-background animate-in fade-in duration-700"
                                        style={{ textShadow: '0px 0px 3px rgba(255, 255, 255, 0.8)', animationDelay: `${index * 150 + 200}ms`, animationFillMode: 'both' }}
                                    >
                                        {facility.address}
                                    </text>
                                    <title>{facility.name}</title>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Right: Content Area */}
                <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-card flex-1">
                    <div className="flex items-center justify-between mb-6 sticky top-0 bg-card z-10 pb-2 border-b border-border/50">
                        <h3 className="text-xl font-semibold">
                            {selectedFacility ? "Facility Details" : "Facilities"}
                        </h3>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 hover:bg-accent rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">Loading facilities...</div>
                    ) : selectedFacility ? (
                        // Detailed View
                        <div className="animate-in slide-in-from-right duration-300 pb-4">
                            <button
                                onClick={() => setSelectedFacility(null)}
                                className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6" /></svg>
                                Back to list
                            </button>

                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-primary mb-2">{selectedFacility.name}</h2>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedFacility.drug_status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            selectedFacility.drug_status === 'low' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {selectedFacility.drug_status === 'available' ? 'PrEP Available' : selectedFacility.drug_status === 'low' ? 'Low Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 bg-primary/10 p-2 rounded-full text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                        </div>
                                        <div>
                                            <p className="font-medium">Address</p>
                                            <p className="text-muted-foreground">{selectedFacility.address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 bg-primary/10 p-2 rounded-full text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                        </div>
                                        <div>
                                            <p className="font-medium">Phone</p>
                                            <p className="text-muted-foreground">{selectedFacility.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedFacility.contact_name && (
                                    <div className="bg-muted/30 border border-border rounded-xl p-6 mt-6">
                                        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                            Key Contact Person
                                        </h4>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <p className="font-medium text-lg">{selectedFacility.contact_name}</p>
                                                <p className="text-sm text-muted-foreground">Medical Superintendent</p>
                                            </div>
                                            <a
                                                href={`tel:${selectedFacility.contact_phone}`}
                                                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                Call Now
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : facilities.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">No facilities found in this region.</div>
                    ) : (
                        // List View
                        <div className="space-y-4 animate-in fade-in duration-300 pb-4">
                            {facilities.map(facility => (
                                <div
                                    key={facility.id}
                                    onClick={() => setSelectedFacility(facility)}
                                    className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{facility.name}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${facility.drug_status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            facility.drug_status === 'low' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {facility.drug_status === 'available' ? 'In Stock' : facility.drug_status === 'low' ? 'Low Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">{facility.address}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <p className="text-sm font-medium">{facility.phone}</p>
                                        <span className="text-xs text-primary font-semibold flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Details
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m9 18 6-6-6-6" /></svg>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
