import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (e) {
              console.warn("Could not set cookie on server", e)
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: "", ...options })
            } catch (e) {
              console.warn("Could not remove cookie on server", e)
            }
          },
        },
      }
    )

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.exchangeCodeForSession(code)

      if (sessionError) {
        console.error("Error exchanging code for session:", sessionError)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`)
      }

      if (session?.user) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (userError) {
          console.error("Error fetching user role:", userError)
          return NextResponse.redirect(`${requestUrl.origin}/login?error=role_fetch_failed`)
        }

        const userRole = userData?.role

        if (userRole?.toLowerCase() === "admin") {
          return NextResponse.redirect(`${requestUrl.origin}/admin`)
        } else if (userRole?.toLowerCase() === "employee") {
          return NextResponse.redirect(`${requestUrl.origin}/employee`)
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/`)
        }
      }
    } catch (error) {
      console.error("Error in auth callback:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=callback_failed`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
