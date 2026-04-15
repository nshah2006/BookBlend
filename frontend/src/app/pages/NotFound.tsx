import { motion } from "motion/react";
import { Compass, Home, Search, Ghost, Sparkles } from "lucide-react";
import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="container mx-auto px-6 py-24 min-h-[70vh] flex flex-col items-center justify-center text-center space-y-12">
      <div className="relative group">
        <div className="absolute -inset-12 bg-tertiary/20 rounded-full blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-48 h-48 bg-card/70 backdrop-blur-xl border-2 border-border/40 rounded-[3rem] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
          <Ghost className="w-24 h-24 text-primary opacity-20" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Sparkles className="w-32 h-32 text-secondary/40" />
          </motion.div>
        </div>
      </div>

      <div className="space-y-6 max-w-lg">
        <h1 className="text-6xl font-serif text-primary italic leading-tight">Lost in the <br /><span className="text-tertiary">Mists</span></h1>
        <p className="text-primary/60 text-xl font-light leading-relaxed">
          The story you're seeking has vanished into the deep forest. Perhaps it was never written, or it's hiding behind a different tree.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
        <Link 
          to="/"
          className="w-full sm:w-auto bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-xl border-2 border-secondary/20"
        >
          <Home className="w-5 h-5 text-secondary" />
          Back to Sanctuary
        </Link>
        <Link 
          to="/explore"
          className="w-full sm:w-auto bg-card border-2 border-border/40 text-primary px-10 py-5 rounded-2xl font-bold text-lg hover:border-tertiary hover:text-tertiary transition-all flex items-center justify-center gap-3 shadow-sm"
        >
          <Search className="w-5 h-5 text-tertiary" />
          Find New Tales
        </Link>
      </div>
    </div>
  );
}
