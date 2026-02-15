'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export function LogoutButton() {
    const { signOut, user } = useAuth();

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={signOut}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="sr-only">Sign out</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Sign out {user?.email && `(${user.email})`}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
