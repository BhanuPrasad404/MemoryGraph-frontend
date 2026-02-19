'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
    FileText,
    Upload,
    MessageSquare,
    Network,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowUpRight,
    Search,
    FileUp,
    BrainCircuit
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { formatBytes, formatDate } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

type DocumentStatus = 'completed' | 'processing' | 'failed';

interface Document {
    id: string;
    filename: string;
    status: DocumentStatus;
    file_size: number;
    created_at: string;
    num_chunks?: number;
    num_nodes?: number;
    num_edges?: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const [hydrated, setHydrated] = useState(false);
    const [tokenLoaded, setTokenLoaded] = useState(false);

    // Ensure client-side hydration first
    useEffect(() => {
        setHydrated(true);
    }, []);

    // Load token safely after hydration
    useEffect(() => {
        if (!hydrated) return;

        const timer = setTimeout(() => {
            const token = apiClient.loadToken();
            console.log('[Dashboard] Token loaded:', token);

            if (!token) {
                window.location.href = '/dashboard';
                return;
            }

            setTokenLoaded(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, [hydrated, router]);

    // Query documents only when token is confirmed
    const {
        data: documentsData,
        isLoading: documentsLoading,
        error,
    } = useQuery({
        queryKey: ['documents'],
        queryFn: () => apiClient.getDocuments(),
        select: (res) => res.data as Document[],
        enabled: tokenLoaded,
    });

    const documents = documentsData ?? [];

    const stats = useMemo(() => ({
        totalDocuments: documents.length,
        completedDocuments: documents.filter(d => d.status === 'completed').length,
        processingDocuments: documents.filter(d => d.status === 'processing').length,
        failedDocuments: documents.filter(d => d.status === 'failed').length,
        totalChunks: documents.reduce((sum, doc) => sum + (doc.num_chunks ?? 0), 0),
        totalNodes: documents.reduce((sum, doc) => sum + (doc.num_nodes ?? 0), 0),
        totalEdges: documents.reduce((sum, doc) => sum + (doc.num_edges ?? 0), 0),
    }), [documents]);

    const getStatusBadge = (status: DocumentStatus) => {
        const variants = {
            completed: {
                bg: 'bg-green-500/10',
                text: 'text-green-400',
                border: 'border-green-500/20',
                icon: CheckCircle,
            },
            processing: {
                bg: 'bg-yellow-500/10',
                text: 'text-yellow-400',
                border: 'border-yellow-500/20',
                icon: Clock,
            },
            failed: {
                bg: 'bg-red-500/10',
                text: 'text-red-400',
                border: 'border-red-500/20',
                icon: AlertCircle,
            },
        };
        const variant = variants[status];
        const Icon = variant.icon;

        return (
            <Badge
                className={`${variant.bg} ${variant.text} ${variant.border} border gap-1 text-xs sm:text-sm`}
                aria-label={`Document status: ${status}`}
            >
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                <span className="hidden xs:inline">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span className="xs:hidden">
                    {status === 'completed' ? 'Done' :
                        status === 'processing' ? 'Proc' : 'Failed'}
                </span>
            </Badge>
        );
    };

    if (!hydrated || !tokenLoaded || documentsLoading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        let message = 'Failed to load documents.';
        let statusCode: number | undefined;

        if ((error as AxiosError).isAxiosError) {
            const axiosError = error as AxiosError<{ message?: string }>;
            statusCode = axiosError.response?.status;
            message = axiosError.response?.data?.message || axiosError.message || message;
        } else if (error instanceof Error) {
            message = error.message;
        }

        return (
            <div className="text-center py-12 sm:py-16 text-red-400 px-4">
                <p className="font-medium text-sm sm:text-base">{message}</p>
                {statusCode && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                        Error code: {statusCode}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8 max-w-full">
                {/* HEADER */}
                <div className="px-2 sm:px-0">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-100">Dashboard</h1>
                    <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
                        Overview of your knowledge base
                    </p>
                </div>

                {/* STATS CARDS - Keep gradients but adjust for dark theme */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {/* Documents Card */}
                    <Card className="border-0 overflow-hidden relative group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                        style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-12 translate-y-12 group-hover:scale-150 transition-transform duration-700 delay-100"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 relative">
                            <CardTitle className="text-xs sm:text-sm font-medium text-white/80">Documents</CardTitle>
                            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 relative">
                            <div className="flex items-baseline gap-2">
                                <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalDocuments}</div>
                                <span className="text-xs text-blue-200">total</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Knowledge Chunks Card */}
                    <Card className="border-0 overflow-hidden relative group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-12 translate-y-12 group-hover:scale-150 transition-transform duration-700 delay-100"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 relative">
                            <CardTitle className="text-xs sm:text-sm font-medium text-white/80">Knowledge Chunks</CardTitle>
                            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 relative">
                            <div className="flex items-baseline gap-2">
                                <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalChunks}</div>
                                <span className="text-xs text-purple-200">chunks</span>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    <span className="text-xs text-white/70">AI ready</span>
                                </div>
                                <span className="text-xs text-white/70">•</span>
                                <span className="text-xs text-white/70">indexed</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Graph Nodes Card */}
                    <Card className="border-0 overflow-hidden relative group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                        style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-12 translate-y-12 group-hover:scale-150 transition-transform duration-700 delay-100"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 relative">
                            <CardTitle className="text-xs sm:text-sm font-medium text-white/80">Graph Nodes</CardTitle>
                            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Network className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 relative">
                            <div className="flex items-baseline gap-2">
                                <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalNodes}</div>
                                <span className="text-xs text-emerald-200">nodes</span>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                <Network className="h-4 w-4 text-white/60" />
                                <span className="text-xs text-white/70">{stats.totalEdges || 0} connections</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Upload Card */}
                    <Card className="border-0 overflow-hidden relative group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 col-span-2 lg:col-span-1"
                        style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' }}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-12 translate-y-12 group-hover:scale-150 transition-transform duration-700 delay-100"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 relative">
                            <CardTitle className="text-xs sm:text-sm font-medium text-white/80">Quick Upload</CardTitle>
                            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 relative">
                            <Link href="/upload">
                                <Button className="w-full bg-white text-orange-600 hover:bg-orange-50 border-0 font-medium shadow-lg transition-all group-hover:scale-105">
                                    <FileUp className="mr-2 h-4 w-4" />
                                    Add Document
                                </Button>
                            </Link>
                            <p className="text-xs text-white/70 text-center mt-3">PDF, DOCX, TXT • Max 50MB</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Documents */}
                <Card className="w-full bg-gray-900 border-gray-800">
                    <CardHeader className="px-3 sm:px-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="min-w-0">
                                <CardTitle className="text-lg sm:text-xl text-gray-100">Recent Documents</CardTitle>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                                    Latest uploaded documents
                                </p>
                            </div>
                            <Link href="/documents" className="w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">View All Documents</span>
                                    <span className="sm:hidden">View All</span>
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6">
                        {documents.length === 0 ? (
                            <div className="text-center py-6 sm:py-8 md:py-12">
                                <BrainCircuit className="mx-auto h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-700 mb-3 sm:mb-4" aria-hidden="true" />
                                <h3 className="text-base sm:text-lg font-medium text-gray-300 mb-1 sm:mb-2">No documents yet</h3>
                                <p className="text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto text-xs sm:text-sm md:text-base px-4">
                                    Upload documents to start building your knowledge graph
                                </p>
                                <Link href="/upload">
                                    <Button className="text-xs sm:text-sm h-9 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                                        <Upload className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                                        Upload First Document
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {documents.slice(0, 5).map((doc: Document) => (
                                    <div
                                        key={doc.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-0">
                                            <div className="p-2 rounded-lg bg-gray-800 flex-shrink-0">
                                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" aria-hidden="true" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3 mb-2">
                                                    <p className="font-medium text-sm sm:text-base text-gray-200 truncate" title={doc.filename}>
                                                        {doc.filename}
                                                    </p>
                                                    <div className="flex-shrink-0">
                                                        {getStatusBadge(doc.status)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                    <span>{formatBytes(doc.file_size)}</span>
                                                    <span className="hidden xs:inline">•</span>
                                                    <span>{formatDate(doc.created_at)}</span>
                                                    {doc.num_chunks !== undefined && (
                                                        <>
                                                            <span className="hidden sm:inline">•</span>
                                                            <span className="sm:inline">{doc.num_chunks} chunks</span>
                                                        </>
                                                    )}
                                                </div>
                                                {doc.status === 'processing' && (
                                                    <div className="mt-2 sm:mt-3">
                                                        <Progress className="h-1.5 sm:h-2 bg-gray-800"
                                                            style={{ '--progress-background': '#3b82f6' } as any} />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Processing document…
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Link href={`/documents/${doc.id}`} className="self-end sm:self-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs sm:text-sm h-7 sm:h-9 w-full sm:w-auto mt-2 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 group"
                                                aria-label="View document details"
                                            >
                                                <span className="sm:inline">View</span>
                                                <ArrowUpRight className="ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {/* Search Documents Card */}
                    <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200 hover:-translate-y-1">
                        <CardHeader className="px-3 sm:px-6">
                            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                                <div className="p-1.5 rounded-lg bg-blue-500/10">
                                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                                </div>
                                <span className="text-gray-200">Search Documents</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6">
                            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 line-clamp-2">
                                Search across all your documents with semantic search
                            </p>
                            <Link href="/documents">
                                <Button
                                    variant="outline"
                                   className="w-full text-xs sm:text-sm h-8 sm:h-10 border-gray-700 text-gray-300 bg-gray-800 hover:border-gray-600 transition-colors"
                                >
                                    <span className="truncate">Go to Search</span>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Chat with AI Card */}
                    <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200 hover:-translate-y-1">
                        <CardHeader className="px-3 sm:px-6">
                            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                                <div className="p-1.5 rounded-lg bg-purple-500/10">
                                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                                </div>
                                <span className="text-gray-200">Chat with AI</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6">
                            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 line-clamp-2">
                                Ask questions about your documents
                            </p>
                            <Link href="/chat">
                                <Button
                                    variant="outline"
                                    className="w-full text-xs sm:text-sm h-8 sm:h-10 border-gray-700 text-gray-300 bg-gray-800 hover:border-gray-600 transition-colors"
                                >
                                    <span className="truncate">Start Chat</span>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* View Graph Card */}
                    <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200 hover:-translate-y-1">
                        <CardHeader className="px-3 sm:px-6">
                            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                                <div className="p-1.5 rounded-lg bg-pink-500/10">
                                    <Network className="h-4 w-4 sm:h-5 sm:w-5 text-pink-400" />
                                </div>
                                <span className="text-gray-200">View Graph</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6">
                            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 line-clamp-2">
                                Visualize knowledge connections
                            </p>
                            <Link href="/graph">
                                <Button
                                    variant="outline"
                                    className="w-full text-xs sm:text-sm h-8 sm:h-10 border-gray-700 text-gray-300 bg-gray-800 hover:border-gray-600 transition-colors"
                                >
                                    <span className="truncate">Explore Graph</span>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-black">
            <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8 max-w-full">
                <div className="px-2 sm:px-0">
                    <Skeleton className="h-6 sm:h-8 w-48 sm:w-64 bg-gray-800" />
                    <Skeleton className="h-4 w-64 sm:w-96 mt-2 bg-gray-800" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="bg-gray-900 border-gray-800">
                            <CardHeader className="pb-2 px-3 sm:px-6">
                                <Skeleton className="h-3 sm:h-4 w-16 sm:w-24 bg-gray-800" />
                            </CardHeader>
                            <CardContent className="px-3 sm:px-6">
                                <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 bg-gray-800" />
                                <Skeleton className="h-3 w-24 sm:w-32 mt-2 bg-gray-800" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="px-3 sm:px-6">
                        <Skeleton className="h-5 sm:h-6 w-32 sm:w-48 bg-gray-800" />
                        <Skeleton className="h-3 sm:h-4 w-48 sm:w-64 mt-2 bg-gray-800" />
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="mb-3 sm:mb-4">
                                <Skeleton className="h-16 sm:h-20 w-full bg-gray-800" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}