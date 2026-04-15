import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Leaf, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { setAuthToken } from "../lib/api";

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get("code");

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data.session?.access_token) {
            setAuthToken(data.session.access_token);
            toast.success("Welcome to BookBlend!");
            navigate("/mood-input");
            return;
          }
        }

        // Fallback: session may already exist in storage (implicit flow)
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.access_token) {
          setAuthToken(sessionData.session.access_token);
          toast.success("Welcome to BookBlend!");
          navigate("/mood-input");
          return;
        }

        throw new Error("No session found after sign-in.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Authentication failed.");
        navigate("/auth");
      }
    };

    void handleCallback();
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
      <div className="relative">
        <Leaf className="w-16 h-16 text-primary animate-pulse" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sparkles className="w-20 h-20 text-secondary/40" />
        </motion.div>
      </div>
      <p className="mt-6 text-primary/60 font-medium tracking-widest uppercase text-xs">
        Completing sign-in...
      </p>
    </div>
  );
}
