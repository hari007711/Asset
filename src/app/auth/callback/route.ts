import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        console.error("Error exchanging code for session:", sessionError);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=auth_failed`
        );
      }
      if (session?.user) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (userError) {
          console.error("Error fetching user role:", userError);
          return NextResponse.redirect(
            `${requestUrl.origin}/login?error=role_fetch_failed`
          );
        }

        const userRole = userData?.role;

        if (userRole === "admin" || userRole === "Admin") {
          return NextResponse.redirect(`${requestUrl.origin}/admin`);
        } else if (userRole === "Employee" || userRole === "employee") {
          return NextResponse.redirect(`${requestUrl.origin}/employee`);
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/`);
        }
      }
    } catch (error) {
      console.error("Error in auth callback:", error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=callback_failed`
      );
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/login`);
}

