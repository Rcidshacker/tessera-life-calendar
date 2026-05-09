import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!envSiteUrl) {
        if (process.env.NODE_ENV === 'development') {
            throw new Error('NEXT_PUBLIC_SITE_URL is not set. Add it to your .env.local file.')
        }
        console.error('NEXT_PUBLIC_SITE_URL is not set in production — falling back to request origin')
    }
    const siteUrl = envSiteUrl ?? new URL(request.url).origin

    if (!code) {
        return NextResponse.redirect(`${siteUrl}?error=missing_code`)
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        console.error('Auth callback error:', error.message)
        return NextResponse.redirect(`${siteUrl}?error=auth_failed`)
    }

    return NextResponse.redirect(siteUrl)
}
