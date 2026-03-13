import { useState } from "react";
import { BOOKS, Book } from "../data/books";
import { Sparkles, Library, Heart, Bookmark, Search, Trash2, BookOpen, Star, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function MyLibrary() {
  const [activeTab, setActiveTab] = useState("reading");
  // Mocking some saved books
  const savedBooks = BOOKS.slice(0, 3);

  const tabs = [
    { id: "reading", name: "Currently Reading", icon: <BookOpen className="w-4 h-4" /> },
    { id: "wishlist", name: "The Wanderlist", icon: <Heart className="w-4 h-4" /> },
    { id: "completed", name: "Lore Mastered", icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-primary/10 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-secondary bg-secondary/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-secondary/20">
            <Library className="w-3 h-3" />
            Your Private Grove
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-primary italic">The Keeper's Archive</h1>
          <p className="text-primary/60 text-lg">Where your journeys through the realms are preserved in gold and green.</p>
        </div>
        
        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-primary/10 shadow-xl self-start md:self-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                  : "text-primary/50 hover:text-primary hover:bg-white/50"
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {savedBooks.length > 0 ? (
        <div className="space-y-12">
          {savedBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-[2.5rem] border-2 border-primary/5 p-8 flex flex-col md:flex-row gap-12 hover:shadow-2xl hover:border-secondary/30 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Gold Ribbon Indicator */}
              <div className="absolute top-0 left-12 w-8 h-12 bg-secondary/20 rounded-b-lg border-x-2 border-b-2 border-secondary group-hover:bg-secondary group-hover:h-16 transition-all flex items-end justify-center pb-2">
                <Bookmark className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
              </div>

              <div className="w-full md:w-[240px] aspect-[3/4.5] rounded-3xl overflow-hidden flex-shrink-0 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                <img src={book.coverImage} className="w-full h-full object-cover" />
              </div>

              <div className="flex-grow flex flex-col justify-between py-4 space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-4xl font-serif text-primary leading-tight">{book.title}</h3>
                      <p className="text-xl font-serif text-secondary italic">by {book.author}</p>
                    </div>
                    <button className="p-3 text-primary/20 hover:text-secondary hover:bg-secondary/10 rounded-full transition-all">
                      <MoreVertical className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-primary/60 text-lg line-clamp-2 italic">
                    {book.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {book.genre.map(g => (
                      <span key={g} className="text-[10px] font-bold uppercase tracking-widest text-primary/40 border border-primary/10 px-3 py-1.5 rounded-full bg-primary/5 group-hover:border-secondary/20 transition-colors">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-12 border-t border-primary/5 pt-8">
                  <div className="flex-grow w-full space-y-4">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-primary/40">
                      <span>Reading Progress</span>
                      <span className="text-secondary">{Math.floor(Math.random() * 80 + 20)}%</span>
                    </div>
                    <div className="h-2 w-full bg-primary/5 rounded-full overflow-hidden border border-primary/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.floor(Math.random() * 80 + 20)}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-secondary/50 via-secondary to-secondary/80 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 w-full sm:w-auto">
                    <button className="flex-grow sm:flex-grow-0 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xl border-2 border-primary">
                      <BookOpen className="w-4 h-4 text-secondary" />
                      Continue Reading
                    </button>
                    <button className="p-4 bg-white border-2 border-primary/10 text-destructive/40 hover:text-destructive hover:border-destructive/20 rounded-2xl transition-all shadow-sm">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 space-y-8 bg-white/30 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-primary/10">
          <div className="w-32 h-32 bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-secondary/20 relative group">
            <Library className="w-16 h-16 text-secondary opacity-20" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Sparkles className="w-24 h-24 text-secondary/10" />
            </motion.div>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-serif text-primary/60 italic">The glade is empty...</h3>
            <p className="text-primary/40 text-lg max-w-md mx-auto">No stories have been saved to your private collection yet. Visit the explore page to find your first tale.</p>
          </div>
          <button className="bg-secondary text-primary px-10 py-5 rounded-2xl font-bold text-lg hover:bg-secondary/90 transition-all hover:scale-105 shadow-xl border-2 border-secondary">
            Go Seeking Stories
          </button>
        </div>
      )}
    </div>
  );
}
