'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UserSettings } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Settings, 
  User, 
  Calendar, 
  Palette, 
  Download, 
  Upload, 
  Trash2,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

interface SettingsPanelProps {
  settings: UserSettings;
  name: string;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onExport: () => void;
  onImport: (data: string) => void;
  onReset: () => void;
}

export default function SettingsPanel({
  settings,
  name,
  onUpdateSettings,
  onExport,
  onImport,
  onReset,
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempName, setTempName] = useState(name || '');

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onImport(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Profile Section */}
      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Name</Label>
            <div className="flex gap-2">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Your name"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
              <Button
                onClick={() => onUpdateSettings({ name: tempName } as any)}
                variant="outline"
                className="border-slate-600 hover:bg-slate-700"
              >
                Save
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Birthdate</Label>
            <Input
              type="date"
              value={settings.birthdate}
              onChange={(e) => onUpdateSettings({ birthdate: e.target.value })}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Life Expectancy (years)</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.lifeExpectancy]}
                onValueChange={([value]) => onUpdateSettings({ lifeExpectancy: value })}
                min={50}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-white font-medium w-12 text-right">
                {settings.lifeExpectancy}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-violet-400" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(value: 'light' | 'dark' | 'system') => 
                onUpdateSettings({ theme: value })
              }
            >
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="dark" className="text-white focus:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="light" className="text-white focus:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="system" className="text-white focus:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Grid Zoom</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.gridZoom * 100]}
                onValueChange={([value]) => onUpdateSettings({ gridZoom: value / 100 })}
                min={50}
                max={150}
                step={10}
                className="flex-1"
              />
              <span className="text-white font-medium w-12 text-right">
                {Math.round(settings.gridZoom * 100)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm text-slate-300">Show World Events</Label>
            <Switch
              checked={settings.showWorldEvents}
              onCheckedChange={(checked) => onUpdateSettings({ showWorldEvents: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-400" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={onExport}
            variant="outline"
            className="w-full border-slate-600 hover:bg-slate-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full border-slate-600 hover:bg-slate-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  This will permanently delete all your life data, journal entries, 
                  milestones, and settings. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-800 border-slate-600 text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onReset}
                  className="bg-rose-500 hover:bg-rose-600"
                >
                  Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="pt-4">
          <div className="text-center text-xs text-slate-500">
            <p>Life in Dots 2.0</p>
            <p className="mt-1">AI-Powered Life Intelligence Platform</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
