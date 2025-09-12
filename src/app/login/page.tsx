"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const router = useRouter();

  const handleRoleBasedNavigation = useCallback(
    async (userId: string) => {
      try {
        setNavigating(true);
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", userId)
          .single();

        if (userError) throw userError;
        const userRole = userData?.role;
        sessionStorage.setItem("role", userRole);

        if (userRole?.toLowerCase() === "admin") {
          router.push("/admin");
        } else if (userRole?.toLowerCase() === "employee") {
          router.push("/employee");
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error in role-based navigation:", err);
      } finally {
        setNavigating(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (session?.user && !loading) {
        await handleRoleBasedNavigation(session.user.id);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await handleRoleBasedNavigation(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [handleRoleBasedNavigation, loading]);

  const handleGoogleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setNavigating(true);
    } catch (err) {
      console.error("Google login error:", err);
      setLoading(false);
      setNavigating(false);
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (user) {
          const email = user.email ?? "";
          const name = user.user_metadata?.full_name ?? "";
          sessionStorage.setItem("email", email);
          sessionStorage.setItem("name", name);
        }
        await handleRoleBasedNavigation(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, [handleRoleBasedNavigation]);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 px-4">
        <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="w-full md:w-1/2 p-4 sm:p-6 flex justify-center">
            <div className="relative w-full">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-3xl font-bold flex items-center gap-2 mb-4">
                  <span className="text-black flex items-center px-4 py-2 rounded-lg shadow">
                    <Image
                      src="/antstack.svg"
                      alt="AMS"
                      width={40}
                      height={40}
                      className="mr-3"
                    />
                    Asset Management System
                  </span>
                </h1>

                <Button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full max-w-xs rounded-xl bg-blue-500 hover:bg-blue-700 border text-white py-5 sm:py-6 text-base sm:text-lg cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    <>Continue with Google</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-end">
            <Image
              src="/login_img.png"
              alt="Vault"
              width={600}
              height={400}
              className="object-contain"
            />
          </div>
        </div>

        {navigating && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-4 text-white font-medium">Redirecting...</span>
          </div>
        )}
      </div>
    </>
  );
}
