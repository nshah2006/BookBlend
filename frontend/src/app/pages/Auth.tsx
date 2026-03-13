import { useState } from "react";
import { Sparkles, User, ShieldCheck, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

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
          {isLogin ? "Return to your personal archive of stories." : "Join our collective of mindful readers."}
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
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-primary/40 flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-primary/5 border-2 border-transparent focus:border-tertiary rounded-2xl p-5 outline-none transition-all placeholder:text-primary/20 text-primary font-medium"
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
              />
            </div>
          )}
        </div>

        <button 
          onClick={() => navigate("/mood-input")}
          className="w-full bg-primary text-white p-6 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-4 shadow-xl border-2 border-secondary/20 active:scale-95"
        >
          {isLogin ? "Enter the Library" : "Create My Account"}
          <Sparkles className="w-5 h-5 text-secondary" />
        </button>

        <div className="flex items-center gap-4 py-4">
          <div className="flex-grow h-px bg-primary/10" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/30">Or Connect With</span>
          <div className="flex-grow h-px bg-primary/10" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="p-4 bg-primary/5 hover:bg-primary/10 rounded-2xl border border-primary/5 transition-all text-sm font-bold flex items-center justify-center gap-3">
            <div className="w-5 h-5 bg-white rounded-full p-1"><img src="https://www.google.com/favicon.ico" alt="Google" className="w-full h-full" /></div>
            Google
          </button>
          <button className="p-4 bg-primary/5 hover:bg-primary/10 rounded-2xl border border-primary/5 transition-all text-sm font-bold flex items-center justify-center gap-3">
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
