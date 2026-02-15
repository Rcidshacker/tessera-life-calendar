'use client'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

export function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, loading, signInWithGoogle } = useAuth()

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-bold">Welcome to Tessera</h1>
                    <Button onClick={signInWithGoogle}>Continue with Google</Button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
