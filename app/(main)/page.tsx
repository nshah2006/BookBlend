"use client";

import { motion } from "motion/react";
import {
  Wand2,
  Sparkles,
  ArrowRight,
  Star,
  Heart,
  Bookmark,
  Compass,
  Trophy,
  Zap,
  Brain,
  History,
  Library,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { addBookToLibrary, getBooks, getProfile } from "@/lib/api";
import type { Book, ProfileResponse } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const featured = await getBooks("", "", true);
        setFeaturedBooks(featured.books);

        if (isAuthenticated) {
          const nextProfile = await getProfile();
          setProfile(nextProfile);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load the home page.");
      }
    };

    void load();
  }, [isAuthenticated]);

  const addToLibrary = async (book: Book) => {
    if (!isAuthenticated) {
      toast.info("Sign in to save books to your library.");
      router.push("/auth");
      return;
    }

    try {
      await addBookToLibrary(book.id, "reading");
      toast.success(`'${book.title}' has been whisked away to your library!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save that book.");
    }
  };

  return (
    <div className="space-y-24 px-6 md:px-0 pb-24 lg:pb-0">
      <section className="container mx-auto relative overflow-hidden rounded-[3rem] min-h-[85vh] flex items-center justify-center p-8 mt-4 group">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1521920592574-49e0b121c964?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200"
            alt="Enchanted Library"
            className="w-full h-full object-cover brightness-[0.4] transition-transform duration-[20s] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/10" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center space-y-10 max-w-5xl px-4"
        >
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full text-secondary text-sm font-bold uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(212,175,55,0.2)] mx-auto">
            <Sparkles className="w-4 h-4" />
            Vibe-First AI Recommendations
          </div>

          <h1 className="text-5xl md:text-9xl font-serif text-foreground drop-shadow-2xl leading-[1.1] tracking-tight">
            Read How You <br />
            <span className="text-primary italic font-script lowercase">feel</span>
          </h1>

          <p className="text-foreground/90 text-lg md:text-2xl max-w-2xl mx-auto font-sans font-light leading-relaxed">
            Forget genres. BookBlend matches your mood and pacing to recommendations,
            keeps your library in sync, and turns progress into quests.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <button
              onClick={() => router.push("/mood-input")}
              className="w-full sm:w-auto bg-primary text-primary-foreground px-12 py-6 rounded-3xl font-bold text-xl hover:brightness-110 transition-all hover:scale-105 shadow-2xl border-2 border-primary/20 group flex items-center justify-center gap-4"
            >
              Start Vibe Check{" "}
              <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>
            <Link
              href="/explore"
              className="w-full sm:w-auto bg-white/5 backdrop-blur-md text-foreground border-2 border-white/10 px-12 py-6 rounded-3xl font-bold text-xl hover:bg-white/10 transition-all text-center"
            >
              Explore the Catalog
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 py-12 px-4">
        {[
          {
            title: "Emotional Pacing",
            desc: "Tune the energy level you want right now, from meditative to frantic.",
            icon: <Zap className="w-8 h-8" />,
            color: "text-yellow-400 bg-yellow-400/10",
          },
          {
            title: "AI Vibe Analysis",
            desc: "Get ranked recommendation matches and a reason for every top result.",
            icon: <Brain className="w-8 h-8" />,
            color: "text-purple-400 bg-purple-400/10",
          },
          {
            title: "Mystical Quests",
            desc: "Track XP, level, and active challenge progress as your reading history grows.",
            icon: <Trophy className="w-8 h-8" />,
            color: "text-blue-400 bg-blue-400/10",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="p-10 bg-card rounded-[2.5rem] border-2 border-primary/5 shadow-xl hover:-translate-y-2 transition-all group"
          >
            <div
              className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}
            >
              {feature.icon}
            </div>
            <h3 className="text-2xl font-serif text-foreground mb-4 font-bold">
              {feature.title}
            </h3>
            <p className="text-foreground/60 font-medium">{feature.desc}</p>
          </div>
        ))}
      </section>

      <section className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 px-4 md:px-0">
          <div className="space-y-4">
            <h2 className="text-foreground flex items-center gap-4 text-4xl md:text-5xl">
              <Compass className="text-secondary w-10 h-10" />
              This Moon&apos;s Top <span className="text-primary italic">Vibes</span>
            </h2>
            <p className="text-foreground/60 font-medium text-lg">
              Live catalog data from the backend, ready to be searched, saved, and
              recommended.
            </p>
          </div>
          <Link
            href="/explore"
            className="text-primary font-bold flex items-center gap-2 group hover:text-secondary transition-colors text-lg border-b-2 border-primary/20 pb-2"
          >
            Explore the Glade{" "}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {featuredBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => router.push("/explore")}
            >
              <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl group-hover:shadow-primary/20 transition-all border-2 border-transparent group-hover:border-primary/40">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />

                <div className="absolute top-6 right-6 flex flex-col gap-3">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      void addToLibrary(book);
                    }}
                    className="p-4 bg-black/40 backdrop-blur-md rounded-2xl text-white hover:bg-primary hover:text-primary-foreground transition-all shadow-xl"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      toast.info(
                        "Wanderlist management is available from Explore and Library."
                      );
                    }}
                    className="p-4 bg-black/40 backdrop-blur-md rounded-2xl text-white hover:bg-red-500 hover:text-white transition-all shadow-xl"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute bottom-10 left-10 right-10 text-white space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform">
                  <div className="flex items-center gap-2">
                    <span className="bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20 shadow-lg">
                      Featured Match
                    </span>
                    <div className="flex gap-1 ml-auto">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(book.rating)
                              ? "text-secondary fill-secondary"
                              : "text-white/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-3xl font-serif font-bold leading-tight group-hover:text-secondary transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-white/70 text-base italic">by {book.author}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-card py-24 relative overflow-hidden rounded-[3rem] border border-primary/10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 shadow-[0_0_20px_rgba(74,222,128,0.3)]" />

        <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
              <History className="w-4 h-4" />
              Lore Persistence
            </div>
            <h2 className="text-foreground font-serif italic text-5xl md:text-6xl leading-tight">
              Master Your <br />
              <span className="text-primary font-bold">Reading Lore</span>
            </h2>
            <p className="text-foreground/70 text-xl font-light leading-relaxed max-w-xl">
              Auth, library progress, profile stats, and challenge XP all come from the
              new backend now.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <span className="text-4xl font-serif text-secondary font-bold">
                  {profile?.stats.dayStreak ?? 0}d
                </span>
                <p className="text-foreground/40 font-bold text-xs uppercase tracking-widest">
                  Active Streak
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-4xl font-serif text-primary font-bold">
                  {profile?.stats.readingAccuracy ?? 0}%
                </span>
                <p className="text-foreground/40 font-bold text-xs uppercase tracking-widest">
                  Reading Accuracy
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(profile ? "/library" : "/auth")}
              className="flex items-center gap-4 text-foreground font-bold text-lg group bg-white/5 p-4 rounded-3xl border border-white/10 hover:bg-white/10 transition-all w-fit"
            >
              <span className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform shadow-xl">
                <Library className="w-6 h-6" />
              </span>
              {profile ? "Go to Your Archives" : "Create Your Archive"}
            </button>
          </div>

          <div className="relative group">
            <div className="absolute -inset-8 bg-primary/20 rounded-[4rem] blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="bg-background/80 backdrop-blur-xl rounded-[4rem] p-12 border border-white/10 shadow-3xl relative z-10 space-y-8">
              <div className="flex justify-between items-center">
                <h4 className="text-foreground font-serif italic text-2xl">
                  Currently Reading
                </h4>
                <span className="text-xs uppercase tracking-widest text-primary/40">
                  {profile ? "Live profile data" : "Sign in to sync"}
                </span>
              </div>
              {profile?.currentRead ? (
                <>
                  <div className="flex gap-6 items-center p-6 bg-white/5 rounded-[2rem] border border-white/5">
                    <div className="w-24 h-32 bg-white rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
                      <img
                        src={profile.currentRead.coverImage}
                        alt={profile.currentRead.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-3 flex-grow">
                      <p className="text-foreground font-serif text-xl">
                        {profile.currentRead.title}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                          <span>Progress</span>
                          <span className="text-primary">
                            {profile.history.find(
                              (entry) => entry.title === profile.currentRead?.title
                            )?.progressPercent ?? 0}
                            %
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                profile.history.find(
                                  (entry) => entry.title === profile.currentRead?.title
                                )?.progressPercent ?? 0
                              }%`,
                            }}
                            className="h-full bg-primary shadow-[0_0_10px_rgba(74,222,128,1)]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 rounded-3xl text-center space-y-2 border border-white/5">
                      <span className="block text-2xl text-secondary font-serif font-bold">
                        {profile.stats.pagesRead}
                      </span>
                      <span className="text-[10px] text-foreground/30 uppercase font-bold tracking-widest">
                        Pages Read
                      </span>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl text-center space-y-2 border border-white/5">
                      <span className="block text-2xl text-primary font-serif font-bold">
                        {profile.stats.timeSpentHours}h
                      </span>
                      <span className="text-[10px] text-foreground/30 uppercase font-bold tracking-widest">
                        Time Spent
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 text-foreground/60">
                  Sign in and save a few books to see your live reading progress,
                  stats, and next recommendation here.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
