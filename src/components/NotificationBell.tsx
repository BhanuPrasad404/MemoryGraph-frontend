// frontend/components/NotificationBell.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/client';

// Helper to decode JWT token (like your other components do)
const getUserIdFromToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    // Try different possible token storage keys
    const tokenKeys = [
        'supabase.auth.token',
        'sb-access-token',
        'auth_token',
        'token'
    ];

    for (const key of tokenKeys) {
        const tokenData = localStorage.getItem(key);
        if (tokenData) {
            try {
                // Handle both raw tokens and JSON objects
                let token: string;
                if (tokenData.startsWith('{')) {
                    const parsed = JSON.parse(tokenData);
                    token = parsed.access_token || parsed.token || tokenData;
                } else {
                    token = tokenData;
                }

                // Decode JWT payload (middle part)
                const payloadBase64 = token.split('.')[1];
                if (!payloadBase64) continue;

                const payloadJson = atob(payloadBase64);
                const payload = JSON.parse(payloadJson);

                if (payload.sub) {
                    //console.log(`✅ Found user ID ${payload.sub} from ${key}`);
                    return payload.sub;
                }
            } catch (error) {
                console.warn(`Failed to parse token from ${key}:`, error);
            }
        }
    }

    console.warn(' No valid JWT token found in localStorage');
    return null;
};

export function NotificationBell() {
    const [userId, setUserId] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // 1️⃣ Get userId from JWT token (LIKE YOUR OTHER COMPONENTS)
    useEffect(() => {
        const init = () => {
            const id = getUserIdFromToken();
            if (id) {
                console.log('🎯 NotificationBell using userId:', id);
                setUserId(id);
            } else {
                console.log('⚠️ No userId found, checking in 1s...');
                // Retry after a delay (token might not be loaded yet)
                setTimeout(() => {
                    const retryId = getUserIdFromToken();
                    if (retryId) {
                        console.log('🎯 Retry successful, userId:', retryId);
                        setUserId(retryId);
                    }
                }, 1000);
            }
            setIsLoading(false);
        };

        init();

        // Listen for storage changes (token might be set after login)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key?.includes('token') || e.key?.includes('auth')) {
                console.log('🔄 Auth token changed, re-initializing...');
                init();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also poll for changes (for same-tab auth updates)
        const interval = setInterval(() => {
            if (!userId) {
                const id = getUserIdFromToken();
                if (id && id !== userId) {
                    console.log('🔄 Poll found userId:', id);
                    setUserId(id);
                }
            }
        }, 2000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    //  Fetch notifications when userId changes
    const fetchNotifications = useCallback(async () => {
        if (!userId) {
            console.log(' No userId, skipping fetch');
            return;
        }

        try {
            console.log(` Fetching notifications for user: ${userId}`);

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error(' Error fetching notifications:', error);
                return;
            }

            console.log(` Fetched ${data?.length || 0} notifications`);

            if (data) {
                setNotifications(data);
                const unread = data.filter((n) => !n.read).length;
                setUnreadCount(unread);
                console.log(` ${unread} unread, ${data.length - unread} read`);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        fetchNotifications();

        //  Setup real-time listener - CRITICAL FIX: Use userId in filter
        console.log(` Setting up real-time for user: ${userId}`);

        const channel = supabase
            .channel(`notifications-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`  //  FILTER AT DATABASE LEVEL
                },
                (payload: any) => {
                    console.log(' REAL-TIME INSERT:', payload.new);
                    const newNotif = payload.new;

                    setNotifications((prev) => [newNotif, ...prev.slice(0, 9)]);

                    if (!newNotif.read) {
                        setUnreadCount((prev) => prev + 1);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`  //  FILTER AT DATABASE LEVEL
                },
                (payload: any) => {
                    console.log(' REAL-TIME UPDATE:', payload.new);
                    const updated = payload.new;

                    setNotifications((prev) =>
                        prev.map((n) => (n.id === updated.id ? updated : n))
                    );

                    if (updated.read) {
                        setUnreadCount((prev) => Math.max(0, prev - 1));
                    }
                }
            )
            .subscribe((status) => {
                console.log(` Channel ${userId} status:`, status);
            });

        return () => {
            console.log(`Cleaning up channel for user: ${userId}`);
            supabase.removeChannel(channel);
        };
    }, [userId, fetchNotifications]);

    //  Mark as read
    const markAsRead = async (id: string, e?: React.MouseEvent) => {
        if (!userId) return;

        if (e) {
            e.stopPropagation();
        }

        try {
            // OPTIMISTIC UPDATE - Update UI immediately
            setNotifications((prev) =>
                prev.map((n) => n.id === id ? { ...n, read: true } : n)
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));

            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id)
                .eq('user_id', userId);

            if (error) {
                console.error(' Error marking as read:', error);
                // Rollback if error
                setNotifications((prev) =>
                    prev.map((n) => n.id === id ? { ...n, read: false } : n)
                );
                setUnreadCount((prev) => prev + 1);
            }

        } catch (error) {
            console.error(' Error in markAsRead:', error);
        }
    };

    //  Mark all as read
    const markAllAsRead = async () => {
        if (!userId) return;

        const unreadIds = notifications
            .filter((n) => !n.read)
            .map((n) => n.id);

        if (unreadIds.length === 0) return;

        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .in('id', unreadIds)
                .eq('user_id', userId);

            if (error) {
                console.error(' Error marking all as read:', error);
                return;
            }

            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
            setUnreadCount(0);

        } catch (error) {
            console.error(' Error in markAllAsRead:', error);
        }
    };
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    disabled={isLoading}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                    {isLoading && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80" onInteractOutside={(e) => {
                // Only close if clicking outside the bell button
                const target = e.target as HTMLElement;
                const isBellButton = target.closest('button[data-radix-collection-item]');
                if (!isBellButton) {
                    // Allow closing when clicking elsewhere
                    return;
                }
                e.preventDefault(); // Prevent closing when clicking inside
            }} >
                <div className="flex items-center justify-between px-4 py-2 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="h-auto px-2 py-1 text-xs"
                            >
                                <Check className="h-3 w-3 mr-1" />
                                Mark all read
                            </Button>
                        )}

                    </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            {isLoading ? 'Loading...' : 'No notifications yet'}
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex flex-col items-start p-4 cursor-pointer hover:bg-muted/30 transition-colors ${!notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                    }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id, e);
                                }}
                            >
                                <div className="flex w-full items-start gap-3">
                                    <span className={`text-lg mt-1 ${notification.type === 'success'
                                        ? 'text-green-600'
                                        : notification.type === 'error'
                                            ? 'text-red-600'
                                            : notification.type === 'warning'
                                                ? 'text-amber-600'
                                                : 'text-gray-600'
                                        }`}>
                                        {notification.type === 'success'
                                            ? '✅'
                                            : notification.type === 'error'
                                                ? '❌'
                                                : notification.type === 'warning'
                                                    ? '⚠️'
                                                    : '📌'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="font-medium text-sm truncate">
                                                {notification.title}
                                            </p>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(notification.created_at).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        {!notification.read && (
                                            <div className="mt-2">
                                                <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                    New
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>

            </DropdownMenuContent>
        </DropdownMenu>
    );
}