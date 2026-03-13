import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Brain, Wand2, ArrowRight, ArrowLeft, Trophy } from "lucide-react";
import { useNavigate } from "react-router";

export function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      title: "Welcome to BookBlend",
      description: "Tired of picking books by genre? We focus on the 'Vibe' — matching stories to your current headspace.",
      icon: <Wand2 className="w-24 h-24 text-secondary" />,
      color: "bg-primary",
      accent: "border-secondary"
    },
    {
      title: "Mood AI Synthesis",
      description: "Tell us how you're feeling, your desired pacing, and emotional depth. Our AI does the rest.",
      icon: <Brain className="w-24 h-24 text-tertiary" />,
      color: "bg-tertiary/10 text-primary",
      accent: "border-tertiary"
    },
    {
      title: "Gamified Growth",
      description: "Earn mystical badges, join reading circles, and complete quests to level up your reading journey.",
      icon: <Trophy className="w-24 h-24 text-primary" />,
      color: "bg-secondary text-primary",
      accent: "border-primary"
    }
  ];

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else navigate("/auth");
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className={`min-h-[80vh] flex flex-col items-center justify-center p-6 transition-all duration-700 ${steps[step].color} rounded-[3rem] overflow-hidden relative shadow-2xl m-6`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="max-w-xl text-center space-y-12"
        >
          <div className="relative inline-block p-12 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              {steps[step].icon}
            </motion.div>
          </div>

          <div className="space-y-6">
            <h2 className={`text-5xl font-serif font-bold ${step === 1 ? "text-primary" : "text-white"}`}>
              {steps[step].title}
            </h2>
            <p className={`text-xl font-light leading-relaxed ${step === 1 ? "text-primary/60" : "text-white/80"}`}>
              {steps[step].description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            {step > 0 && (
              <button 
                onClick={back}
                className={`px-10 py-5 rounded-2xl font-bold flex items-center gap-2 border-2 ${step === 1 ? "border-primary/10 text-primary" : "border-white/20 text-white"} hover:bg-white/10 transition-all`}
              >
                <ArrowLeft className="w-5 h-5" />
                Return
              </button>
            )}
            <button 
              onClick={next}
              className={`px-12 py-5 rounded-2xl font-bold flex items-center gap-2 border-2 ${step === 1 ? "bg-primary text-white border-primary" : "bg-white text-primary border-white"} hover:scale-105 transition-all shadow-2xl`}
            >
              {step < steps.length - 1 ? "Continue" : "Get Started"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-12 flex gap-3">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={`w-3 h-3 rounded-full transition-all duration-500 ${step === i ? "bg-secondary scale-150 w-10 shadow-[0_0_10px_rgba(212,175,55,1)]" : "bg-white/20"}`} 
          />
        ))}
      </div>
    </div>
  );
}
