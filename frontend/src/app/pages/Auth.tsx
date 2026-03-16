import { useState } from "react";
import { Sparkles, User, ShieldCheck, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { login, signup } from "../lib/api";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
      </div>

      <div className="bg-white rounded-[3rem] p-10 shadow-2xl border-2 border-primary/5 space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary via-tertiary to-primary opacity-50" />

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-primary/40 flex items-center gap-2">
              <Mail className="w-3 h-3" />
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@story.com"
              className="w-full bg-primary/5 border-2 border-transparent focus:border-tertiary rounded-2xl p-5 outline-none transition-all placeholder:text-primary/20 text-primary font-medium"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-primary/40 flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Password
            </label>
            <input
              type="password"
              placeholder="At least 8 characters"
              className="w-full bg-primary/5 border-2 border-transparent focus:border-tertiary rounded-2xl p-5 outline-none transition-all placeholder:text-primary/20 text-primary font-medium"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary/40 flex items-center gap-2">
                <User className="w-3 h-3" />
                Reader Pseudonym
              </label>
              <input
                type="text"
                placeholder="The Forest Dweller"
                className="w-full bg-primary/5 border-2 border-transparent focus:border-tertiary rounded-2xl p-5 outline-none transition-all placeholder:text-primary/20 text-primary font-medium"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-primary text-white p-6 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-4 shadow-xl border-2 border-secondary/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Blending your access..." : isLogin ? "Enter the Library" : "Create My Account"}
          <Sparkles className="w-5 h-5 text-secondary" />
        </button>

        <div className="flex items-center gap-4 py-4">
          <div className="flex-grow h-px bg-primary/10" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/30">Or Connect With</span>
          <div className="flex-grow h-px bg-primary/10" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => toast.info("OAuth is planned, but not wired yet.")}
            className="p-4 bg-primary/5 hover:bg-primary/10 rounded-2xl border border-primary/5 transition-all text-sm font-bold flex items-center justify-center gap-3"
          >
            <div className="w-5 h-5 bg-white rounded-full p-1">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-full h-full" />
            </div>
            Google
          </button>
          <button
            onClick={() => toast.info("Social sign-in can be added once OAuth is configured.")}
            className="p-4 bg-primary/5 hover:bg-primary/10 rounded-2xl border border-primary/5 transition-all text-sm font-bold flex items-center justify-center gap-3"
          >
            <Mail className="w-5 h-5 text-tertiary" />
            Social
          </button>
        </div>

        <p className="text-center text-primary/40 text-sm font-medium pt-4">
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
