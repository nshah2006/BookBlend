"use client";

import { useState } from "react";
import { Sparkles, User, ShieldCheck, Mail, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !displayName)) {
      toast.error("Please complete the form first.");
      return;
    }

    try {
      setIsSubmitting(true);
      const supabase = createClient();

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw new Error(error.message);
        toast.success(`Welcome back, ${data.user?.user_metadata?.display_name || "Voyager"}.`);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            },
          },
        });

        if (error) throw new Error(error.message);

        // Create profile
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user?.id,
          email: email.toLowerCase(),
          display_name: displayName || "BookBlend Reader",
          avatar_url:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          created_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }

        toast.success(`Your account is ready, ${displayName}.`);
      }

      router.push("/mood-input");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to authenticate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-lg min-h-[80vh] flex flex-col justify-center">
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 bg-tertiary/10 text-tertiary px-6 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] border border-tertiary/20">
          <ShieldCheck className="w-4 h-4" />
          Secure Sanctuary
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-primary">
          {isLogin ? "Welcome Back, Voyager" : "Initialize Your Vibe Profile"}
        </h1>
        <p className="text-primary/60 text-lg">
          {isLogin
            ? "Return to your personal archive of stories."
            : "Create an account so your library, progress, and insights persist."}
        </p>
        {error && (
          <p className="text-destructive text-sm bg-destructive/10 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}
      </div>

      <div className="bg-card rounded-[3rem] p-10 shadow-2xl border-2 border-primary/5 space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary via-tertiary to-primary opacity-50" />

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-2">
              <Mail className="w-3 h-3" />
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@story.com"
              className="w-full bg-primary/5 border-2 border-transparent focus:border-tertiary rounded-2xl p-5 outline-none transition-all placeholder:text-foreground/20 text-foreground font-medium"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Password
            </label>
            <input
              type="password"
              placeholder="At least 8 characters"
              className="w-full bg-primary/5 border-2 border-transparent focus:border-tertiary rounded-2xl p-5 outline-none transition-all placeholder:text-foreground/20 text-foreground font-medium"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                <User className="w-3 h-3" />
                Reader Pseudonym
              </label>
              <input
                type="text"
                placeholder="The Forest Dweller"
                className="w-full bg-primary/5 border-2 border-transparent focus:border-tertiary rounded-2xl p-5 outline-none transition-all placeholder:text-foreground/20 text-foreground font-medium"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground p-6 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-4 shadow-xl border-2 border-secondary/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Blending your access..."
            : isLogin
            ? "Enter the Library"
            : "Create My Account"}
          <Sparkles className="w-5 h-5 text-secondary" />
        </button>

        <p className="text-center text-foreground/40 text-sm font-medium pt-4">
          {isLogin ? "New to the glade?" : "Already a voyager?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-tertiary font-bold ml-2 hover:underline underline-offset-4"
          >
            {isLogin ? "Sign Up Now" : "Login Here"}
          </button>
        </p>
      </div>
    </div>
  );
}
