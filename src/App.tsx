import { useState } from "react";
import { InteractiveMap } from "./components/InteractiveMap";
import { RegionModal } from "./components/RegionModal";
import "../styles/globals.css"
import vLogo from "./public/images/v_logo.png"
export function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<{ id: string, name: string, path: string } | null>(null);

  const handleRegionClick = (regionId: string, regionName: string, pathData: string) => {
    setSelectedRegion({ id: regionId, name: regionName, path: pathData });
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans ">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className=" mx-auto px-4 h-16 flex items-center justify-between"><div className="p-"> <img src={vLogo} alt="Logo" width={150} /></div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <button onClick={() => setActiveTab("home")} className={`hover:text-primary transition-colors ${activeTab === 'home' ? 'text-primary' : ''}`}>Home</button>
            <button onClick={() => setActiveTab("about")} className={`hover:text-primary transition-colors ${activeTab === 'about' ? 'text-primary' : ''}`}>About</button>
            <button onClick={() => setActiveTab("centers")} className={`hover:text-primary transition-colors ${activeTab === 'centers' ? 'text-primary' : ''}`}>Centers</button>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="">
        {activeTab === 'home' && (
          <section className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-12 py-12 md:py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column: Content */}
              <div className="space-y-8 text-center lg:text-left ">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-primary">
                    Stay HIV <span className="text-secondary">Negative.</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                    PrEP prevents HIV.
                  </p>
                  <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
                    Take control of your health with Pre-Exposure Prophylaxis.
                    Safe, effective, and available across Ghana.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <button onClick={() => setActiveTab('centers')} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Find a Center Near You
                  </button>
                  <button onClick={() => setActiveTab('about')} className="w-full sm:w-auto border border-input bg-background hover:bg-accent hover:text-accent-foreground px-8 py-4 rounded-lg text-lg font-medium transition-colors">
                    Learn More
                  </button>
                </div>

                <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-muted-foreground">
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="text-3xl font-bold text-primary">99%</span>
                    <span className="text-sm">Effective</span>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="text-3xl font-bold text-primary">16+</span>
                    <span className="text-sm">Regions Covered</span>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="text-3xl font-bold text-primary">24/7</span>
                    <span className="text-sm">Support</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Map */}
              <div className="flex items-center justify-center">
                <div className=" rounded-full blur-3xl -z-10" />
                <InteractiveMap
                  activeRegion="GREATER_ACCRA"
                  onRegionClick={handleRegionClick}
                />
              </div>
            </div>
          </section>
        )}

        {activeTab === 'about' && (
          <section className="max-w-4xl mx-auto px-4 py-12 md:py-24 space-y-12 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold text-primary">About PrEP</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Pre-Exposure Prophylaxis (PrEP) is a medicine people at risk for HIV take to prevent getting HIV from sex or injection drug use.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="bg-primary/10 p-2 rounded-lg text-primary">🛡️</span>
                  How it Works
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  When taken as prescribed, PrEP is highly effective for preventing HIV. It works by stopping the virus from establishing a permanent infection in your body.
                </p>
              </div>
              <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="bg-primary/10 p-2 rounded-lg text-primary">👥</span>
                  Who is it for?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  PrEP is for anyone who is HIV negative and wants added protection against HIV. Consult with a healthcare provider to see if it's right for you.
                </p>
              </div>
            </div>

            <div className="bg-muted/30 p-8 rounded-2xl text-center space-y-6">
              <h3 className="text-2xl font-bold">Ready to get started?</h3>
              <p className="text-muted-foreground">Find a certified PrEP center in your region today.</p>
              <button onClick={() => setActiveTab('centers')} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-semibold transition-colors">
                Find a Center
              </button>
            </div>
          </section>
        )}

        {activeTab === 'centers' && (
          <section className="max-w-screen-2xl mx-auto px-4 py-12 animate-in fade-in duration-500">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4">Find a Center</h2>
              <p className="text-xl text-muted-foreground">Select your region on the map to view available facilities.</p>
            </div>

            <div className="flex justify-center">
              <InteractiveMap
                activeRegion={selectedRegion?.id}
                onRegionClick={handleRegionClick}
              />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className=" mx-auto px-4 py-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} GetPrEPGhana. All rights reserved.</p>
        </div>
      </footer>

      <RegionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        regionId={selectedRegion?.id || ""}
        regionName={selectedRegion?.name || ""}
        pathData={selectedRegion?.path || ""}
      />
    </div>
  );
}

export default App;
