import { motion, AnimatePresence } from "motion/react";
import { Trophy, Star, Zap, Heart, Flame, Sparkles, User, Settings, ArrowRight, Share2, BookOpen, Library, CheckCircle2, History, Bookmark } from "lucide-react";
import { useState } from "react";

export function Profile() {
  const [activeTab, setActiveTab] = useState("stats");
  const stats = [
    { label: "Books Read", value: "42", icon: <BookOpen className="w-5 h-5 text-primary" /> },
    { label: "Vibe Score", value: "88%", icon: <Zap className="w-5 h-5 text-secondary" /> },
    { label: "Day Streak", value: "14", icon: <Flame className="w-5 h-5 text-orange-400" /> },
    { label: "Quests", value: "9", icon: <Trophy className="w-5 h-5 text-emerald-400" /> },
  ];

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="bg-card rounded-[3rem] p-8 md:p-12 shadow-2xl border-2 border-primary/5 relative overflow-hidden">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 md:items-center justify-between mb-16">
          <div className="flex items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-primary/10 rounded-[2.5rem] p-2 border-2 border-secondary/20 group-hover:border-primary transition-all">
                <img
                  src="https://images.unsplash.com/photo-1727822288450-ba4a7f09270f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"
                  alt="Profile"
                  className="w-full h-full object-cover rounded-[2rem] shadow-2xl group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-secondary text-secondary-foreground p-3 rounded-2xl border-2 border-background shadow-xl">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-serif text-foreground italic leading-tight">Elena the Seeker</h1>
              <p className="text-foreground/60 font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Reading "The Night Circus"
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">Master Voyager</span>
                <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-bold uppercase tracking-widest border border-secondary/20">Aesthetic Reader</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl border-2 border-white/5 transition-all text-foreground">
              <Settings className="w-6 h-6" />
            </button>
            <button className="flex-grow md:flex-grow-0 bg-primary text-primary-foreground px-8 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl border-2 border-secondary/20 active:scale-95 transition-all">
              <Share2 className="w-5 h-5" />
              Share Vibe
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-background rounded-3xl border border-white/5 space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="p-3 bg-card rounded-xl w-fit shadow-md">
                {s.icon}
              </div>
              <div className="space-y-1">
                <span className="block text-3xl font-serif font-bold text-foreground">{s.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{s.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Profile Navigation */}
        <div className="flex border-b border-white/5 mb-12 overflow-x-auto whitespace-nowrap custom-scrollbar">
          {[
            { id: "stats", name: "Detailed Stats", icon: <Star className="w-4 h-4" /> },
            { id: "history", name: "Reading Lore", icon: <History className="w-4 h-4" /> },
            { id: "friends", name: "Social Circles", icon: <User className="w-4 h-4" /> },
            { id: "saved", name: "Saved Vibes", icon: <Bookmark className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? "text-primary" : "text-foreground/40 hover:text-foreground"
                }`}
            >
              {tab.icon}
              {tab.name}
              {activeTab === tab.id && (
                <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <h3 className="text-2xl font-serif text-foreground italic">Preferred Emotional Depth</h3>
                  <div className="space-y-6">
                    {[
                      { label: "Deep & Philosophical", value: 85, color: "bg-primary" },
                      { label: "Fast & Dynamic", value: 65, color: "bg-secondary" },
                      { label: "Light & Whimsical", value: 30, color: "bg-emerald-400" },
                    ].map((v, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-foreground/40">
                          <span>{v.label}</span>
                          <span>{v.value}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${v.value}%` }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className={`h-full ${v.color} rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-8">
                  <h3 className="text-2xl font-serif text-foreground italic">Top Genres by Vibe</h3>
                  <div className="flex flex-wrap gap-4">
                    {["Dark Academia", "Magical Realism", "High Fantasy", "Historical Mystery", "Cyberpunk", "Cozy Cottagecore"].map(g => (
                      <div key={g} className="px-6 py-4 bg-background rounded-2xl border border-white/5 flex items-center gap-4 group hover:border-primary/30 transition-all cursor-pointer">
                        <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                          <Library className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-foreground/80">{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-10 bg-white/5 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-12">
                <div className="relative group flex-shrink-0">
                  <div className="w-32 h-32 bg-card rounded-3xl shadow-xl flex items-center justify-center p-4">
                    <img
                      src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400"
                      alt="Recommended"
                      className="w-full h-full object-cover rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-secondary p-2 rounded-xl text-secondary-foreground shadow-xl">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-4 text-center md:text-left">
                  <h4 className="text-2xl font-serif text-foreground">Next Vibe Prediction</h4>
                  <p className="text-foreground/60 max-w-lg leading-relaxed">
                    Based on your recent 14-day reading streak of high-pacing thrillers, our AI recommends a "Low-Intensity Reset" with "The Starless Sea" to balance your emotional depth profile.
                  </p>
                  <button className="text-primary font-bold flex items-center gap-2 group mx-auto md:mx-0 hover:text-secondary transition-colors">
                    See All Insights <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
