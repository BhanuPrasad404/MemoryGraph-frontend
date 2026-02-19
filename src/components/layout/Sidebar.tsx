'use client';

import {
    Home,
    FileText,
    MessageSquare,
    Network,
    Upload,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    PlusCircle,
    HelpCircle,
    Bell,
    Search,
    Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/client';

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/documents', icon: FileText, label: 'Documents' },
    { href: '/chat', icon: MessageSquare, label: 'Chat' },
    { href: '/graph', icon: Network, label: 'Graph' },
    { href: '/upload', icon: Upload, label: 'Upload' },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                setUser({
                    ...user,
                    ...profile
                });
            }
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const getInitials = () => {
        if (user?.full_name) {
            return user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return user?.email?.charAt(0).toUpperCase() || 'U';
    };

    return (
        <aside className={cn(
            'flex h-screen flex-col border-r border-gray-800 bg-black transition-all duration-300',
            collapsed ? 'w-20' : 'w-72'
        )}>
            {/* Header */}
            <div className={cn(
                'flex items-center h-16 border-b border-gray-800',
                collapsed ? 'justify-center px-2' : 'justify-between px-4'
            )}>
                {!collapsed && (
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Brain className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-100 group-hover:text-white transition-colors">MemoryGraph</span>
                    </Link>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Quick Upload */}
            <div className={cn('py-4', collapsed ? 'px-2' : 'px-4')}>
                <Link href="/upload">
                    <Button
                        className={cn(
                            'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-purple-600/30 transition-all duration-200',
                            collapsed ? 'h-10 w-10 p-0 rounded-lg mx-auto' : 'w-full h-10 justify-start gap-2 px-3 rounded-lg'
                        )}
                    >
                        <PlusCircle className={cn('h-4 w-4', collapsed && 'm-0')} />
                        {!collapsed && 'Upload Document'}
                    </Button>
                </Link>
            </div>

            {/* Navigation - Takes ALL remaining space */}
            <nav className="flex-1 overflow-y-auto px-3 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                <div className={cn(
                    'flex flex-col',
                    collapsed ? 'items-center space-y-2' : 'space-y-1'
                )}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className="w-full">
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        collapsed
                                            ? 'h-10 w-10 p-0 rounded-lg'
                                            : 'w-full h-10 justify-start gap-3 px-3 rounded-lg',
                                        isActive
                                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                    )}
                                >
                                    <item.icon className={cn(
                                        'h-4 w-4 shrink-0',
                                        isActive ? 'text-blue-400' : 'text-gray-400'
                                    )} />
                                    {!collapsed && (
                                        <span className={cn(
                                            'text-sm',
                                            isActive ? 'font-medium text-white' : 'text-gray-300'
                                        )}>
                                            {item.label}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Bottom Section - Fixed at bottom */}
            <div className={cn(
                'border-t border-gray-800 p-3',
                collapsed ? 'flex flex-col items-center space-y-2' : 'space-y-1'
            )}>
                {/* Settings */}
                <Link href="/settings" className="w-full">
                    <Button
                        variant="ghost"
                        className={cn(
                            collapsed
                                ? 'h-10 w-10 p-0 rounded-lg'
                                : 'w-full h-10 justify-start gap-3 px-3 rounded-lg',
                            'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        )}
                    >
                        <Settings className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-sm text-gray-300">Settings</span>}
                    </Button>
                </Link>

                {/* Help Center */}
                <Link href="/help" className="w-full">
                    <Button
                        variant="ghost"
                        className={cn(
                            collapsed
                                ? 'h-10 w-10 p-0 rounded-lg'
                                : 'w-full h-10 justify-start gap-3 px-3 rounded-lg',
                            'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        )}
                    >
                        <HelpCircle className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-sm text-gray-300">Help Center</span>}
                    </Button>
                </Link>

                {/* Logout */}
                <Button
                    variant="ghost"
                    className={cn(
                        collapsed
                            ? 'h-10 w-10 p-0 rounded-lg'
                            : 'w-full h-10 justify-start gap-3 px-3 rounded-lg',
                        'text-red-400 hover:text-red-300 hover:bg-red-950/50'
                    )}
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="text-sm">Logout</span>}
                </Button>
            </div>

            {/* Version */}
            {!collapsed && (
                <div className="px-4 py-2 border-t border-gray-800">
                    <p className="text-xs text-gray-600">Version 2.0.1</p>
                </div>
            )}
        </aside>
    );
}