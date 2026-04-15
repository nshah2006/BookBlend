"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Star,
  Zap,
  Flame,
  Sparkles,
  User,
  Settings,
  Share2,
  BookOpen,
  Library,
  CheckCircle2,
  History,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getProfile } from "@/lib/api";
import type { ProfileResponse } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("stats");
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await getProfile();
        setProfile(response);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to load your profile."
        );
      }
    };

    void load();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-5xl pb-24 lg:pb-12">
        <div className="bg-card rounded-[3rem] p-10 shadow-2xl border-2 border-primary/5 text-center space-y-6">
          <Sparkles className="w-16 h-16 text-secondary mx-auto" />
          <h1 className="text-4xl font-serif text-foreground">
            Sign in to view your profile
          </h1>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Profile stats, reading history, saved vibes, and recommendation insights are
            all backed by the new API.
          </p>
          <Link
            href="/auth"
            className="inline-flex bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold"
          >
            Enter the Sanctuary
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !profile) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-5xl pb-24 lg:pb-12">
        <div className="bg-card rounded-[3rem] p-10 shadow-2xl border-2 border-primary/5 text-center text-foreground/60">
          Loading your profile...
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Books Read",
      value: String(profile.stats.booksRead),
      icon: <BookOpen className="w-5 h-5 text-foreground" />,
    },
    {
      label: "Vibe Score",
      value: `${profile.stats.vibeScore}%`,
      icon: <Zap className="w-5 h-5 text-secondary" />,
    },
    {
      label: "Day Streak",
      value: String(profile.stats.dayStreak),
      icon: <Flame className="w-5 h-5 text-orange-400" />,
    },
    {
      label: "Quests",
      value: String(profile.stats.quests),
      icon: <Trophy className="w-5 h-5 text-emerald-400" />,
    },
  ];

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl pb-24 lg:pb-12">
      <div className="bg-card rounded-[3rem] p-8 md:p-12 shadow-2xl border-2 border-primary/5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 md:items-center justify-between mb-16">
          <div className="flex items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-primary/10 rounded-[2.5rem] p-2 border-2 border-secondary/20 group-hover:border-primary transition-all">
                <img
                  src={profile.user.avatarUrl}
                  alt={profile.user.displayName}
                  className="w-full h-full object-cover rounded-[2rem] shadow-2xl group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-secondary text-secondary-foreground p-3 rounded-2xl border-2 border-background shadow-xl">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-serif text-foreground italic leading-tight">
                {profile.user.displayName}
              </h1>
              <p className="text-foreground/60 font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {profile.currentRead
                  ? `Reading "${profile.currentRead.title}"`
                  : "No active read right now"}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.badges.map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() =>
                toast.info(
                  "Settings controls can be added on top of the current profile API."
                )
              }
              className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl border-2 border-white/5 transition-all text-foreground"
            >
              <Settings className="w-6 h-6" />
            </button>
            <button
              onClick={() => toast.success("Shareable profile links can be layered on later.")}
              className="flex-grow md:flex-grow-0 bg-primary text-primary-foreground px-8 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl border-2 border-secondary/20 active:scale-95 transition-all"
            >
              <Share2 className="w-5 h-5" />
              Share Vibe
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="p-6 bg-background rounded-3xl border border-white/5 space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="p-3 bg-card rounded-xl w-fit shadow-md">{stat.icon}</div>
              <div className="space-y-1">
                <span className="block text-3xl font-serif font-bold text-foreground">
                  {stat.value}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                  {stat.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex border-b border-white/5 mb-12 overflow-x-auto whitespace-nowrap">
          {[
            { id: "stats", name: "Detailed Stats", icon: <Star className="w-4 h-4" /> },
            { id: "history", name: "Reading Lore", icon: <History className="w-4 h-4" /> },
            { id: "friends", name: "Social Circles", icon: <User className="w-4 h-4" /> },
            { id: "saved", name: "Saved Vibes", icon: <Bookmark className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-4 text-sm font-bold transition-all relative ${
                activeTab === tab.id ? "text-primary" : "text-foreground/40 hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.name}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

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
                  <h3 className="text-2xl font-serif text-foreground italic">
                    Preferred Emotional Depth
                  </h3>
                  <div className="space-y-6">
                    {profile.insights.emotionalDepth.map((entry) => (
                      <div key={entry.label} className="space-y-3">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-foreground/40">
                          <span>{entry.label}</span>
                          <span>{entry.value}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${entry.value}%` }}
                            transition={{ duration: 1.1 }}
                            className={`h-full ${entry.color} rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-8">
                  <h3 className="text-2xl font-serif text-foreground italic">
                    Top Genres by Vibe
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {profile.insights.topGenres.map((genre) => (
                      <div
                        key={genre}
                        className="px-6 py-4 bg-background rounded-2xl border border-white/5 flex items-center gap-4 group hover:border-primary/30 transition-all cursor-pointer"
                      >
                        <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                          <Library className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-foreground/80">{genre}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-10 bg-white/5 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-12">
                <div className="relative group flex-shrink-0">
                  <div className="w-32 h-32 bg-card rounded-3xl shadow-xl flex items-center justify-center p-4">
                    <img
                      src={
                        profile.insights.nextRecommendation?.book.coverImage ??
                        profile.currentRead?.coverImage ??
                        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400"
                      }
                      alt="Recommended"
                      className="w-full h-full object-cover rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-secondary p-2 rounded-xl text-secondary-foreground shadow-xl">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-4 text-center md:text-left">
                  <h4 className="text-2xl font-serif text-foreground">
                    Next Vibe Prediction
                  </h4>
                  <p className="text-foreground/60 max-w-lg leading-relaxed">
                    {profile.insights.nextRecommendation
                      ? `${profile.insights.nextRecommendation.book.title} is your strongest current match. ${profile.insights.nextRecommendation.reason}`
                      : "Complete a vibe check to generate a fresh personalized recommendation."}
                  </p>
                  <Link
                    href="/mood-input"
                    className="text-primary font-bold flex items-center gap-2 group mx-auto md:mx-0 hover:text-secondary transition-colors"
                  >
                    Refresh Insights{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {profile.history.map((entry) => (
                <div
                  key={`${entry.title}-${entry.savedAt}`}
                  className="rounded-2xl border border-primary/10 bg-background px-6 py-5 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-serif text-xl text-foreground">{entry.title}</p>
                    <p className="text-sm text-foreground/50">by {entry.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-foreground/40">
                      {entry.status}
                    </p>
                    <p className="font-bold text-primary">{entry.progressPercent}%</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "saved" && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {profile.savedBooks.map((book) => (
                <div
                  key={book.id}
                  className="rounded-[2rem] border border-primary/10 bg-background p-6 flex gap-4 items-center"
                >
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-20 h-28 rounded-2xl object-cover shadow-lg"
                  />
                  <div className="space-y-2">
                    <p className="font-serif text-2xl text-foreground">{book.title}</p>
                    <p className="text-sm text-foreground/50">by {book.author}</p>
                    <div className="flex flex-wrap gap-2">
                      {book.genre.slice(0, 2).map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 text-[10px] uppercase tracking-widest rounded-full bg-primary/10 text-primary font-bold"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "friends" && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-[2rem] border border-primary/10 bg-background p-8 text-foreground/60"
            >
              Social circles are referenced by the product, but concrete backend circle
              membership and feeds can be layered on after the current auth, library, and
              challenge stack.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
