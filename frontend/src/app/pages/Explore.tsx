import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Sparkles, BookOpen, Star, Heart, Bookmark, Compass, X, ArrowRight, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { addBookToLibrary, getAuthToken, getBooks, getLatestRecommendation } from "../lib/api";
import type { Book } from "../types/api";

const MOCK_CIRCLES = [
  {
    id: "c1",
    name: "The Midnight Readers",
    activeMatches: 784,
    color: "bg-primary",
    textColor: "text-primary-foreground",
    avatars: [
      "https://i.pravatar.cc/100?img=1",
      "https://i.pravatar.cc/100?img=2",
      "https://i.pravatar.cc/100?img=3",
      "https://i.pravatar.cc/100?img=4",
    ]
  },
  {
    id: "c2",
    name: "Historical Fiction Enthusiasts",
    activeMatches: 1200,
    color: "bg-surface-container-high",
    textColor: "text-primary",
    avatars: [
      "https://i.pravatar.cc/100?img=5",
      "https://i.pravatar.cc/100?img=6",
      "https://i.pravatar.cc/100?img=7",
    ]
  },
  {
    id: "c3",
    name: "Sci-Fi & Futurism",
    activeMatches: 432,
    color: "bg-secondary",
    textColor: "text-secondary-foreground",
    avatars: [
      "https://i.pravatar.cc/100?img=8",
      "https://i.pravatar.cc/100?img=9",
      "https://i.pravatar.cc/100?img=10",
      "https://i.pravatar.cc/100?img=11",
    ]
  }
];

export function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const recommendationIds = useMemo(
    () => new Set(getLatestRecommendation()?.recommendations.map((entry) => entry.book.id) ?? []),
    [],
  );

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = await getBooks();
        setGenres(response.genres);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load book filters.");
      }
    };
    void loadGenres();
  }, []);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const response = await getBooks(searchQuery, selectedGenre ?? "");
        const orderedBooks = [...response.books].sort((left, right) => {
          const leftRecommended = recommendationIds.has(left.id) ? 1 : 0;
          const rightRecommended = recommendationIds.has(right.id) ? 1 : 0;
          return rightRecommended - leftRecommended;
        });
        setBooks(orderedBooks);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load books.");
      }
    };
    void loadBooks();
  }, [recommendationIds, searchQuery, selectedGenre]);

  const addToShelf = async (book: Book, status: "reading" | "wishlist") => {
    if (!getAuthToken()) {
      toast.info("Sign in to save books to your library.");
      return;
    }
    try {
      await addBookToLibrary(book.id, status);
      toast.success(
        status === "wishlist"
          ? `'${book.title}' has been added to your wanderlist.`
          : `'${book.title}' has been whisked away to your library!`,
        { icon: <Sparkles className="text-secondary w-5 h-5" /> },
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save that book.");
    }
  };

  return (
    <div className="container mx-auto pb-24 font-sans">
      {/* Community / Circles Section - The "Find Your Circle" Vibe */}
      <section className="bg-surface-container-lowest pt-16 pb-12 px-6 rounded-b-[4rem] border-b border-border/20 shadow-sm mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-10">
          <h1 className="text-5xl md:text-7xl font-serif text-primary tracking-tight">
            Find your <span className="italic text-primary/80">circle.</span>
          </h1>

          <div className="relative max-w-xl flex items-center bg-card rounded-full p-2 shadow-ambient border border-border/20 focus-within:border-primary/40 transition-colors">
            <Search className="text-primary/40 w-5 h-5 ml-4" />
            <input
              type="text"
              placeholder="Search circles by vibe, genre, or mood..."
              className="bg-transparent border-none outline-none w-full px-4 py-3 text-foreground placeholder:text-foreground/40 font-medium"
            />
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide px-2">
            {MOCK_CIRCLES.map((circle, i) => (
              <motion.div
                key={circle.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`min-w-[320px] w-[320px] shrink-0 ${circle.color} ${circle.textColor} p-8 rounded-[2.5rem] shadow-lg flex flex-col justify-between h-[360px] relative group cursor-pointer transition-transform hover:-translate-y-2`}
              >
                <div className="space-y-3">
                  <h3 className="font-serif text-3xl leading-tight">{circle.name}</h3>
                  <p className="text-sm opacity-80 font-bold uppercase tracking-widest">{circle.activeMatches.toLocaleString()} Active Vibe Matches</p>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex -space-x-3">
                    {circle.avatars.map((avatar, idx) => (
                      <div key={idx} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden relative z-10">
                        <img src={avatar} alt="Member" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-background bg-surface-container flex items-center justify-center text-primary text-xs font-bold relative z-0">
                      +99
                    </div>
                  </div>
                  <button className="w-12 h-12 rounded-full bg-card/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-card text-current transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Book Catalog Section */}
      <section className="px-6 max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border/40 pb-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-primary italic">The Great Glade Library</h2>
            <p className="text-primary/60 font-medium">Discover your next read from our curated catalog.</p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0 flex items-center bg-surface-container-low rounded-xl px-4 py-3 border border-border/20 focus-within:border-primary/40 transition-colors">
              <Search className="text-primary/40 w-4 h-4 mr-3" />
              <input
                type="text"
                placeholder="Search authors, titles..."
                className="bg-transparent border-none outline-none w-full text-sm font-medium text-foreground placeholder:text-foreground/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="hover:bg-foreground/10 rounded-full p-1">
                  <X className="w-4 h-4 text-primary/40" />
                </button>
              )}
            </div>

            <div className="relative flex items-center bg-surface-container-low rounded-xl px-4 py-3 border border-border/20 hover:border-primary/40 transition-colors cursor-pointer min-w-[140px]">
              <Filter className="text-primary/40 w-4 h-4 mr-3" />
              <select
                className="bg-transparent border-none outline-none w-full text-primary font-bold text-sm appearance-none cursor-pointer"
                value={selectedGenre || ""}
                onChange={(e) => setSelectedGenre(e.target.value || null)}
              >
                <option value="">All Realms</option>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        {recommendationIds.size > 0 && (
          <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4 flex items-center gap-4">
            <Sparkles className="text-secondary w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium text-primary">Your latest vibe blend is active. Recommended titles are pinned to the top of the catalog.</p>
          </div>
        )}

        {books.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {books.map((book) => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group cursor-pointer flex flex-col"
                  onClick={() => setSelectedBook(book)}
                >
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all border border-border/10 group-hover:border-primary/20">
                    <img src={book.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    {recommendationIds.has(book.id) && (
                      <div className="absolute top-3 left-3 bg-secondary px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest text-secondary-foreground shadow-md backdrop-blur-sm">
                        Vibe Match
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <button
                        className="w-full bg-card text-foreground py-2.5 rounded-lg font-bold text-xs shadow-xl active:scale-95 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          void addToShelf(book, "reading");
                        }}
                      >
                        Start Journey
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 flex-grow">
                    <h3 className="text-lg font-serif text-primary leading-snug group-hover:text-secondary transition-colors line-clamp-2">{book.title}</h3>
                    <p className="text-primary/60 text-xs font-bold uppercase tracking-widest">by {book.author}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-24 space-y-6 bg-surface-container-lowest rounded-[3rem] border border-border/10">
            <Compass className="w-12 h-12 text-primary/20 mx-auto animate-pulse" />
            <div className="space-y-2">
              <h3 className="text-2xl font-serif text-primary">No tales found</h3>
              <p className="text-primary/50 text-sm">Try whispering a different keyword or removing filters.</p>
            </div>
            <button
              onClick={() => { setSearchQuery(""); setSelectedGenre(null) }}
              className="px-6 py-2 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest rounded-full transition-colors"
            >
              Clear Enchantments
            </button>
          </div>
        )}
      </section>

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-background rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/20 flex flex-col md:flex-row max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-card/20 hover:bg-card/35 backdrop-blur-md rounded-full transition-colors"
              >
                <X className="text-primary w-5 h-5" />
              </button>

              <div className="w-full md:w-2/5 relative h-[300px] md:h-auto bg-surface-container p-8 flex items-center justify-center">
                <img src={selectedBook.coverImage} className="max-h-full max-w-full object-cover rounded-xl shadow-2xl" />
              </div>

              <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto space-y-8 custom-scrollbar">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedBook.genre.map(g => (
                      <span key={g} className="text-[9px] font-bold uppercase tracking-widest text-primary/60 border border-border/40 px-3 py-1 rounded-full bg-surface-container">
                        {g}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-4xl font-serif text-primary leading-tight">{selectedBook.title}</h2>
                  <p className="text-xl font-serif text-primary/60 italic">by {selectedBook.author}</p>
                </div>

                <div className="flex items-center gap-6 py-4 border-y border-border/20">
                  <div className="flex items-center gap-2">
                    <Star className="text-secondary fill-secondary w-5 h-5" />
                    <span className="text-lg font-bold text-primary">{selectedBook.rating}</span>
                  </div>
                  <div className="w-px h-8 bg-border/40" />
                  <div className="flex items-center gap-2 text-primary/60">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-widest">{selectedBook.publishedDate}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="uppercase tracking-[0.2em] text-[10px] font-bold text-primary/40">The Lore</h4>
                  <p className="text-primary/80 text-lg leading-relaxed font-light">
                    {selectedBook.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => {
                      void addToShelf(selectedBook, "reading");
                      setSelectedBook(null);
                    }}
                    className="flex-grow bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-sm hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <BookOpen className="w-4 h-4" />
                    Add to Library
                  </button>
                  <button
                    onClick={() => {
                      void addToShelf(selectedBook, "wishlist");
                      setSelectedBook(null);
                    }}
                    className="bg-surface-container text-primary border border-border/20 px-8 py-4 rounded-xl font-bold text-sm hover:bg-surface-container-high transition-all flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Wanderlist
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: color-mix(in srgb, var(--color-primary) 30%, transparent);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
