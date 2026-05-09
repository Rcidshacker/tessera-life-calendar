'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

const brandDotGrid = [
  [1, 0.7, 1, 0.7, 1, 0.7],
  [0.7, 0.3, 0.7, 0.3, 0.7, 0.3],
  [1, 0.7, 1, 0.7, 1, 0.7],
  [0.7, 0.3, 0.7, 0.3, 0.7, 0.3],
  [1, 0.7, 1, 0.7, 1, 0.7],
]

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#07070d]">
      <div className="flex flex-col items-center gap-6">
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
          {brandDotGrid.map((row, ri) =>
            row.map((opacity, ci) => (
              <motion.div
                key={`${ri}-${ci}`}
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: `oklch(0.62 0.24 280 / ${opacity})` }}
                animate={{ opacity: [opacity, opacity * 0.4, opacity] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: (ri + ci) * 0.08,
                  ease: 'easeInOut',
                }}
              />
            ))
          )}
        </div>
        <div className="skeleton-shimmer h-3 w-24 rounded-full" />
      </div>
    </div>
  )
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signInWithGoogle } = useAuth()

  if (loading) return <LoadingScreen />

  if (!user) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#07070d]">
        {/* Animated background orbs */}
        <div className="ts-bg-orb ts-bg-orb-1" />
        <div className="ts-bg-orb ts-bg-orb-2" />
        <div className="ts-bg-orb ts-bg-orb-3" />

        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center gap-10 px-6 text-center"
        >
          {/* Brand mark — mini life grid */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-1.5"
            style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}
          >
            {brandDotGrid.map((row, ri) =>
              row.map((opacity, ci) => (
                <motion.div
                  key={`${ri}-${ci}`}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: `oklch(0.62 0.24 280 / ${opacity})` }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.15 + (ri * 6 + ci) * 0.025,
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              ))
            )}
          </motion.div>

          {/* Wordmark */}
          <div className="space-y-3">
            <h1
              className="font-lora text-[72px] font-semibold leading-none tracking-tight text-white"
              style={{ letterSpacing: '-0.02em' }}
            >
              Tessera
            </h1>
            <p className="text-base font-light tracking-wide" style={{ color: 'oklch(0.58 0 0)' }}>
              Your life, one week at a time
            </p>
          </div>

          {/* Sign-in */}
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Button
                onClick={signInWithGoogle}
                className="relative h-12 min-w-[200px] gap-3 overflow-hidden rounded-xl border px-8 text-sm font-medium"
                style={{
                  background: 'oklch(1 0 0 / 0.06)',
                  borderColor: 'oklch(1 0 0 / 0.12)',
                  color: 'oklch(0.92 0 0)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>
            </motion.div>

            <p className="text-xs" style={{ color: 'oklch(0.4 0 0)' }}>
              Your data stays private. No ads, ever.
            </p>
          </motion.div>
        </motion.div>

        {/* Bottom tagline */}
        <motion.div
          className="absolute bottom-8 left-0 right-0 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-xs tracking-widest uppercase" style={{ color: 'oklch(0.3 0 0)' }}>
            Life in Dots 2.0
          </p>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
