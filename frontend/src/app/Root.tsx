import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { Sparkles, Library, Compass, Menu, X, Leaf, Home as HomeIcon, User, Trophy, Wand2, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "sonner";
import { useTheme } from "next-themes";
import { getAuthToken, logout } from "./lib/api";

export function Root() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAuthToken()));
  const { theme, resolvedTheme, setTheme } = useTheme();
  const location = useLocation();

  const toggleTheme = () => {
    const current = resolvedTheme ?? theme ?? "light";
    setTheme(current === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsAuthenticated(Boolean(getAuthToken()));
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setIsMenuOpen(false);
      toast.success("You have been signed out.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out.");
    }
  };

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
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
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
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden transition-colors duration-500">
      <Toaster position="top-center" expand={true} richColors theme={(resolvedTheme ?? theme ?? "dark") as "light" | "dark"} />

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/85 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-6"}`}
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

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location.pathname === item.path ? "text-primary" : "text-muted-foreground"}`}
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
                {(resolvedTheme ?? theme) === "dark" ? (
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

            {isAuthenticated ? (
              <button
                onClick={() => void handleLogout()}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
              >
                Sign Out
              </button>
            ) : (
              <Link to="/auth" className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold hover:brightness-110 transition-all">
                Sign In
              </Link>
            )}
          </nav>

          <div className="lg:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full text-foreground">
              {(resolvedTheme ?? theme) === "dark" ? <Sun className="w-5 h-5 text-secondary" /> : <Moon className="w-5 h-5 text-primary" />}
            </button>
            <button className="text-foreground p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

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
                  className={`flex items-center gap-4 text-xl font-serif p-4 rounded-2xl transition-all ${location.pathname === item.path ? "bg-secondary text-secondary-foreground" : "text-foreground hover:bg-muted/60"}`}
                >
                  <span className={location.pathname === item.path ? "text-secondary-foreground" : "text-muted-foreground"}>{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              <hr className="border-primary/10" />
              {isAuthenticated ? (
                <button onClick={() => void handleLogout()} className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-center">
                  Sign Out
                </button>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-center">
                  Join the Circle
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow relative z-10 pt-20">
        <Outlet />
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-border/40 px-4 py-3 flex justify-around items-center">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${location.pathname === item.path ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"}`}
          >
            <div className={`p-2 rounded-xl ${location.pathname === item.path ? "bg-primary/15" : ""}`}>{item.icon}</div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.name === "Home" ? "Main" : item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
