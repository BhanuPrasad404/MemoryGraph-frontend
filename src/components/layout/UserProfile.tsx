'use client';

import { useState, useRef, useEffect } from 'react';
import {
    User, LogOut, Mail, FileText, Database,
    Network, Settings, ChevronDown, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface UserData {
    email?: string;
    name?: string;
    created_at?: string;
}

interface DocumentStats {
    total: number;
    nodes: number;
    edges: number;
}

export function UserProfile() {
    const [isOpen, setIsOpen] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [stats, setStats] = useState<DocumentStats | null>(null);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        loadUserData();

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadUserData = async () => {
        setLoading(true);
        try {
            // Get user from localStorage (from Supabase auth)
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setUserData({
                        email: user.email,
                        name: user.user_metadata?.full_name || user.email?.split('@')[0],
                        created_at: user.created_at
                    });
                } catch (e) {
                    setUserData({ email: 'user@memorygraph.ai' });
                }
            }

            // Get document stats
            await fetchDocumentStats();
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDocumentStats = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/documents?limit=1&offset=0`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Get TOTAL count from meta, not data length
                    const totalDocs = result.meta?.total || 0;

                    // Calculate total nodes and edges
                    const allDocs = result.data || [];
                    const totalNodes = allDocs.reduce((sum: number, doc: any) => sum + (doc.num_nodes || 0), 0);
                    const totalEdges = allDocs.reduce((sum: number, doc: any) => sum + (doc.num_edges || 0), 0);
                    console.log('all docs :', allDocs)
                    console.log('totalNodes :', totalNodes)
                    console.log('totalEdges :', totalEdges)


                    setStats({
                        total: totalDocs,
                        nodes: totalNodes,
                        edges: totalEdges
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleLogout = async () => {
        try {
            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect to login
            router.push('/login');
            setIsOpen(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getInitials = () => {
        if (userData?.name) {
            return userData.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        return userData?.email?.[0]?.toUpperCase() || 'M';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Button - Clean & Responsive */}
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "relative rounded-full h-10 w-10 md:h-9 md:w-9",
                    "hover:bg-accent transition-all duration-200",
                    isOpen && "bg-accent ring-2 ring-accent"
                )}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User profile"
                aria-expanded={isOpen}
            >
                <div className="relative">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className={cn(
                            "bg-gradient-to-br from-blue-500 to-purple-600",
                            "text-white font-medium"
                        )}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                getInitials()
                            )}
                        </AvatarFallback>
                    </Avatar>
                    <ChevronDown className={cn(
                        "absolute -bottom-1 -right-1 h-3 w-3",
                        "text-muted-foreground bg-background rounded-full",
                        "transition-transform duration-200",
                        isOpen && "rotate-180"
                    )} />
                </div>
            </Button>

            {/* Dropdown Menu - Responsive Design */}
            {isOpen && (
                <div className={cn(
                    "absolute right-0 top-full mt-2",
                    "w-80 sm:w-72 rounded-lg border",
                    "bg-background shadow-lg z-50",
                    "animate-in slide-in-from-top-5 duration-200",
                    "max-h-[calc(100vh-100px)] overflow-y-auto"
                )}>
                    {/* User Info Header */}
                    <div className="p-4 border-b">
                        <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                                    {getInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-sm truncate">
                                        {userData?.name || 'MemoryGraph User'}
                                    </h3>
                                    <Badge variant="secondary" className="text-xs">
                                        AI
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground truncate flex items-center gap-2 mt-1">
                                    <Mail className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{userData?.email || 'user@memorygraph.ai'}</span>
                                </div>
                                {userData?.created_at && (
                                    <div className="text-xs text-muted-foreground mt-2">
                                        Member since {formatDate(userData.created_at)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Knowledge Stats */}
                    <div className="p-4 border-b">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Your Knowledge Base
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <span className="text-xs font-medium">Documents</span>
                                </div>
                                <div className="text-lg font-bold">
                                    {stats?.total || 0}
                                </div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Database className="h-4 w-4 text-green-500" />
                                    <span className="text-xs font-medium">Entities</span>
                                </div>
                                <div className="text-lg font-bold">
                                    {stats?.nodes || 0}
                                </div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Network className="h-4 w-4 text-purple-500" />
                                    <span className="text-xs font-medium">Connections</span>
                                </div>
                                <div className="text-lg font-bold">
                                    {stats?.edges || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-2 border-b">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-sm h-9"
                            onClick={() => {
                                router.push('/settings');
                                setIsOpen(false);
                            }}
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                    </div>

                    {/* Logout */}
                    <div className="p-2">
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start text-sm h-9",
                                "text-red-600 hover:text-red-700",
                                "hover:bg-red-50 dark:hover:bg-red-950/30"
                            )}
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t text-center">
                        <div className="text-xs text-muted-foreground">
                            MemoryGraph AI v1.0
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}