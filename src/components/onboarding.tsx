'use client';

// Life in Dots 2.0 - Onboarding Component

import { useState } from 'react';
import { UserSettings } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calendar, Sparkles, Heart, Target } from 'lucide-react';

interface OnboardingProps {
  onComplete: (settings: UserSettings) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [lifeExpectancy, setLifeExpectancy] = useState(80);

  const handleComplete = () => {
    onComplete({
      name,
      birthdate,
      lifeExpectancy,
      theme: 'dark',
      showWorldEvents: true,
      gridZoom: 1,
    });
  };

  const steps = [
    // Welcome step
    <div key="welcome" className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to Life in Dots
        </h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Visualize your entire life as a grid of weeks. Track your journey, 
          reflect on your experiences, and gain insights from AI.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        <div className="text-center p-3">
          <div className="w-12 h-12 mx-auto rounded-lg bg-purple-500/20 flex items-center justify-center mb-2">
            <Calendar className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-sm text-gray-300">Track Weeks</span>
        </div>
        <div className="text-center p-3">
          <div className="w-12 h-12 mx-auto rounded-lg bg-pink-500/20 flex items-center justify-center mb-2">
            <Heart className="w-6 h-6 text-pink-400" />
          </div>
          <span className="text-sm text-gray-300">Record Moods</span>
        </div>
        <div className="text-center p-3">
          <div className="w-12 h-12 mx-auto rounded-lg bg-blue-500/20 flex items-center justify-center mb-2">
            <Target className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-sm text-gray-300">Set Goals</span>
        </div>
      </div>
      <Button
        onClick={() => setStep(1)}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg"
      >
        Get Started
      </Button>
    </div>,

    // Name step
    <div key="name" className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          What should we call you?
        </h2>
        <p className="text-gray-400">
          This helps personalize your experience
        </p>
      </div>
      <div className="max-w-sm mx-auto space-y-4">
        <div>
          <Label htmlFor="name" className="text-gray-300">
            Your Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="bg-gray-800 border-gray-700 text-white mt-2"
          />
        </div>
      </div>
      <div className="flex justify-center gap-4">
        <Button
          variant="ghost"
          onClick={() => setStep(0)}
          className="text-gray-400"
        >
          Back
        </Button>
        <Button
          onClick={() => setStep(2)}
          disabled={!name.trim()}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Continue
        </Button>
      </div>
    </div>,

    // Birthdate step
    <div key="birthdate" className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          When were you born?
        </h2>
        <p className="text-gray-400">
          This helps us calculate your life grid
        </p>
      </div>
      <div className="max-w-sm mx-auto space-y-4">
        <div>
          <Label htmlFor="birthdate" className="text-gray-300">
            Birth Date
          </Label>
          <Input
            id="birthdate"
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white mt-2"
          />
        </div>
      </div>
      <div className="flex justify-center gap-4">
        <Button
          variant="ghost"
          onClick={() => setStep(1)}
          className="text-gray-400"
        >
          Back
        </Button>
        <Button
          onClick={() => setStep(3)}
          disabled={!birthdate}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Continue
        </Button>
      </div>
    </div>,

    // Life expectancy step
    <div key="lifeExpectancy" className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          How long do you expect to live?
        </h2>
        <p className="text-gray-400">
          This determines the total size of your life grid
        </p>
      </div>
      <div className="max-w-md mx-auto space-y-4">
        <div className="text-center">
          <span className="text-5xl font-bold text-white">{lifeExpectancy}</span>
          <span className="text-xl text-gray-400 ml-2">years</span>
        </div>
        <Slider
          value={[lifeExpectancy]}
          onValueChange={([value]) => setLifeExpectancy(value)}
          min={50}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-400">
          <span>50 years</span>
          <span>100 years</span>
        </div>
        <div className="text-center text-sm text-gray-500 mt-4">
          Average life expectancy varies by country. 
          <br />
          Global average: ~73 years
        </div>
      </div>
      <div className="flex justify-center gap-4">
        <Button
          variant="ghost"
          onClick={() => setStep(2)}
          className="text-gray-400"
        >
          Back
        </Button>
        <Button
          onClick={handleComplete}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Start My Journey
        </Button>
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-xl max-w-xl w-full">
        <CardContent className="p-8">
          {steps[step]}
        </CardContent>
      </Card>
    </div>
  );
}
