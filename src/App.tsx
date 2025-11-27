import { useState } from "react";
import { InteractiveMap } from "./components/InteractiveMap";
import "../styles/globals.css"
export function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans ">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className=" mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">PrEP Ghana</span>
          </div>
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
        {/* Hero Section */}
        <section className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-12 py-12 md:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Map */}
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
                <button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Find a Center Near You
                </button>
                <button className="w-full sm:w-auto border border-input bg-background hover:bg-accent hover:text-accent-foreground px-8 py-4 rounded-lg text-lg font-medium transition-colors">
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



            {/* Right Column: Content */}

            <div className="flex items-center justify-center">
              <div className=" rounded-full blur-3xl -z-10" />
              <InteractiveMap activeRegion="EASTERN" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className=" mx-auto px-4 py-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} GetPrEPGhana. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
