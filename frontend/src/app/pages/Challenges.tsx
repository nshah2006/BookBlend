import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Trophy, Star, Heart, Flame, ArrowRight, MessageSquare, CheckCircle2, Brain } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { getAuthToken, getChallenges, getLeaderboard } from "../lib/api";
import type { Challenge } from "../types/api";

export function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [summary, setSummary] = useState({
    totalXp: 0,
    level: 1,
    completedChallenges: 0,
    activeChallenges: 0,
    completionRate: 0,
    nextLevelXp: 120,
  });
  const [leaderboard, setLeaderboard] = useState<Array<{ rank: number; name: string; xp: number; level: number; isCurrentUser?: boolean }>>([]);

  const icons = useMemo(
    () => ({
      "midnight-reader": <Flame className="w-8 h-8 text-orange-500" />,
      "vibe-explorer": <Brain className="w-8 h-8 text-tertiary" />,
      "social-sanctuary": <MessageSquare className="w-8 h-8 text-blue-500" />,
      "deep-diver": <Heart className="w-8 h-8 text-red-500" />,
    }),
    [],
  );

  useEffect(() => {
    const load = async () => {
      if (!getAuthToken()) {
        return;
      }

      try {
        const [challengeResponse, leaderboardResponse] = await Promise.all([getChallenges(), getLeaderboard()]);
        setChallenges(challengeResponse.challenges);
        setSummary(challengeResponse.summary);
        setLeaderboard(leaderboardResponse.entries);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load quest data.");
      }
    };

    void load();
  }, []);

  if (!getAuthToken()) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mt-24 p-12 bg-primary rounded-[3rem] text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-tertiary to-secondary opacity-50 shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
          <div className="relative z-10 space-y-6">
            <Trophy className="w-16 h-16 text-secondary mx-auto mb-4 animate-bounce" />
            <h2 className="text-4xl font-serif text-primary-foreground italic">Quest tracking starts after sign-in</h2>
            <p className="text-primary-foreground/70 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              Challenges, XP, levels, and the seasonal leaderboard all come from your authenticated backend profile.
            </p>
            <Link to="/auth" className="inline-flex bg-secondary text-secondary-foreground px-10 py-5 rounded-2xl font-bold text-lg hover:bg-secondary/90 transition-all hover:scale-105 shadow-xl border-2 border-secondary group">
              Enter the Sanctuary <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest border border-secondary/20">
            <Trophy className="w-4 h-4" />
            Active Quests
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-serif text-primary italic">Reading Challenges</h1>
          <p className="text-muted-foreground text-lg">Your backend quest progress updates from recommendations, reading, and completed books.</p>
        </div>
        <div className="flex bg-card rounded-2xl p-4 shadow-xl border-2 border-primary/5 items-center gap-6 self-start md:self-auto">
          <div className="text-center">
            <span className="block text-2xl font-serif font-bold text-tertiary">{summary.totalXp}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total XP</span>
          </div>
          <div className="w-px h-10 bg-primary/10" />
          <div className="text-center">
            <span className="block text-2xl font-serif font-bold text-secondary">Level {summary.level}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Voyager Rank</span>
          </div>
        </div>
      </div>

      <div className="mb-12 rounded-2xl border border-primary/10 bg-card p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <p className="text-muted-foreground">
          <span className="font-bold text-primary">{summary.completedChallenges}</span> completed quests and{" "}
          <span className="font-bold text-primary">{summary.activeChallenges}</span> active.
        </p>
        <p className="text-muted-foreground">
          Challenge completion rate: <span className="font-bold text-tertiary">{summary.completionRate}%</span>
        </p>
        <p className="text-muted-foreground md:text-right">
          Next level target: <span className="font-bold text-secondary">{summary.nextLevelXp} XP</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {challenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-8 rounded-[2.5rem] border-2 flex flex-col justify-between h-[320px] relative overflow-hidden transition-all group hover:shadow-2xl hover:border-secondary/40 border-primary/5 bg-card"
          >
            {challenge.isCompleted && (
              <div className="absolute top-6 right-6 z-10 p-2 bg-secondary rounded-full shadow-lg shadow-secondary/20">
                <CheckCircle2 className="w-6 h-6 text-secondary-foreground" />
              </div>
            )}

            <div className="space-y-6">
              <div className="p-4 bg-background rounded-2xl w-fit shadow-lg shadow-black/5 group-hover:scale-110 transition-transform">
                {icons[challenge.id as keyof typeof icons] ?? <Trophy className="w-8 h-8 text-secondary" />}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-primary group-hover:text-tertiary transition-colors">{challenge.title}</h3>
                <p className="text-muted-foreground font-medium">{challenge.desc}</p>
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-primary/5">
              <div className="flex justify-between items-end text-xs font-bold uppercase tracking-widest">
                <span className="text-muted-foreground">Quest Progress</span>
                <span className="text-tertiary">{challenge.progress}%</span>
              </div>
              <div className="h-2 w-full bg-primary/5 rounded-full overflow-hidden border border-primary/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${challenge.progress}%` }}
                  transition={{ duration: 1.1, delay: 0.3 }}
                  className={`h-full bg-gradient-to-r ${challenge.isCompleted ? "from-secondary to-secondary" : "from-tertiary/50 to-tertiary"} rounded-full shadow-[0_0_10px_rgba(212,175,55,0.3)]`}
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3 text-secondary" />
                  Reward: {challenge.reward}
                </span>
                <button className={`p-2 rounded-lg transition-all ${challenge.isCompleted ? "bg-secondary/10 text-secondary" : "hover:bg-primary/5 text-primary/40"}`}>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 p-12 bg-primary rounded-[3rem] text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-tertiary to-secondary opacity-50 shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
        <div className="relative z-10 space-y-6">
          <Trophy className="w-16 h-16 text-secondary mx-auto mb-4 animate-bounce" />
          <h2 className="text-4xl font-serif text-primary-foreground italic">Seasonal Leaderboard</h2>
          <p className="text-primary-foreground/60 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            These rankings are served by the backend and updated alongside your quest XP.
          </p>
          <div className="max-w-2xl mx-auto space-y-3 text-left">
            {leaderboard.map((entry) => (
              <div key={entry.rank} className={`rounded-2xl border px-5 py-4 flex items-center justify-between ${entry.isCurrentUser ? "bg-secondary/15 border-secondary/30 text-secondary-foreground" : "bg-primary-foreground/10 border-primary-foreground/10 text-primary-foreground"}`}>
                <span className="font-bold">{entry.rank}. {entry.name}</span>
                <span className="text-sm uppercase tracking-widest opacity-80">
                  {entry.xp} XP · Level {entry.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
