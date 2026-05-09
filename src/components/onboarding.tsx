'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserSettings } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Calendar, Sparkles, Heart, Target, ArrowRight, ArrowLeft } from 'lucide-react'

interface OnboardingProps {
  onComplete: (settings: UserSettings) => void
}

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [lifeExpectancy, setLifeExpectancy] = useState(80)

  const totalSteps = 4

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const handleComplete = () => {
    onComplete({ name, birthdate, lifeExpectancy, theme: 'dark', showWorldEvents: true, gridZoom: 1 })
  }

  const steps = [
    /* Step 0 — Welcome */
    <div key="welcome" className="flex flex-col items-center gap-8 text-center">
      <motion.div
        className="relative"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, oklch(0.62 0.24 280 / 0.3), oklch(0.78 0.16 75 / 0.2))',
            border: '1px solid oklch(0.62 0.24 280 / 0.3)',
            boxShadow: '0 0 40px oklch(0.62 0.24 280 / 0.2)',
          }}
        >
          <Sparkles className="w-9 h-9" style={{ color: 'oklch(0.72 0.18 280)' }} />
        </div>
      </motion.div>

      <div className="space-y-3">
        <h1 className="font-lora text-4xl font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>
          Welcome to Tessera
        </h1>
        <p className="text-base leading-relaxed max-w-xs" style={{ color: 'oklch(0.58 0 0)' }}>
          Visualize your entire life as a grid of weeks. Journal, reflect, and discover patterns across your journey.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {[
          { icon: Calendar, label: 'Track Weeks', color: 'oklch(0.62 0.24 280)' },
          { icon: Heart, label: 'Log Moods', color: 'oklch(0.65 0.22 0)' },
          { icon: Target, label: 'Set Goals', color: 'oklch(0.78 0.16 75)' },
        ].map(({ icon: Icon, label, color }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-xl p-3"
            style={{ background: 'oklch(1 0 0 / 0.04)', border: '1px solid oklch(1 0 0 / 0.07)' }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
            <span className="text-xs font-medium" style={{ color: 'oklch(0.65 0 0)' }}>{label}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={() => go(1)}
        className="h-11 gap-2 rounded-xl px-8 text-sm font-medium"
        style={{
          background: 'oklch(0.62 0.24 280)',
          color: 'white',
          border: 'none',
        }}
      >
        Get Started
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>,

    /* Step 1 — Name */
    <div key="name" className="flex flex-col gap-8">
      <div className="text-center space-y-2">
        <h2 className="font-lora text-3xl font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>
          What's your name?
        </h2>
        <p className="text-sm" style={{ color: 'oklch(0.55 0 0)' }}>
          Personalizes your experience
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium" style={{ color: 'oklch(0.65 0 0)' }}>Your Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && go(2)}
          placeholder="Enter your name…"
          autoFocus
          className="h-11 rounded-xl border text-white placeholder:text-[oklch(0.38_0_0)] text-base"
          style={{ background: 'oklch(1 0 0 / 0.05)', borderColor: 'oklch(1 0 0 / 0.1)' }}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => go(0)} className="flex-1 h-11 gap-2 rounded-xl"
          style={{ color: 'oklch(0.5 0 0)' }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={() => go(2)}
          disabled={!name.trim()}
          className="flex-1 h-11 rounded-xl text-sm font-medium"
          style={{ background: 'oklch(0.62 0.24 280)', color: 'white', border: 'none' }}
        >
          Continue <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>,

    /* Step 2 — Birthdate */
    <div key="birthdate" className="flex flex-col gap-8">
      <div className="text-center space-y-2">
        <h2 className="font-lora text-3xl font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>
          When were you born?
        </h2>
        <p className="text-sm" style={{ color: 'oklch(0.55 0 0)' }}>
          Calculates your life grid
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium" style={{ color: 'oklch(0.65 0 0)' }}>Birth Date</Label>
        <Input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="h-11 rounded-xl border text-white text-base"
          style={{ background: 'oklch(1 0 0 / 0.05)', borderColor: 'oklch(1 0 0 / 0.1)', colorScheme: 'dark' }}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => go(1)} className="flex-1 h-11 gap-2 rounded-xl"
          style={{ color: 'oklch(0.5 0 0)' }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={() => go(3)}
          disabled={!birthdate}
          className="flex-1 h-11 rounded-xl text-sm font-medium"
          style={{ background: 'oklch(0.62 0.24 280)', color: 'white', border: 'none' }}
        >
          Continue <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>,

    /* Step 3 — Life Expectancy */
    <div key="life" className="flex flex-col gap-8">
      <div className="text-center space-y-2">
        <h2 className="font-lora text-3xl font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>
          How long do you plan to live?
        </h2>
        <p className="text-sm" style={{ color: 'oklch(0.55 0 0)' }}>
          Determines the total size of your grid
        </p>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <motion.span
            key={lifeExpectancy}
            initial={{ scale: 0.85, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-lora text-7xl font-semibold text-white tabular-nums"
            style={{ letterSpacing: '-0.04em' }}
          >
            {lifeExpectancy}
          </motion.span>
          <span className="text-2xl ml-2 font-light" style={{ color: 'oklch(0.45 0 0)' }}>years</span>
        </div>
        <Slider
          value={[lifeExpectancy]}
          onValueChange={([v]) => setLifeExpectancy(v)}
          min={50}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs" style={{ color: 'oklch(0.42 0 0)' }}>
          <span>50 years</span>
          <span>Global avg ~73</span>
          <span>100 years</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => go(2)} className="flex-1 h-11 gap-2 rounded-xl"
          style={{ color: 'oklch(0.5 0 0)' }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={handleComplete}
          className="flex-1 h-11 rounded-xl text-sm font-medium"
          style={{ background: 'oklch(0.62 0.24 280)', color: 'white', border: 'none' }}
        >
          Start My Journey ✦
        </Button>
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'oklch(0.085 0.008 270)' }}>
      {/* Subtle orbs */}
      <div className="ts-bg-orb ts-bg-orb-1 opacity-50" />
      <div className="ts-bg-orb ts-bg-orb-2 opacity-50" />

      <div
        className="relative z-10 w-full max-w-sm rounded-2xl p-8 space-y-8"
        style={{
          background: 'oklch(1 0 0 / 0.04)',
          border: '1px solid oklch(1 0 0 / 0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === step ? 28 : 8,
                backgroundColor: i === step
                  ? 'oklch(0.62 0.24 280)'
                  : i < step
                    ? 'oklch(0.62 0.24 280 / 0.4)'
                    : 'oklch(1 0 0 / 0.1)',
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="h-2 rounded-full"
              style={{ minWidth: 8 }}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
