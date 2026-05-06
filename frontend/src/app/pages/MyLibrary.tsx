import { useEffect, useMemo, useState } from "react";
import { Sparkles, Library, Heart, Bookmark, Trash2, BookOpen, Star, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { toast } from "sonner";
import { deleteLibraryItem, getAuthToken, getLibrary, updateLibraryItem } from "../lib/api";
import type { LibraryItem } from "../types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Slider } from "../components/ui/slider";

interface ProgressDialog {
  item: LibraryItem;
  pagesRead: string;
  progressPercent: number;
}

export function MyLibrary() {
  const [activeTab, setActiveTab] = useState("reading");
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progressDialog, setProgressDialog] = useState<ProgressDialog | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: "reading", name: "Currently Reading", icon: <BookOpen className="w-4 h-4" /> },
    { id: "wishlist", name: "The Wanderlist", icon: <Heart className="w-4 h-4" /> },
    { id: "completed", name: "Lore Mastered", icon: <Star className="w-4 h-4" /> },
  ];

  useEffect(() => {
    const load = async () => {
      if (!getAuthToken()) {
        setIsLoaded(true);
        return;
      }

      try {
        const response = await getLibrary();
        setLibraryItems(response.items);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load your library.");
      } finally {
        setIsLoaded(true);
      }
    };

    void load();
  }, []);

  const filteredItems = useMemo(
    () => libraryItems.filter((item) => item.status === activeTab),
    [activeTab, libraryItems],
  );

  const refreshLibrary = async () => {
    const response = await getLibrary();
    setLibraryItems(response.items);
  };

  const openProgressDialog = (item: LibraryItem) => {
    setProgressDialog({
      item,
      pagesRead: item.pagesRead > 0 ? String(item.pagesRead) : "",
      progressPercent: item.progressPercent,
    });
  };

  const saveProgress = async () => {
    if (!progressDialog) return;
    const { item, pagesRead, progressPercent } = progressDialog;

    const pages = Math.max(0, parseInt(pagesRead, 10) || 0);
    const percent = Math.min(100, Math.max(0, progressPercent));
    const nextStatus = percent >= 100 ? "completed" : "reading";

    setIsSaving(true);
    try {
      await updateLibraryItem(item.bookId, {
        status: nextStatus,
        progressPercent: percent,
        pagesRead: pages,
      });
      await refreshLibrary();
      setProgressDialog(null);
      toast.success(
        nextStatus === "completed"
          ? `You finished ${item.book.title}!`
          : `Progress updated for ${item.book.title}.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update progress.");
    } finally {
      setIsSaving(false);
    }
  };

  const startReading = async (item: LibraryItem) => {
    try {
      await updateLibraryItem(item.bookId, { status: "reading" });
      await refreshLibrary();
      toast.success(`Started reading ${item.book.title}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update status.");
    }
  };

  const removeItem = async (bookId: string) => {
    try {
      await deleteLibraryItem(bookId);
      setLibraryItems((current) => current.filter((item) => item.bookId !== bookId));
      toast.success("Removed from your library.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove that book.");
    }
  };

  if (!getAuthToken()) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center py-32 space-y-8 bg-card/80 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-border/50">
          <div className="w-32 h-32 bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-secondary/20 relative group">
            <Library className="w-16 h-16 text-secondary opacity-20" />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Sparkles className="w-24 h-24 text-secondary/10" />
            </motion.div>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-serif text-primary/60 italic">Sign in to unlock your archive</h3>
            <p className="text-primary/40 text-lg max-w-md mx-auto">
              Your saved books, reading progress, and completed titles live here once you authenticate.
            </p>
          </div>
          <Link to="/auth" className="inline-flex bg-secondary text-primary px-10 py-5 rounded-2xl font-bold text-lg hover:bg-secondary/90 transition-all hover:scale-105 shadow-xl border-2 border-secondary">
            Enter the Sanctuary
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-primary/10 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-secondary bg-secondary/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-secondary/20">
            <Library className="w-3 h-3" />
            Your Private Grove
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-primary italic">The Keeper&apos;s Archive</h1>
          <p className="text-primary/60 text-lg">Live data from your library, including shelves and progress.</p>
        </div>

        <div className="flex bg-card/80 backdrop-blur-md p-1.5 rounded-2xl border border-border/40 shadow-xl self-start md:self-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground hover:text-primary hover:bg-muted/60"
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {isLoaded && filteredItems.length > 0 ? (
        <div className="space-y-12">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.bookId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="group bg-card rounded-[2.5rem] border-2 border-border/40 p-8 flex flex-col md:flex-row gap-12 hover:shadow-2xl hover:border-secondary/30 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-12 w-8 h-12 bg-secondary/20 rounded-b-lg border-x-2 border-b-2 border-secondary group-hover:bg-secondary group-hover:h-16 transition-all flex items-end justify-center pb-2">
                <Bookmark className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
              </div>

              <div className="w-full md:w-[240px] aspect-[3/4.5] rounded-3xl overflow-hidden flex-shrink-0 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                <img src={item.book.coverImage} alt={item.book.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-grow flex flex-col justify-between py-4 space-y-8">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-4xl font-serif text-primary leading-tight">{item.book.title}</h3>
                    <p className="text-xl font-serif text-secondary italic">by {item.book.author}</p>
                  </div>
                  <p className="text-primary/60 text-lg line-clamp-2 italic">{item.book.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.book.genre.map((genre) => (
                      <span key={genre} className="text-[10px] font-bold uppercase tracking-widest text-primary/40 border border-primary/10 px-3 py-1.5 rounded-full bg-primary/5 group-hover:border-secondary/20 transition-colors">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-12 border-t border-primary/5 pt-8">
                  <div className="flex-grow w-full space-y-4">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-primary/40">
                      <span>Reading Progress</span>
                      <span className="text-secondary">
                        {item.progressPercent}%
                        {item.pagesRead > 0 && (
                          <span className="ml-2 text-primary/30 normal-case font-normal">
                            · {item.pagesRead} pages
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-primary/5 rounded-full overflow-hidden border border-primary/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progressPercent}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-secondary/50 via-secondary to-secondary/80 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 w-full sm:w-auto">
                    {item.status === "wishlist" && (
                      <button
                        onClick={() => void startReading(item)}
                        className="flex-grow sm:flex-grow-0 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xl border-2 border-primary"
                      >
                        <BookOpen className="w-4 h-4 text-secondary" />
                        Start Reading
                      </button>
                    )}
                    {item.status === "reading" && (
                      <button
                        onClick={() => openProgressDialog(item)}
                        className="flex-grow sm:flex-grow-0 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xl border-2 border-primary"
                      >
                        <TrendingUp className="w-4 h-4 text-secondary" />
                        Update Progress
                      </button>
                    )}
                    <button
                      onClick={() => void removeItem(item.bookId)}
                      className="p-4 bg-card border-2 border-border/40 text-destructive/60 hover:text-destructive hover:border-destructive/40 rounded-2xl transition-all shadow-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 space-y-8 bg-card/80 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-border/50">
          <div className="w-32 h-32 bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-secondary/20 relative group">
            <Library className="w-16 h-16 text-secondary opacity-20" />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Sparkles className="w-24 h-24 text-secondary/10" />
            </motion.div>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-serif text-primary/60 italic">This shelf is empty</h3>
            <p className="text-primary/40 text-lg max-w-md mx-auto">Head to Explore to save books into this shelf and see the backend update in real time.</p>
          </div>
          <Link to="/explore" className="inline-flex bg-secondary text-primary px-10 py-5 rounded-2xl font-bold text-lg hover:bg-secondary/90 transition-all hover:scale-105 shadow-xl border-2 border-secondary">
            Go Seeking Stories
          </Link>
        </div>
      )}

      <Dialog
        open={progressDialog !== null}
        onOpenChange={(open) => { if (!open) setProgressDialog(null); }}
      >
        <DialogContent className="bg-card border-2 border-border/60 rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-primary italic">
              Update Progress
            </DialogTitle>
            {progressDialog && (
              <p className="text-sm text-primary/50 font-medium truncate">
                {progressDialog.item.book.title}
              </p>
            )}
          </DialogHeader>

          {progressDialog && (
            <div className="space-y-8 py-2">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/40">
                  Pages Read
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    value={progressDialog.pagesRead}
                    onChange={(e) =>
                      setProgressDialog((prev) =>
                        prev ? { ...prev, pagesRead: e.target.value } : prev,
                      )
                    }
                    placeholder="0"
                    className="w-full bg-background border-2 border-border/60 rounded-xl px-4 py-3 text-primary font-bold text-lg focus:outline-none focus:border-secondary/60 transition-colors"
                  />
                  <span className="text-primary/40 text-sm font-medium whitespace-nowrap">pages</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/40">
                    Progress
                  </label>
                  <span className="text-secondary font-bold text-lg tabular-nums">
                    {progressDialog.progressPercent}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[progressDialog.progressPercent]}
                  onValueChange={([val]) =>
                    setProgressDialog((prev) =>
                      prev ? { ...prev, progressPercent: val } : prev,
                    )
                  }
                  className="[&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-secondary/60 [&_[data-slot=slider-range]]:to-secondary [&_[data-slot=slider-thumb]]:border-secondary"
                />
                <div className="flex justify-between text-xs text-primary/20 font-medium">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {progressDialog.progressPercent >= 100 && (
                <div className="bg-secondary/10 border border-secondary/20 rounded-2xl px-4 py-3 text-sm text-secondary font-medium text-center">
                  This will mark the book as completed.
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <button
              onClick={() => setProgressDialog(null)}
              className="px-6 py-3 rounded-xl border-2 border-border/60 text-primary/60 font-bold text-sm hover:text-primary hover:border-border transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => void saveProgress()}
              disabled={isSaving}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-all border-2 border-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving…" : "Save Progress"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
