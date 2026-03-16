import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Sparkles, BookOpen, Star, Heart, Bookmark, Compass, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { addBookToLibrary, getAuthToken, getBooks, getLatestRecommendation } from "../lib/api";
import type { Book } from "../types/api";

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
        {
          icon: <Sparkles className="text-secondary w-5 h-5" />,
          style: {
            background: "#14532d",
            color: "#fefce8",
            border: "1px solid #d4af37",
          },
        },
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save that book.");
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header & Search */}
      <div className="space-y-12 mb-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 text-secondary bg-secondary/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-secondary/20"
          >
            <Compass className="w-3 h-3" />
            Venture into the Unseen
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-serif text-primary italic">The Great Glade Library</h1>
          <p className="text-primary/60 text-lg">Every book here has been touched by the magic of the forest. Sift through the leaves to find your next soul-warming tale.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-secondary/50 via-primary/50 to-secondary/50 blur opacity-20 group-focus-within:opacity-40 transition-opacity rounded-2xl pointer-events-none" />
          <div className="relative flex-grow flex items-center bg-white border-2 border-primary/10 rounded-2xl px-6 py-4 focus-within:border-secondary transition-all shadow-xl">
            <Search className="text-secondary w-6 h-6 mr-4" />
            <input 
              type="text" 
              placeholder="Search by title, author, or spell..." 
              className="bg-transparent border-none outline-none w-full text-lg text-primary placeholder:text-primary/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="p-2 hover:bg-accent/30 rounded-full transition-colors">
                <X className="w-5 h-5 text-primary/40" />
              </button>
            )}
          </div>
          <div className="relative flex items-center bg-white border-2 border-primary/10 rounded-2xl px-6 py-4 focus-within:border-secondary transition-all shadow-xl min-w-[200px]">
            <Filter className="text-secondary w-5 h-5 mr-4" />
            <select 
              className="bg-transparent border-none outline-none w-full text-primary font-medium appearance-none"
              value={selectedGenre || ""}
              onChange={(e) => setSelectedGenre(e.target.value || null)}
            >
              <option value="">All Realms</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all border shadow-sm ${
                selectedGenre === genre 
                  ? "bg-secondary text-primary border-secondary shadow-secondary/20 scale-105" 
                  : "bg-white text-primary/60 border-primary/10 hover:border-secondary hover:text-secondary"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {recommendationIds.size > 0 && (
        <div className="mb-8 max-w-4xl mx-auto rounded-2xl border border-secondary/20 bg-secondary/10 px-6 py-4 text-center text-primary">
          Your latest vibe blend is active. Recommended titles are pinned to the top of this catalog.
        </div>
      )}

      {books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          <AnimatePresence mode="popLayout">
            {books.map((book) => (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group cursor-pointer"
                onClick={() => setSelectedBook(book)}
              >
                <div className="relative aspect-[3/4.5] rounded-[2rem] overflow-hidden mb-6 shadow-xl group-hover:shadow-secondary/30 transition-all border-2 border-transparent group-hover:border-secondary/40">
                  <img src={book.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {recommendationIds.has(book.id) && (
                    <div className="absolute top-4 left-4 rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary-foreground shadow-lg">
                      Vibe Match
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                    <p className="text-white text-sm line-clamp-3 mb-4 italic">"{book.description}"</p>
                    <button 
                      className="w-full bg-secondary text-primary py-3 rounded-xl font-bold text-sm shadow-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        void addToShelf(book, "reading");
                      }}
                    >
                      Summon to Library
                    </button>
                  </div>
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        void addToShelf(book, "wishlist");
                      }}
                      className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-secondary hover:text-primary transition-all shadow-lg"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        toast.info("Use the wanderlist button to save favorites.");
                      }}
                      className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-serif text-primary group-hover:text-secondary transition-colors truncate">{book.title}</h3>
                  <p className="text-primary/50 text-sm font-medium">by {book.author}</p>
                  <div className="flex items-center gap-1 pt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.floor(book.rating) ? "text-secondary fill-secondary" : "text-primary/10"}`} />
                    ))}
                    <span className="text-[10px] font-bold text-secondary ml-1">{book.rating}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-24 space-y-6">
          <div className="w-24 h-24 bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary/20">
            <Sparkles className="w-10 h-10 text-secondary opacity-20 animate-pulse" />
          </div>
          <h3 className="text-3xl font-serif text-primary/60">No tales found in this glade...</h3>
          <p className="text-primary/40">Try whispering a different keyword to the forest spirits.</p>
          <button 
            onClick={() => {setSearchQuery(""); setSelectedGenre(null)}} 
            className="text-secondary font-bold flex items-center gap-2 mx-auto hover:underline"
          >
            Clear All Enchantments
          </button>
        </div>
      )}

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-background rounded-[3rem] overflow-hidden shadow-2xl border-2 border-secondary/20 flex flex-col md:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedBook(null)}
                className="absolute top-6 right-6 z-20 p-3 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
              >
                <X className="text-primary" />
              </button>

              <div className="w-full md:w-2/5 relative h-[300px] md:h-auto border-r border-secondary/10">
                <img src={selectedBook.coverImage} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent md:hidden" />
              </div>

              <div className="w-full md:w-3/5 p-8 md:p-16 overflow-y-auto space-y-10 custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedBook.genre.map(g => (
                      <span key={g} className="text-[10px] font-bold uppercase tracking-widest text-secondary border border-secondary/30 px-3 py-1.5 rounded-full bg-secondary/5">
                        {g}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-5xl font-serif text-primary leading-tight">{selectedBook.title}</h2>
                  <p className="text-2xl font-serif text-secondary italic">by {selectedBook.author}</p>
                  <div className="flex items-center gap-6 py-2">
                    <div className="flex items-center gap-2">
                      <Star className="text-secondary fill-secondary w-6 h-6" />
                      <span className="text-xl font-bold text-primary">{selectedBook.rating}</span>
                      <span className="text-primary/40 text-sm">/ 5.0</span>
                    </div>
                    <div className="w-px h-6 bg-primary/10" />
                    <div className="flex items-center gap-2 text-primary/60 font-medium">
                      <BookOpen className="w-5 h-5 text-secondary" />
                      <span>{selectedBook.publishedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="uppercase tracking-[0.2em] text-xs font-bold text-primary/40">The Lore</h4>
                  <p className="text-primary/80 text-xl leading-relaxed font-light">
                    {selectedBook.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-primary/5">
                  <button 
                    onClick={() => {
                      void addToShelf(selectedBook, "reading");
                      setSelectedBook(null);
                    }}
                    className="flex-grow bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-3 border-2 border-primary shadow-xl shadow-primary/10"
                  >
                    <Sparkles className="w-6 h-6 text-secondary" />
                    Add to Library
                  </button>
                  <button
                    onClick={() => {
                      void addToShelf(selectedBook, "wishlist");
                      setSelectedBook(null);
                    }}
                    className="bg-white border-2 border-primary/10 text-primary px-10 py-5 rounded-2xl font-bold text-lg hover:border-secondary hover:text-secondary transition-all flex items-center justify-center gap-3"
                  >
                    <Heart className="w-6 h-6" />
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
          background: #d4af37;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
