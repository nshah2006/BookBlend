import { motion } from "motion/react";
import { Trophy, Star, Zap, Heart, Flame, ArrowRight, MessageSquare, CheckCircle2, Brain } from "lucide-react";

export function Challenges() {
  const challenges = [
    {
      id: 1,
      title: "The Midnight Reader",
      desc: "Complete an intense thriller between 10 PM and 4 AM.",
      reward: "Lunar Reader Badge",
      progress: 65,
      icon: <Flame className="w-8 h-8 text-orange-500" />,
      color: "border-orange-200 bg-orange-50 text-orange-700"
    },
    {
      id: 2,
      title: "Vibe Explorer",
      desc: "Finish books in 3 different mood categories this month.",
      reward: "Mood Master Title",
      progress: 33,
      icon: <Brain className="w-8 h-8 text-tertiary" />,
      color: "border-purple-200 bg-purple-50 text-purple-700"
    },
    {
      id: 3,
      title: "Social Sanctuary",
      desc: "Discuss a 'Vibe-matched' book with a friend in a Circle.",
      reward: "Social Scroll Badge",
      progress: 0,
      icon: <MessageSquare className="w-8 h-8 text-blue-500" />,
      color: "border-blue-200 bg-blue-50 text-blue-700"
    },
    {
      id: 4,
      title: "The Deep Diver",
      desc: "Complete a book with an emotional depth score over 80%.",
      reward: "Deep Sea Reader Badge",
      progress: 100,
      icon: <Heart className="w-8 h-8 text-red-500" />,
      color: "border-red-200 bg-red-50 text-red-700",
      isCompleted: true
    },
  ];

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest border border-secondary/20"
          >
            <Trophy className="w-4 h-4" />
            Active Quests
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-serif text-primary italic">Reading Challenges</h1>
          <p className="text-primary/60 text-lg">Level up your reading journey by conquering these mystical quests.</p>
        </div>
        <div className="flex bg-card rounded-2xl p-4 shadow-xl border-2 border-primary/5 items-center gap-6 self-start md:self-auto">
          <div className="text-center">
            <span className="block text-2xl font-serif font-bold text-tertiary">1,240</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 dark:text-foreground/40">Total XP</span>
          </div>
          <div className="w-px h-10 bg-primary/10" />
          <div className="text-center">
            <span className="block text-2xl font-serif font-bold text-secondary">Level 14</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 dark:text-foreground/40">Voyager Rank</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {challenges.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-8 rounded-[2.5rem] border-2 flex flex-col justify-between h-[320px] relative overflow-hidden transition-all group hover:shadow-2xl hover:border-secondary/40 border-primary/5 bg-card`}
          >
            {c.isCompleted && (
              <div className="absolute top-6 right-6 z-10 p-2 bg-secondary rounded-full shadow-lg shadow-secondary/20">
                <CheckCircle2 className="w-6 h-6 text-secondary-foreground" />
              </div>
            )}

            <div className="space-y-6">
              <div className="p-4 bg-background rounded-2xl w-fit shadow-lg shadow-black/5 group-hover:scale-110 transition-transform">
                {c.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-primary dark:text-foreground group-hover:text-tertiary transition-colors">{c.title}</h3>
                <p className="text-primary/60 dark:text-foreground/60 font-medium">{c.desc}</p>
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-primary/5">
              <div className="flex justify-between items-end text-xs font-bold uppercase tracking-widest">
                <span className="text-primary/40 dark:text-foreground/40">Quest Progress</span>
                <span className="text-tertiary">{c.progress}%</span>
              </div>
              <div className="h-2 w-full bg-primary/5 dark:bg-white/5 rounded-full overflow-hidden border border-primary/5 dark:border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${c.progress}%` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className={`h-full bg-gradient-to-r ${c.isCompleted ? "from-secondary to-secondary" : "from-tertiary/50 to-tertiary"} rounded-full shadow-[0_0_10px_rgba(212,175,55,0.3)]`}
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/30 dark:text-foreground/30 flex items-center gap-1">
                  <Star className="w-3 h-3 text-secondary" />
                  Reward: {c.reward}
                </span>
                <button className={`p-2 rounded-lg transition-all ${c.isCompleted ? "bg-secondary/10 text-secondary" : "hover:bg-primary/5 dark:hover:bg-white/5 text-primary/20 dark:text-white/20"}`}>
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
            See how your vibe-matching progress compares to other voyagers this moon. The top 10% receive an exclusive mystical book token.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-secondary text-secondary-foreground px-10 py-5 rounded-2xl font-bold text-lg hover:bg-secondary/90 transition-all hover:scale-105 shadow-xl border-2 border-secondary group">
              View Leaderboard <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-primary-foreground/10 backdrop-blur-md text-primary-foreground border border-primary-foreground/20 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-primary-foreground/20 transition-all">
              Join a Circle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
