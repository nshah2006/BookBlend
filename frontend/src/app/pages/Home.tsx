import { motion } from "motion/react";
import { Wand2, Sparkles, ArrowRight, Star, Heart, Bookmark, Search, Compass, BookOpen, Trophy, Zap, Brain, MessageSquare, History, Leaf, Library, CloudRain } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { BOOKS, Book } from "../data/books";
import { toast } from "sonner";
import { useState } from "react";

export function Home() {
  const navigate = useNavigate();
  const featuredBooks = BOOKS.filter(b => b.isFeatured);

  const addToLibrary = (book: Book) => {
    toast.success(`'${book.title}' has been whisked away to your library!`, {
      icon: <Sparkles className="text-secondary w-5 h-5" />,
      style: {
        background: "var(--card)",
        color: "var(--foreground)",
        border: "1px solid var(--primary)"
      }
    });
  };

  return (
    <div className="space-y-24 px-6 md:px-0">
      {/* Hero Section */}
      <section className="container mx-auto relative overflow-hidden rounded-[3rem] min-h-[85vh] flex items-center justify-center p-8 mt-4 group">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1521920592574-49e0b121c964?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200" 
            alt="Enchanted Library" 
            className="w-full h-full object-cover brightness-[0.4] transition-transform duration-[20s] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/10" />
          
          {/* Animated Glows */}
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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full text-secondary text-sm font-bold uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(212,175,55,0.2)] mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            Vibe-First AI Recommendations
          </motion.div>
          
          <h1 className="text-5xl md:text-9xl font-serif text-foreground drop-shadow-2xl leading-[1.1] tracking-tight">
            Read How You <br />
            <span className="text-primary italic font-script lowercase">feel</span>
          </h1>
          
          <p className="text-foreground/90 text-lg md:text-2xl max-w-2xl mx-auto font-sans font-light leading-relaxed">
            Forget genres. BookBlend uses AI to match your current <span className="text-secondary font-bold">mood</span> and <span className="text-primary font-bold underline decoration-primary/50 underline-offset-8">vibe</span> to the perfect story.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <button 
              onClick={() => navigate("/mood-input")}
              className="w-full sm:w-auto bg-primary text-primary-foreground px-12 py-6 rounded-3xl font-bold text-xl hover:brightness-110 transition-all hover:scale-105 shadow-2xl border-2 border-primary/20 group flex items-center justify-center gap-4"
            >
              Start Vibe Check <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>
            <Link to="/explore" className="w-full sm:w-auto bg-white/5 backdrop-blur-md text-foreground border-2 border-white/10 px-12 py-6 rounded-3xl font-bold text-xl hover:bg-white/10 transition-all text-center">
              How it Works
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Core Feature Teaser */}
      <section className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 py-12 px-4">
        {[
          { title: "Emotional Pacing", desc: "Want a frantic page-turner or a slow, meditative exploration? Adjust your vibe on the fly.", icon: <Zap className="w-8 h-8" />, color: "text-yellow-400 bg-yellow-400/10" },
          { title: "AI Vibe Analysis", desc: "Our AI reads between the lines to find similar 'vibes' across genres, authors, and eras.", icon: <Brain className="w-8 h-8" />, color: "text-purple-400 bg-purple-400/10" },
          { title: "Mystical Quests", desc: "Stay motivated with reading challenges, earn badges, and join group reading circles.", icon: <Trophy className="w-8 h-8" />, color: "text-blue-400 bg-blue-400/10" }
        ].map((feature, i) => (
          <div key={i} className="p-10 bg-card rounded-[2.5rem] border-2 border-primary/5 shadow-xl hover:-translate-y-2 transition-all group">
            <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
              {feature.icon}
            </div>
            <h3 className="text-2xl font-serif text-foreground mb-4 font-bold">{feature.title}</h3>
            <p className="text-foreground/60 font-medium">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Featured Books Section */}
      <section className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 px-4 md:px-0">
          <div className="space-y-4">
            <h2 className="text-foreground flex items-center gap-4 text-4xl md:text-5xl">
              <Compass className="text-secondary w-10 h-10" />
              This Moon's Top <span className="text-primary italic">Vibes</span>
            </h2>
            <p className="text-foreground/60 font-medium text-lg">Curated stories that are currently resonating with the collective.</p>
          </div>
          <Link to="/explore" className="text-primary font-bold flex items-center gap-2 group hover:text-secondary transition-colors text-lg border-b-2 border-primary/20 pb-2">
            Explore the Glade <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
              onClick={() => navigate("/explore")}
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
                    onClick={(e) => { e.stopPropagation(); addToLibrary(book); }}
                    className="p-4 bg-black/40 backdrop-blur-md rounded-2xl text-white hover:bg-primary hover:text-primary-foreground transition-all shadow-xl"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="p-4 bg-black/40 backdrop-blur-md rounded-2xl text-white hover:bg-red-500 hover:text-white transition-all shadow-xl"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute bottom-10 left-10 right-10 text-white space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform">
                  <div className="flex items-center gap-2">
                    <span className="bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20 shadow-lg">98% Match</span>
                    <div className="flex gap-1 ml-auto">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(book.rating) ? "text-secondary fill-secondary" : "text-white/30"}`} />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-3xl font-serif font-bold leading-tight group-hover:text-secondary transition-colors">{book.title}</h3>
                  <p className="text-white/70 text-base italic">by {book.author}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Reading Progress Teaser */}
      <section className="bg-card py-24 relative overflow-hidden rounded-[3rem] border border-primary/10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 shadow-[0_0_20px_rgba(74,222,128,0.3)]" />
        
        <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
              <History className="w-4 h-4" />
              Lore Persistence
            </div>
            <h2 className="text-foreground font-serif italic text-5xl md:text-6xl leading-tight">Master Your <br /><span className="text-primary font-bold">Reading Lore</span></h2>
            <p className="text-foreground/70 text-xl font-light leading-relaxed max-w-xl">
              Track your progress through mythical realms, record your emotional reactions to every chapter, and build a persistent library of your literary journeys.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <span className="text-4xl font-serif text-secondary font-bold">14d</span>
                <p className="text-foreground/40 font-bold text-xs uppercase tracking-widest">Active Streak</p>
              </div>
              <div className="space-y-2">
                <span className="text-4xl font-serif text-primary font-bold">88%</span>
                <p className="text-foreground/40 font-bold text-xs uppercase tracking-widest">Reading Accuracy</p>
              </div>
            </div>
            <button 
              onClick={() => navigate("/library")}
              className="flex items-center gap-4 text-foreground font-bold text-lg group bg-white/5 p-4 rounded-3xl border border-white/10 hover:bg-white/10 transition-all w-fit"
            >
              <span className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform shadow-xl">
                <Library className="w-6 h-6" />
              </span>
              Go to Your Archives
            </button>
          </div>
          <div className="relative group">
            <div className="absolute -inset-8 bg-primary/20 rounded-[4rem] blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="bg-background/80 backdrop-blur-xl rounded-[4rem] p-12 border border-white/10 shadow-3xl relative z-10 space-y-8">
              <div className="flex justify-between items-center">
                <h4 className="text-foreground font-serif italic text-2xl">Currently Reading</h4>
                <div className="flex gap-2">
                  <span className="w-3 h-3 bg-red-400 rounded-full" />
                  <span className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <span className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
              </div>
              <div className="flex gap-6 items-center p-6 bg-white/5 rounded-[2rem] border border-white/5">
                <div className="w-24 h-32 bg-white rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-3 flex-grow">
                  <p className="text-foreground font-serif text-xl">The Night Circus</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                      <span>Progress</span>
                      <span className="text-primary">74%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: "74%" }} className="h-full bg-primary shadow-[0_0_10px_rgba(74,222,128,1)]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white/5 rounded-3xl text-center space-y-2 border border-white/5">
                  <span className="block text-2xl text-secondary font-serif font-bold">128</span>
                  <span className="text-[10px] text-foreground/30 uppercase font-bold tracking-widest">Pages Read</span>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl text-center space-y-2 border border-white/5">
                  <span className="block text-2xl text-primary font-serif font-bold">3.5h</span>
                  <span className="text-[10px] text-foreground/30 uppercase font-bold tracking-widest">Time Spent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Circles / Group Reading */}
      <section className="container mx-auto py-24 px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-serif text-foreground">Join the <span className="text-primary italic">Reading Circles</span></h2>
          <p className="text-foreground/60 text-lg max-w-2xl mx-auto font-medium">Discuss vibes, share scrolls, and embark on journeys with friends in low-pressure, aesthetic social spaces.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: "The Midnight Glade", members: "1.2k", mood: "Intense", icon: <CloudRain className="w-6 h-6" /> },
            { name: "Cottagecore Library", members: "4.5k", mood: "Peaceful", icon: <Leaf className="w-6 h-6" /> },
            { name: "The Scholar's Attic", members: "890", mood: "Curious", icon: <Brain className="w-6 h-6" /> },
            { name: "Ethereal Echoes", members: "2.1k", mood: "Whimsical", icon: <Sparkles className="w-6 h-6" /> },
          ].map((circle, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 bg-card rounded-[2.5rem] border-2 border-primary/5 shadow-xl hover:border-primary/20 transition-all group"
            >
              <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                {circle.icon}
              </div>
              <h4 className="text-xl font-serif font-bold text-foreground mb-2">{circle.name}</h4>
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-foreground/40 pt-4 border-t border-white/5">
                <span>{circle.members} Souls</span>
                <span className="text-primary">{circle.mood}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
