import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowUp, Compass, User, Wand2, BookOpen, Star } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { addBookToLibrary, getAuthToken, oracleChat } from "../lib/api";
import type { RecommendationResult } from "../types/api";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function Oracle() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "I am the Oracle of the stacks. Speak your desires, however abstract or specific, and I shall unearth the perfect volume.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const nextMessages = [...messages, newMsg];
    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    try {
      const history = nextMessages.map((message) => `${message.role}: ${message.content}`);
      const response = await oracleChat(newMsg.content, history);
      setRecommendations(response.recommendations);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: response.reply },
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Oracle is unavailable right now.");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "The Oracle's signal is weak right now. Try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const saveRecommendation = async (bookId: string) => {
    if (!getAuthToken()) {
      toast.info("Sign in to save Oracle picks to your library.");
      return;
    }
    try {
      await addBookToLibrary(bookId, "reading");
      toast.success("Saved to your library.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save this title.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-6 px-6 pb-24 lg:pb-6 relative">
      <div className="fixed inset-0 pointer-events-none opacity-20 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-[150px]" />
      </div>

      <header className="max-w-3xl mx-auto w-full flex justify-between items-center mb-12">
        <Link to="/" className="font-serif font-bold text-xl italic text-primary">BookBlend</Link>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">The Oracle</span>
      </header>

      <main className="max-w-3xl mx-auto w-full flex-grow flex flex-col">
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-primary">
            Consult the <span className="italic text-primary/80">Oracle of Pages</span>
          </h1>
          <p className="text-primary/60 text-lg font-light max-w-xl">
            Describe the texture, the pacing, or the emotional resonance you seek. The Oracle interprets beyond genre.
          </p>
        </div>

        <div className="flex-grow space-y-10 overflow-y-auto pb-8 scrollbar-hide">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-6 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.role === "assistant" ? (
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 shadow-lg mt-1">
                  <Sparkles className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center shrink-0 border border-border/20 mt-1">
                  <User className="w-5 h-5 text-primary/40" />
                </div>
              )}

              <div className={`max-w-[80%] ${msg.role === "user" ? "text-right" : "text-left"}`}>
                <p className={`text-xl leading-relaxed ${msg.role === "assistant" ? "font-serif text-primary" : "font-sans text-foreground/80 font-light"}`}>
                  {msg.content}
                </p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6 items-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 shadow-lg">
                <Compass className="w-5 h-5 animate-spin-slow" />
              </div>
              <div className="flex gap-2">
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-75" />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-150" />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-300" />
              </div>
            </motion.div>
          )}
        </div>

        {recommendations.length > 0 && (
          <section className="mb-6 rounded-3xl border border-border/40 bg-card/70 p-4 sm:p-6">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/50">
              Oracle Matches
            </p>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((item) => (
                <div key={item.book.id} className="flex flex-col gap-3 rounded-2xl border border-border/30 bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-serif text-lg text-primary">{item.book.title}</p>
                    <p className="truncate text-sm text-muted-foreground">by {item.book.author}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-secondary/20 px-3 py-1 text-xs font-bold text-secondary-foreground">
                      <Star className="h-3.5 w-3.5" />
                      {item.score}
                    </div>
                    <button
                      type="button"
                      onClick={() => void saveRecommendation(item.book.id)}
                      className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="sticky bottom-6 mt-4">
          <form onSubmit={handleSend} className="relative group">
            <div className="absolute -inset-2 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors rounded-[3rem]" />
            <div className="relative bg-card rounded-full p-2 flex items-center shadow-ambient border border-border/20 group-hover:border-border/40 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the library a question..."
                className="w-full bg-transparent border-none outline-none px-6 py-4 text-foreground placeholder:text-foreground/30 font-medium"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <ArrowUp className="w-6 h-6" />
              </button>
            </div>
          </form>
          <div className="text-center mt-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/30 flex items-center justify-center gap-2">
              <Wand2 className="w-3 h-3" /> Powered by BookBlend AI
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
