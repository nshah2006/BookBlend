import React from "react";
import { motion } from "motion/react";
import { Sparkles, Check, ArrowRight, X, PenTool, CloudRain, Wand2, Compass } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { createRecommendation } from "../lib/api";

export function MoodInput() {
  const navigate = useNavigate();
  const [mood, setMood] = useState<string | null>(null);
  const [depth, setDepth] = useState(50);
  const [pacing, setPacing] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moods = [
    { id: "contemplative", label: "Contemplative", color: "bg-secondary text-secondary-foreground" },
    { id: "energetic", label: "Energetic", color: "bg-surface-container text-foreground" },
    { id: "melancholy", label: "Melancholy", color: "bg-tertiary text-tertiary-foreground" },
    { id: "whimsical", label: "Whimsical", color: "bg-surface-container text-foreground" },
    { id: "tense", label: "Tense", color: "bg-surface-container text-foreground" },
    { id: "nostalgic", label: "Nostalgic", color: "bg-surface-container text-foreground" },
  ];

  const styles = [
    { id: 30, title: "Lyrical & Poetic", desc: "Prose that reads like music, where the language is as vital as the plot.", icon: <Sparkles className="w-5 h-5 text-secondary-foreground" />, bg: "bg-secondary" },
    { id: 80, title: "Direct & Precise", desc: "Economical storytelling with a focus on punchy, impactful observations.", icon: <PenTool className="w-5 h-5 text-primary-foreground" />, bg: "bg-primary text-primary-foreground" },
    { id: 50, title: "Atmospheric", desc: "Immersive world-building where the setting feels like a character itself.", icon: <CloudRain className="w-5 h-5 text-tertiary-foreground" />, bg: "bg-tertiary" },
  ];

  const handleProcess = async () => {
    if (!mood || pacing === null) {
      toast.error("Please select a writing style and mood.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createRecommendation({ mood, pacing, depth });
      navigate("/processing");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create recommendations.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Top Header */}
      <div className="px-6 pt-6 flex justify-between items-center">
        <h2 className="font-serif font-bold text-xl italic text-primary">BookBlend</h2>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/40">Step 02 OF 03</span>
          <button onClick={() => navigate("/")} className="text-primary hover:opacity-70 transition-opacity">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-lg pt-12 space-y-12">
        <div className="space-y-4">
          <h1 className="text-[2.75rem] font-serif text-primary leading-[1.1] tracking-tight">
            Define your<br />
            <span className="italic text-primary/80">literary</span> <b>profile.</b>
          </h1>
          <p className="text-primary/70 text-sm leading-relaxed">
            Discovery isn't just about genre. It's about how a story moves you. Select the textures that resonate with your current reading season.
          </p>
        </div>

        {/* Oracle Block */}
        <div className="bg-surface-container-low rounded-[2rem] p-6 space-y-4 relative group cursor-pointer transition-all hover:bg-surface-container-highest/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground shrink-0 shadow-[0_0_15px_rgba(3,25,46,0.3)]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-primary leading-tight">Consult the Oracle</h3>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40">Natural Language Discovery</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-5 shadow-sm relative pr-16 border border-border/40">
            <p className="font-serif italic text-primary/50 text-base leading-relaxed">
              "Tell the Oracle how you're feeling... 'I want something that feels like rain on a library window, quiet but heavy with secrets.'"
            </p>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-primary/30 text-center pt-2">
            Your words will influence the final curation alongside your selections below.
          </p>
        </div>

        {/* 01 Style */}
        <div className="space-y-6">
          <div className="flex items-baseline gap-4">
            <span className="font-serif text-4xl italic text-primary/20">01</span>
            <h3 className="font-serif text-2xl text-primary">Preferred Writing Style</h3>
          </div>
          <div className="space-y-4">
            {styles.map(s => {
              const isActive = pacing === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setPacing(s.id)}
                  className={`w-full text-left p-6 rounded-3xl transition-all relative overflow-hidden ${isActive ? "bg-primary text-primary-foreground shadow-xl scale-[1.02]" : "bg-surface-container-low hover:bg-surface-container-highest"
                    }`}
                >
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isActive ? "bg-primary-foreground/20" : s.bg}`}>
                      {isActive ? <Check className="w-5 h-5 text-primary-foreground" /> : s.icon}
                    </div>
                    <div>
                      <h4 className={`font-serif text-lg ${isActive ? "text-primary-foreground" : "text-primary"}`}>{s.title}</h4>
                      <p className={`text-sm mt-1 leading-relaxed ${isActive ? "text-primary-foreground/80" : "text-primary/60"}`}>{s.desc}</p>
                    </div>
                  </div>
                  {!isActive && <div className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-primary/20" />}
                  {isActive && <div className="absolute right-6 top-1/2 -translate-y-1/2"><Check className="w-5 h-5 text-primary-foreground" /></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 02 Mood */}
        <div className="space-y-6">
          <div className="flex items-baseline gap-4">
            <span className="font-serif text-4xl italic text-primary/20">02</span>
            <h3 className="font-serif text-2xl text-primary">Current Reading Mood</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {moods.map(m => {
              const isActive = mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${isActive ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background" : `${m.color} hover:brightness-95`
                    }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 03 Complexity */}
        <div className="space-y-6">
          <div className="flex items-baseline gap-4">
            <span className="font-serif text-4xl italic text-primary/20">03</span>
            <h3 className="font-serif text-2xl text-primary">Complexity Level</h3>
          </div>
          <div className="bg-surface-container-low rounded-3xl p-8 space-y-8">
            <p className="text-primary/70 text-sm leading-relaxed">
              How deep do you want the rabbit hole to go? We use this to balance plot density with accessibility.
            </p>
            <div className="relative">
              <input
                type="range"
                min="0" max="100"
                value={depth}
                onChange={(e) => setDepth(parseInt(e.target.value))}
                className="w-full h-2 bg-primary/10 rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-4 text-[8px] font-bold uppercase tracking-[0.2em] text-primary/40">
                <span>Effortless</span>
                <span>Moderate</span>
                <span>Challenging</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent z-50 flex justify-center">
        <div className="w-full max-w-lg flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/50 hover:text-primary transition-colors pl-2">
            Back
          </button>
          <button
            onClick={handleProcess}
            disabled={isSubmitting || !mood || pacing === null}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-medium text-sm hover:bg-primary/95 transition-all shadow-xl disabled:opacity-50 flex items-center gap-3"
          >
            {isSubmitting ? "Synthesizing..." : "Finalize My Vibe"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
