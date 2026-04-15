import { motion } from "motion/react";
import { Sparkles, Zap, Flame, Trophy, LogOut, CheckCircle2, Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { getAuthToken, getProfile, logout } from "../lib/api";
import type { ProfileResponse } from "../types/api";

export function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!getAuthToken()) {
        toast.error("Please sign in to view your profile.");
        navigate("/auth");
        return;
      }

      try {
        const response = await getProfile();
        setProfile(response);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load your profile.");
      }
    };

    void load();
  }, [navigate]);

  if (!profile) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center">
        <Sparkles className="w-8 h-8 text-primary/40 animate-pulse" />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-primary/40">Opening your archives...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully.");
      navigate("/");
    } catch {
      toast.error("Unable to sign out.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-sans">
      {/* Decorative Blur */}
      <div className="fixed inset-0 pointer-events-none opacity-20 -z-10">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-secondary/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl pt-12 space-y-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-serif text-primary leading-[1.1] tracking-tight">
              The year of <br />
              <span className="italic text-primary/80">living literarily.</span>
            </h1>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/10 shadow-lg">
                <img src={profile.user.avatarUrl} alt={profile.user.displayName} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-lg text-primary">{profile.user.displayName}</p>
                <p className="text-primary/50 text-[10px] uppercase tracking-[0.2em] font-bold">Curator of Stories</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-container border border-border/20 text-xs font-bold uppercase tracking-widest hover:bg-surface-container-high transition-colors text-primary/60"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 bg-primary text-white p-10 md:p-14 rounded-[2.5rem] shadow-ambient relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
            <div className="space-y-4 relative z-10">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">Pages Devoured</p>
              <h2 className="text-7xl md:text-9xl font-serif leading-none tracking-tighter">
                {profile.stats.pagesRead.toLocaleString()}
              </h2>
              <p className="text-xl font-light text-white/80 max-w-sm pt-4">
                You're reading {Math.round(profile.stats.pagesRead / profile.stats.timeSpentHours)} pages an hour. A truly voracious pace.
              </p>
            </div>
          </motion.div>

          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-surface-container-low p-8 rounded-[2.5rem] flex-grow flex flex-col justify-center relative overflow-hidden shadow-sm border border-border/20 hover:border-border/40 transition-colors"
            >
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                <Zap className="w-48 h-48 text-primary" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">Vibe Match Score</p>
                <p className="text-5xl font-serif text-primary">{profile.stats.vibeScore}%</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-surface-container-low p-8 rounded-[2.5rem] flex-grow flex flex-col justify-center relative overflow-hidden shadow-sm border border-border/20 hover:border-border/40 transition-colors"
            >
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                <Flame className="w-48 h-48 text-primary" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">Current Streak</p>
                <p className="text-5xl font-serif text-primary">{profile.stats.dayStreak} Days</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Saved Vibes / Reading History */}
        <section className="space-y-8 pt-8">
          <div className="flex items-baseline gap-4 border-b border-border/40 pb-4">
            <h3 className="font-serif text-3xl text-primary">Vibe History</h3>
            <span className="text-xs uppercase tracking-widest font-bold text-primary/40 text-left">Your completed and active journeys</span>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide px-2">
            {profile.history.map((entry, i) => (
              <motion.div
                key={`${entry.title}-${i}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="min-w-[280px] w-[280px] shrink-0 bg-surface-container-lowest p-6 rounded-[2rem] shadow-ambient border border-border/10 space-y-6"
              >
                <div className="w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center text-primary/40 border border-border/20">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-2xl text-primary leading-tight mb-2">{entry.title}</h4>
                  <p className="text-primary/60 text-sm">by {entry.author}</p>
                </div>
                <div className="pt-4 border-t border-border/30 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">{entry.status}</span>
                  <span className="text-primary font-bold text-sm bg-primary/5 px-3 py-1 rounded-full">{entry.progressPercent}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Current Read Spotlight */}
        {profile.currentRead && (
          <section className="bg-surface-container-low rounded-[3rem] p-10 md:p-16 border border-border/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <Zap className="w-3 h-3" /> Still Exploring
                </div>
                <div>
                  <h3 className="text-4xl md:text-5xl font-serif leading-tight text-primary mb-4">
                    {profile.currentRead.title}
                  </h3>
                  <p className="text-primary/60 text-lg">by {profile.currentRead.author}</p>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex justify-between text-[10px] font-bold text-primary/50 uppercase tracking-widest">
                    <span>Progress</span>
                    <span>{profile.history.find((e) => e.title === profile.currentRead?.title)?.progressPercent ?? 0}%</span>
                  </div>
                  <div className="h-3 w-full bg-primary/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${profile.history.find((e) => e.title === profile.currentRead?.title)?.progressPercent ?? 0}%`,
                      }}
                      className="h-full bg-primary shadow-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <div className="relative w-48 shadow-2xl rounded-2xl overflow-hidden group-hover:-translate-y-2 transition-transform duration-500">
                  <img src={profile.currentRead.coverImage} alt={profile.currentRead.title} className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
