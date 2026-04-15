import { motion } from "motion/react";
import { Brain, Wand2, Zap, Heart, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getLatestRecommendation } from "../lib/api";

export function AIProcessing() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState("Sifting through the library's shadows...");
  const topRecommendation = getLatestRecommendation()?.recommendations[0];

  const actions = [
    "Sifting through the library's shadows...",
    "Consulting the collective subconscious...",
    "Decoding emotional resonance...",
    "Filtering for the perfect pacing...",
    "Aligning with your current vibration...",
    "Ink and magic in progress...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => navigate("/explore"), 1000);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    const actionTimer = setInterval(() => {
      setCurrentAction(actions[Math.floor(Math.random() * actions.length)]);
    }, 1500);

    return () => {
      clearInterval(timer);
      clearInterval(actionTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden bg-[#03192e] p-6 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-10"
        >
          <div className="absolute top-1/2 left-1/2 w-full h-full bg-gradient-to-r from-secondary/50 via-tertiary/50 to-primary/50 blur-[200px]" />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-lg w-full space-y-12">
        <div className="relative inline-block">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="flex h-48 w-48 items-center justify-center rounded-full border-4 border-dashed border-secondary/30 p-8"
          >
            <Wand2 className="w-24 h-24 text-secondary animate-pulse shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 bg-tertiary p-4 rounded-2xl shadow-2xl border-2 border-secondary/20"
          >
            <Brain className="w-8 h-8 text-tertiary-foreground" />
          </motion.div>
        </div>

        <div className="space-y-6">
          <h2 className="text-5xl font-serif text-primary-foreground italic tracking-wide">
            Synthesizing Your <span className="text-secondary">Vibe</span>
          </h2>
          <p className="text-primary-foreground/60 text-lg font-light max-w-xs mx-auto">
            {currentAction}
          </p>
          {topRecommendation && (
            <p className="text-primary-foreground/80 text-sm uppercase tracking-[0.2em]">
              Preparing {topRecommendation.book.title} and nearby matches
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="relative h-4 w-full bg-primary-foreground/10 rounded-full overflow-hidden border border-primary-foreground/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-secondary via-tertiary to-secondary rounded-full shadow-[0_0_15px_rgba(212,175,55,0.6)]"
            />
          </div>
          <div className="flex justify-between items-center text-primary-foreground/40 text-xs font-bold uppercase tracking-[0.2em]">
            <span>Calibrating Magic</span>
            <span className="text-secondary">{progress}% Complete</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-12">
          {[
            { icon: <Zap className="w-5 h-5" />, label: "Energy" },
            { icon: <Heart className="w-5 h-5" />, label: "Soul" },
            { icon: <CheckCircle2 className="w-5 h-5" />, label: "Match" },
          ].map((v, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: progress > (i + 1) * 30 ? 1 : 0.2, y: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <div className={`p-4 rounded-2xl border ${progress > (i + 1) * 30 ? "bg-white text-primary border-secondary shadow-lg" : "bg-primary-foreground/5 text-primary-foreground/20 border-primary-foreground/5"}`}>
                {v.icon}
              </div>
              <span className="text-[10px] font-bold text-primary-foreground/40 uppercase">{v.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-secondary rounded-full"
          animate={{
            y: [0, -300, 0],
            x: [0, Math.random() * 200 - 100, 0],
            opacity: [0, 1, 0],
            scale: [0, Math.random() * 3 + 1, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
