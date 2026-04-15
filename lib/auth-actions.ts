"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { nowIso } from "@/lib/domain";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400";

export async function signUp(email: string, password: string, displayName: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Create profile using admin client to bypass RLS
    const adminClient = await createAdminClient();
    await adminClient.from("profiles").upsert({
      id: data.user.id,
      email: email.toLowerCase(),
      display_name: displayName || "BookBlend Reader",
      avatar_url: DEFAULT_AVATAR,
      created_at: nowIso(),
    });
  }

  return { data };
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
