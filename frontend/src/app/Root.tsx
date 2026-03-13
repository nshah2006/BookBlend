import { Outlet, Link, useLocation } from "react-router";
import { Sparkles, Library, Compass, Search, Menu, X, Leaf, Home as HomeIcon, User, Trophy, Wand2, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function Root() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Initial Loading Screen (Splash)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "/", icon: <HomeIcon className="w-5 h-5" /> },
    { name: "Find Vibe", path: "/mood-input", icon: <Wand2 className="w-5 h-5" /> },
    { name: "Explore", path: "/explore", icon: <Compass className="w-5 h-5" /> },
    { name: "Library", path: "/library", icon: <Library className="w-5 h-5" /> },
    { name: "Quests", path: "/challenges", icon: <Trophy className="w-5 h-5" /> },
    { name: "Profile", path: "/profile", icon: <User className="w-5 h-5" /> },
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[200]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <Leaf className="w-24 h-24 text-primary animate-pulse" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sparkles className="w-32 h-32 text-secondary/40" />
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <h1 className="text-4xl font-serif text-primary font-bold">BookBlend</h1>
          <p className="text-foreground/60 mt-2 font-sans tracking-widest uppercase text-xs">Stirring the cauldron of stories...</p>
          <div className="w-48 h-1 bg-primary/10 rounded-full mt-6 mx-auto overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full bg-primary shadow-[0_0_10px_rgba(74,222,128,1)]"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden transition-colors duration-500">
      <Toaster position="top-center" expand={true} richColors theme={(theme ?? "dark") as "light" | "dark"} />

      {/* Decorative Top Bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-tertiary to-secondary w-full fixed top-0 z-[100]" />

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-6"
          }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Leaf className="w-8 h-8 text-primary group-hover:text-secondary transition-colors" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center opacity-40"
              >
                <Sparkles className="w-10 h-10 text-secondary" />
              </motion.div>
            </div>
            <span className="text-2xl font-serif font-bold text-foreground tracking-tight">
              Book<span className="text-primary italic">Blend</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location.pathname === item.path ? "text-primary" : "text-foreground/70"
                  }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-foreground/5 text-foreground transition-all active:scale-95"
              aria-label="Toggle dark mode"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div key="sun" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}>
                    <Sun className="w-5 h-5 text-secondary" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }}>
                    <Moon className="w-5 h-5 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <Link to="/auth" className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold hover:brightness-110 transition-all border border-secondary/20">
              Sign In
            </Link>
          </nav>

          {/* Mobile Menu Toggle & Theme Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-foreground"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-secondary" /> : <Moon className="w-5 h-5 text-primary" />}
            </button>
            <button
              className="text-foreground p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-6 lg:hidden"
          >
            <div className="flex flex-col gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-4 text-xl font-serif p-4 rounded-2xl transition-all ${location.pathname === item.path ? "bg-tertiary text-tertiary-foreground" : "text-primary hover:bg-primary/5"
                    }`}
                >
                  <span className={location.pathname === item.path ? "text-secondary" : "text-tertiary"}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}
              <hr className="border-primary/10" />
              <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-center">
                Join the Circle
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow relative z-10 pt-20">
        <Outlet />
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-primary/10 px-4 py-3 flex justify-around items-center shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${location.pathname === item.path ? "text-tertiary scale-110" : "text-primary/40 hover:text-primary"
              }`}
          >
            <div className={`p-2 rounded-xl ${location.pathname === item.path ? "bg-tertiary/10" : ""}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.name === "Home" ? "Main" : item.name}</span>
          </Link>
        ))}
      </nav>

      <footer className="bg-primary text-primary-foreground py-16 px-6 relative z-10 hidden md:block">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-serif text-secondary italic">BookBlend</h3>
            <p className="text-primary-foreground/70 max-w-xs">
              AI-powered reading companion that matches your heart's current mood with the perfect story.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-tertiary uppercase tracking-widest text-xs">Moods</h4>
            <ul className="space-y-4 text-primary-foreground/80">
              <li><Link to="/mood-input" className="hover:text-secondary">Emotional Depth</Link></li>
              <li><Link to="/mood-input" className="hover:text-secondary">Pacing</Link></li>
              <li><Link to="/mood-input" className="hover:text-secondary">Vibe Check</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-tertiary uppercase tracking-widest text-xs">Social</h4>
            <ul className="space-y-4 text-primary-foreground/80">
              <li><Link to="/profile" className="hover:text-secondary">Community</Link></li>
              <li><Link to="/challenges" className="hover:text-secondary">Reading Quests</Link></li>
              <li><Link to="/profile" className="hover:text-secondary">Leaderboards</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-tertiary uppercase tracking-widest text-xs">Connect</h4>
            <p className="text-sm mb-4">Subscribe for curated monthly vibe-checks.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email..." className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-lg px-4 py-2 flex-grow text-sm focus:outline-none focus:border-tertiary" />
              <button className="bg-tertiary text-tertiary-foreground px-4 py-2 rounded-lg font-bold hover:bg-tertiary/90">Join</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
