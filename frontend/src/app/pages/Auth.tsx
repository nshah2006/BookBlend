import { useState } from "react";
import { Sparkles, User, ShieldCheck, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { login, signup } from "../lib/api";
import { supabase } from "../lib/supabase";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleOAuth = async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) toast.error(error.message);
  };

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !displayName)) {
      toast.error("Please complete the form first.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isLogin) {
        const response = await login(email, password);
        toast.success(`Welcome back, ${response.user.displayName}.`);
      } else {
        const response = await signup(email, password, displayName);
        toast.success(`Your account is ready, ${response.user.displayName}.`);
      }

      navigate("/mood-input");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to authenticate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-md min-h-[80vh] flex flex-col justify-center items-center">
      <div className="w-full bg-card rounded-[2.5rem] p-8 sm:p-12 shadow-ambient space-y-8 border border-border/40">
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-[2.75rem] font-serif text-primary leading-tight">
            {isLogin ? "Welcome back" : "Define your profile"}
          </h1>
          <p className="text-foreground/70 text-sm md:text-base">
            {isLogin
              ? "Continue your literary journey."
              : "Create an account to begin the curation."}
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50 flex items-center gap-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-muted/60 hover:bg-muted/80 focus:bg-muted rounded-xl p-4 outline-none transition-all placeholder:text-foreground/30 text-foreground text-sm font-medium"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50 flex items-center gap-2">
                Password
              </label>
              {isLogin && <button className="text-[10px] font-bold uppercase tracking-[0.05em] text-primary/70 hover:text-primary transition-colors">Forgot Password?</button>}
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-muted/60 hover:bg-muted/80 focus:bg-muted rounded-xl p-4 outline-none transition-all placeholder:text-foreground/30 text-foreground text-sm font-medium"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50 flex items-center gap-2">
                Reader Pseudonym
              </label>
              <input
                type="text"
                placeholder="The Forest Dweller"
                className="w-full bg-muted/60 hover:bg-muted/80 focus:bg-muted rounded-xl p-4 outline-none transition-all placeholder:text-foreground/30 text-foreground text-sm font-medium"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground p-4 rounded-2xl font-semibold text-sm hover:bg-primary/95 transition-all flex items-center justify-center gap-3 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? "Authenticating..." : isLogin ? "Sign In" : "Sign Up"}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        <div className="flex items-center gap-4 py-2">
          <div className="flex-grow h-px bg-border/40" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/40">Or Continue With</span>
          <div className="flex-grow h-px bg-border/40" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => void handleOAuth("google")}
            className="py-3 bg-card hover:bg-muted/60 rounded-xl border border-border/40 transition-all text-sm font-medium flex items-center justify-center gap-2"
          >
            <div className="w-4 h-4 bg-card rounded-full p-[1px]">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-full h-full opacity-80" />
            </div>
            Google
          </button>
          <button
            onClick={() => void handleOAuth("github")}
            className="py-3 bg-card hover:bg-muted/60 rounded-xl border border-border/40 transition-all text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 opacity-80" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </button>
        </div>

        <p className="text-center text-foreground/60 text-xs font-medium pt-2">
          {isLogin ? "New to the library? " : "Already a voyager? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:underline underline-offset-4 ml-1"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
