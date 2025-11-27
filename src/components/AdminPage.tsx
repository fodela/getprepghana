import React, { useState } from 'react';

export function AdminPage() {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState("");

    const handleSeed = async () => {
        setLoading(true);
        setLogs("Starting seed process...\n");
        try {
            const res = await fetch('/api/admin/seed', { method: 'POST' });
            const data = await res.json();

            setLogs(prev => prev + "----------------------------------------\n");
            setLogs(prev => prev + (data.output || "") + "\n");
            if (data.error) {
                setLogs(prev => prev + "ERRORS:\n" + data.error + "\n");
            }

            if (data.exitCode === 0) {
                setLogs(prev => prev + "\n✅ Database Seed Successful!");
            } else {
                setLogs(prev => prev + "\n❌ Seed Failed with exit code " + data.exitCode);
            }
        } catch (e) {
            setLogs(prev => prev + "\nError triggering seed: " + e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-primary">Admin Dashboard</h1>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Database Management</h2>
                    <p className="text-muted-foreground mb-6">
                        Trigger a manual database seed. This will reset the database with initial data.
                    </p>

                    <button
                        onClick={handleSeed}
                        disabled={loading}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Seeding...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                                Run Seed Script
                            </>
                        )}
                    </button>

                    <div className="mt-8">
                        <h3 className="text-sm font-medium mb-2 text-muted-foreground">Console Output</h3>
                        <div className="bg-black/95 text-green-400 font-mono p-4 rounded-lg h-96 overflow-y-auto whitespace-pre-wrap text-xs shadow-inner border border-border/20">
                            {logs || "> Ready to seed..."}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
