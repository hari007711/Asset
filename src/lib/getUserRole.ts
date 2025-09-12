import { supabase } from "@/lib/supabaseClient";

type UserWithId = {
  id: string | number; 
};

export async function getUserRole(user: UserWithId) {
  const { data: userData, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("❌ Role fetch error:", error);
    throw error;
  }

  return userData?.role || null;
}
