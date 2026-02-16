// frontend/components/Header.tsx
'use client';

import { Search, Bell, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from './UserProfile';
import { NotificationBell } from '@/components/NotificationBell';
import ClientOnly from '@/components/ClientOnly';

interface HeaderProps {
    onMenuClick?: () => void;
    sidebarOpen?: boolean;
}

export function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = searchQuery.trim().toLowerCase();
        if (!q) return;

        if (['documents', 'docs', 'pdf', 'files'].some(k => q.includes(k))) {
            router.push('/documents'); return;
        }
        if (['chat', 'ask', 'query'].some(k => q.includes(k))) {
            router.push('/chat'); return;
        }
        if (['graph', 'graphs', 'memory', 'knowledge'].some(k => q.includes(k))) {
            router.push('/graph'); return;
        }

        if (['setting', 'settings'].some(k => q.includes(k))) {
            router.push('/settings'); return;
        }
        if (['help', 'help center'].some(k => q.includes(k))) {
            router.push('/help'); return;
        }

        router.push(`/documents?search=${encodeURIComponent(q)}`);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="flex h-16 items-center px-4">
                {/* Mobile Menu */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden mr-2"
                    onClick={onMenuClick}
                >
                    {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>

                {/* Search */}
                <div className="flex-1">
                    <form onSubmit={handleSearch} className="relative max-w-2xl">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search documents..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>

                {/* Notifications & User */}
                <div className="flex items-center gap-2">
                    <ClientOnly>
                        <NotificationBell />
                    </ClientOnly>
                    <UserProfile />
                </div>
            </div>
        </header>
    );
}
