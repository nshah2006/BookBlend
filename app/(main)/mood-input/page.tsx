"use client";

import { motion } from "motion/react";
import {
  Wand2,
  Sparkles,
  Smile,
  CloudRain,
  Zap,
  Brain,
  Flame,
  Heart,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createRecommendation } from "@/lib/api";

export default function MoodInput() {
  const router = useRouter();
  const [mood, setMood] = useState<string | null>(null);
  const [depth, setDepth] = useState(50);
  const [pacing, setPacing] = useState(50);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moods = [
    {
      id: "energetic",
      icon: <Zap className="w-8 h-8" />,
      label: "Energetic",
      color: "text-yellow-400 bg-yellow-400/10",
    },
    {
      id: "melancholic",
      icon: <CloudRain className="w-8 h-8" />,
      label: "Melancholic",
      color: "text-blue-400 bg-blue-400/10",
    },
    {
      id: "curious",
      icon: <Brain className="w-8 h-8" />,
      label: "Curious",
      color: "text-purple-400 bg-purple-400/10",
    },
    {
      id: "romantic",
      icon: <Heart className="w-8 h-8" />,
      label: "Romantic",
      color: "text-pink-400 bg-pink-400/10",
    },
    {
      id: "intense",
      icon: <Flame className="w-8 h-8" />,
      label: "Intense",
      color: "text-red-400 bg-red-400/10",
    },
    {
      id: "peaceful",
      icon: <Smile className="w-8 h-8" />,
      label: "Peaceful",
      color: "text-emerald-400 bg-emerald-400/10",
    },
  ];

  const handleProcess = async () => {
    if (!mood) {
      toast.error("Choose a mood before asking for recommendations.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createRecommendation({ mood, pacing, depth });
      router.push("/processing");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create recommendations."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl min-h-[80vh] flex flex-col justify-center">
      <div className="text-center mb-16 space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest border border-primary/20"
        >
          <Wand2 className="w-4 h-4" />
          Vibe Check Initialized
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-serif text-foreground">
          How are you <span className="text-primary italic">feeling</span> today?
        </h1>
        <p className="text-foreground/60 text-lg">
          BookBlend&apos;s AI will find the perfect companion for your current headspace.
        </p>
      </div>

      <div className="bg-card rounded-[3rem] p-8 md:p-12 shadow-2xl border-2 border-primary/5 space-y-16 relative overflow-hidden">
        {/* Step Indicator */}
        <div className="flex justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                step >= s ? "bg-primary scale-125 w-10" : "bg-foreground/10"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <h3 className="text-2xl font-serif text-center text-foreground">
              Pick your current emotional state:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {moods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMood(m.id);
                    setStep(2);
                  }}
                  className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group hover:shadow-xl hover:-translate-y-2 ${
                    mood === m.id
                      ? "border-primary bg-primary/5"
                      : "border-white/5 bg-background/50"
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl transition-all ${
                      mood === m.id
                        ? "bg-primary text-primary-foreground"
                        : `${m.color} group-hover:scale-110`
                    }`}
                  >
                    {m.icon}
                  </div>
                  <span className="font-bold text-foreground">{m.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-16"
          >
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <h4 className="text-xl font-serif text-foreground">Pacing Intensity</h4>
                  <span className="text-primary font-bold">
                    {pacing < 40
                      ? "Slow & Thoughtful"
                      : pacing > 70
                      ? "Fast & Frenetic"
                      : "Steady & Balanced"}
                  </span>
                </div>
                <div className="relative h-12 flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={pacing}
                    onChange={(e) => setPacing(parseInt(e.target.value))}
                    className="w-full h-3 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <div className="absolute -bottom-6 left-0 text-[10px] uppercase font-bold text-foreground/30 tracking-widest flex justify-between w-full">
                    <span>Zen</span>
                    <span>Rush</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <h4 className="text-xl font-serif text-foreground">Emotional Depth</h4>
                  <span className="text-secondary font-bold">
                    {depth < 40
                      ? "Light & Playful"
                      : depth > 70
                      ? "Devastatingly Deep"
                      : "Emotionally Resonant"}
                  </span>
                </div>
                <div className="relative h-12 flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={depth}
                    onChange={(e) => setDepth(parseInt(e.target.value))}
                    className="w-full h-3 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-secondary"
                  />
                  <div className="absolute -bottom-6 left-0 text-[10px] uppercase font-bold text-foreground/30 tracking-widest flex justify-between w-full">
                    <span>Beach Read</span>
                    <span>Soul-searching</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-grow p-6 rounded-2xl font-bold text-foreground border-2 border-white/10 hover:bg-white/5 transition-all"
              >
                Back to Moods
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-grow p-6 bg-primary text-primary-foreground rounded-2xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                Next Step <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12 text-center"
          >
            <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto border-2 border-secondary/20 mb-8">
              <Sparkles className="w-12 h-12 text-secondary" />
            </div>
            <h3 className="text-3xl font-serif text-foreground">Final Vibe Synthesis</h3>
            <p className="text-foreground/60 max-w-md mx-auto">
              Our AI is ready to scour the multiverse for books that match your{" "}
              <span className="text-primary font-bold uppercase">{mood}</span> mood, with{" "}
              <span className="text-secondary font-bold">{pacing}%</span> intensity and{" "}
              <span className="text-primary font-bold">{depth}%</span> emotional depth.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
              <button
                onClick={() => setStep(2)}
                className="p-6 rounded-2xl font-bold text-foreground border-2 border-white/10 hover:bg-white/5 transition-all"
              >
                Fine Tune
              </button>
              <button
                onClick={handleProcess}
                disabled={isSubmitting}
                className="p-6 bg-primary text-primary-foreground rounded-2xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-2xl border-2 border-secondary/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Summoning Matches..." : "Blend My Books"}{" "}
                <Wand2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20 -z-10">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-[150px]" />
      </div>
    </div>
  );
}
