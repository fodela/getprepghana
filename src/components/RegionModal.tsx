import React, { useEffect, useState } from 'react';

interface Facility {
    id: number;
    name: string;
    address: string;
    phone: string;
    contact_name: string;
    contact_phone: string;
    drug_status: 'available' | 'low' | 'out';
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

    useEffect(() => {
        if (isOpen && regionId) {
            setLoading(true);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-background rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>

                {/* Left: Region Map */}
                <div className="w-full md:w-1/2 bg-muted/10 p-8 flex items-center justify-center relative min-h-[300px]">
                    <h2 className="absolute top-4 left-4 text-2xl font-bold text-primary">{regionName}</h2>
                    <svg className="w-full h-full max-h-[400px] drop-shadow-lg" viewBox="0 0 625 910">
                        {/* We use the same viewBox as the main map to keep coordinate system consistent, 
                             but we might want to auto-zoom in the future. For now, this ensures correct scaling. 
                             Actually, using the full viewBox might make the region look small if it's tiny.
                             A better approach for a "zoomed in" view requires calculating the bounding box of the path.
                             For this iteration, we'll stick to the simple render to ensure it works first.
                         */}
                        <path d={pathData} className="fill-primary stroke-white stroke-2" />
                    </svg>
                </div>

                {/* Right: Facilities List */}
                <div className="w-full md:w-1/2 p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold">Facilities</h3>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">Loading facilities...</div>
                    ) : facilities.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">No facilities found in this region.</div>
                    ) : (
                        <div className="space-y-4">
                            {facilities.map(facility => (
                                <div key={facility.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg">{facility.name}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${facility.drug_status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                facility.drug_status === 'low' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {facility.drug_status === 'available' ? 'In Stock' : facility.drug_status === 'low' ? 'Low Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">{facility.address}</p>
                                    <p className="text-sm font-medium mb-3">{facility.phone}</p>

                                    {facility.contact_name && (
                                        <div className="bg-muted/50 rounded p-3 text-sm">
                                            <p className="font-semibold text-primary mb-1">Key Contact</p>
                                            <p>{facility.contact_name}</p>
                                            <a href={`tel:${facility.contact_phone}`} className="inline-flex items-center gap-2 text-primary hover:underline mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                Call {facility.contact_phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
