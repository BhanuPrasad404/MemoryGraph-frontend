'use client';

import { useState, useEffect } from 'react';
import { Save, User, Moon, Sun, Trash2, AlertCircle, Loader2, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface UserProfile {
    name: string;
    email?: string;
    avatar_url?: string;
    created_at?: string;
    updated_at?: string;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState<UserProfile>({ name: '' });
    const [originalProfile, setOriginalProfile] = useState<UserProfile>({ name: '' });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { theme, setTheme } = useTheme();
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');

            if (!token) {
                toast.error("Authentication Required", {
                    description: "Please login to view settings",
                });
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (result.success) {
                setProfile(result.data);
                setOriginalProfile(result.data);
            } else {
                throw new Error(result.error || 'Failed to load profile');
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);

            toast.error('profile_load_failed', {
                description: ` Failed to load profile.`,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!profile.name.trim()) {
            toast.error("Name cannot be empty", {
                description: "Please enter a display name",
            });
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem('auth_token');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: profile.name.trim() }),
            });

            const result = await response.json();

            if (result.success) {
                setProfile(prev => ({ ...prev, ...result.data }));
                setOriginalProfile(prev => ({ ...prev, ...result.data }));

                toast.success("Profile Updated", {
                    description: "Your profile has been updated successfully",
                });

            } else {
                throw new Error(result.error || 'Failed to update profile');
            }
        } catch (error: any) {
            console.error('Error saving profile:', error);
            toast.error("Save Failed", {
                description: error.message || "Could not save profile",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm(
            '⚠️ ARE YOU ABSOLUTELY SURE?\n\n' +
            'This will PERMANENTLY delete:\n' +
            '• All your documents\n' +
            '• All your knowledge graphs\n' +
            '• All your chat history\n' +
            '• Your account profile\n\n' +
            'This action cannot be undone!'
        )) {
            return;
        }

        try {
            setDeleting(true);
            const token = localStorage.getItem('auth_token');

            const response = await fetch(`${API_BASE_URL}/api/user/account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (result.success) {
                // Clear local storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                toast.success("Deletion successfull", {
                    description: "Account deleted successfully",
                });

                // Redirect to home
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                throw new Error(result.error || 'Failed to delete account');
            }
        } catch (error: any) {
            console.error('Error deleting account:', error);
            toast.error("Deletion Failed", {
                description: error.message || "Could not delete account",
            });
        } finally {
            setDeleting(false);
        }
    };

    const hasChanges = profile.name !== originalProfile.name;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Settings</h1>
                    <p className="text-gray-500 mt-2 text-sm sm:text-base">
                        Manage your MemoryGraph AI account and preferences
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
                    <TabsList className="grid grid-cols-3 w-full bg-gray-900 border border-gray-800">
                        <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-gray-800 data-[state=active]:text-blue-400 text-gray-400">
                            <User className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Profile</span>
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-gray-800 data-[state=active]:text-purple-400 text-gray-400">
                            {theme === 'dark' ?
                                <Moon className="h-3 w-3 sm:h-4 sm:w-4" /> :
                                <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
                            }
                            <span className="hidden xs:inline">Appearance</span>
                        </TabsTrigger>
                        <TabsTrigger value="account" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-gray-800 data-[state=active]:text-red-400 text-gray-400">
                            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Account</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <Card className="border-0 bg-gray-900 shadow-xl shadow-purple-500/5">
                            <CardHeader className="px-4 sm:px-6 border-b border-gray-800">
                                <CardTitle className="text-lg sm:text-xl text-gray-100">Your Profile</CardTitle>
                                <CardDescription className="text-xs sm:text-sm text-gray-500">
                                    Update your personal information stored in our database
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 space-y-4 sm:space-y-6 pt-6">
                                {loading ? (
                                    <div className="flex justify-center py-6 sm:py-8">
                                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-400" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-sm sm:text-base text-gray-300">Display Name *</Label>
                                                <Input
                                                    id="name"
                                                    value={profile.name}
                                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                    placeholder="Enter your display name"
                                                    disabled={saving}
                                                    className="text-sm sm:text-base bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-600 focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                                                />
                                                <p className="text-xs sm:text-sm text-gray-500">
                                                    This name will appear throughout the application
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm sm:text-base text-gray-300">Account Information</Label>
                                                <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3 border border-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                                                        <span className="text-xs sm:text-sm text-gray-400">
                                                            Email: <strong className="text-gray-300">{profile.email || 'Not available'}</strong>
                                                        </span>
                                                    </div>
                                                    {profile.created_at && (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                                                            <span className="text-xs sm:text-sm text-gray-400">
                                                                Joined: <strong className="text-gray-300">{formatDate(profile.created_at)}</strong>
                                                            </span>
                                                        </div>
                                                    )}
                                                    {profile.updated_at && profile.updated_at !== profile.created_at && (
                                                        <div className="text-xs sm:text-sm text-gray-500">
                                                            Last updated: {formatDate(profile.updated_at)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                            <CardContent className="px-4 sm:px-6 pt-0 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 border-t border-gray-800 mt-4">
                                <div className="text-xs sm:text-sm text-gray-500">
                                    {hasChanges && "You have unsaved changes"}
                                </div>
                                <Button
                                    onClick={handleSaveProfile}
                                    disabled={!hasChanges || saving || loading}
                                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-purple-600/20"
                                    size="sm"
                                >
                                    {saving ? (
                                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                    )}
                                    Save Changes
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Appearance Tab */}
                    <TabsContent value="appearance">
                        <Card className="border-0 bg-gray-900 shadow-xl shadow-purple-500/5">
                            <CardHeader className="px-4 sm:px-6 border-b border-gray-800">
                                <CardTitle className="text-lg sm:text-xl text-gray-100">Appearance</CardTitle>
                                <CardDescription className="text-xs sm:text-sm text-gray-500">
                                    Customize the look and feel of MemoryGraph AI
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 space-y-4 sm:space-y-6 pt-6">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm sm:text-base text-gray-300">Theme</Label>
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                Choose between light and dark mode
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant={theme === 'light' ? 'default' : 'outline'}
                                                onClick={() => setTheme('light')}
                                                size="sm"
                                                className={`gap-1 sm:gap-2 flex-1 sm:flex-none ${
                                                    theme === 'light' 
                                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0' 
                                                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                }`}
                                            >
                                                <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
                                                Light
                                            </Button>
                                            <Button
                                                variant={theme === 'dark' ? 'default' : 'outline'}
                                                onClick={() => setTheme('dark')}
                                                size="sm"
                                                className={`gap-1 sm:gap-2 flex-1 sm:flex-none ${
                                                    theme === 'dark' 
                                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0' 
                                                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                }`}
                                            >
                                                <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
                                                Dark
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator className="bg-gray-800" />

                                    <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg border border-gray-700">
                                        <p className="text-sm font-medium mb-2 text-gray-300">Theme Preview</p>
                                        <div className={`p-3 sm:p-4 rounded border ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                                <div className="space-y-1">
                                                    <div className={`h-2 sm:h-3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ width: '100px' }}></div>
                                                    <div className={`h-2 sm:h-3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ width: '60px' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                                            The theme applies immediately across all pages
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Account Tab */}
                    <TabsContent value="account">
                        <Card className="border-0 bg-gray-900 shadow-xl shadow-purple-500/5">
                            <CardHeader className="px-4 sm:px-6 border-b border-gray-800">
                                <CardTitle className="text-lg sm:text-xl text-red-400">Account Management</CardTitle>
                                <CardDescription className="text-xs sm:text-sm text-gray-500">
                                    Manage your account settings and data
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 space-y-4 sm:space-y-6 pt-6">
                                <Alert variant="destructive" className="border-red-900 bg-red-950/50">
                                    <AlertCircle className="h-4 w-4 text-red-400" />
                                    <AlertDescription className="space-y-1 sm:space-y-2">
                                        <p className="font-semibold text-sm sm:text-base text-red-300">⚠️ Dangerous Actions</p>
                                        <p className="text-xs sm:text-sm text-red-300/80">Deleting your account is permanent and irreversible. All your data will be permanently removed from our servers.</p>
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-3 sm:space-y-4">
                                    <div className="space-y-2 sm:space-y-3">
                                        <Label className="text-red-400 font-semibold text-sm sm:text-base">Delete Account</Label>
                                        <div className="bg-red-950/20 p-3 sm:p-4 rounded-lg border border-red-900">
                                            <p className="text-xs sm:text-sm text-gray-300 mb-2 sm:mb-3">
                                                This will permanently delete:
                                            </p>
                                            <ul className="text-xs sm:text-sm text-gray-400 space-y-1 list-disc pl-4 sm:pl-5">
                                                <li>All uploaded documents and files</li>
                                                <li>All knowledge graphs and entities</li>
                                                <li>All chat conversations and history</li>
                                                <li>Your user profile and settings</li>
                                            </ul>
                                        </div>

                                        <Button
                                            variant="destructive"
                                            onClick={handleDeleteAccount}
                                            disabled={deleting}
                                            className="w-full mt-3 sm:mt-4 bg-red-950 hover:bg-red-900 text-red-400 hover:text-red-300 border border-red-800"
                                            size="sm"
                                        >
                                            {deleting ? (
                                                <>
                                                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                                                    <span className="text-xs sm:text-sm">Deleting Account...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                                    <span className="text-xs sm:text-sm">Permanently Delete My Account</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}