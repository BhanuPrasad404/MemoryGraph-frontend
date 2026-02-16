'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Search,
    Filter,
    FileText,
    MoreVertical,
    Eye,
    Download,
    Trash2,
    Edit,
    Upload,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    FileUp,
    RefreshCw
} from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';

interface Document {
    id: string;
    filename: string;
    file_url: string;
    status: 'processing' | 'completed' | 'failed';
    file_size: number;
    created_at: string;
    updated_at: string;
    num_chunks: number;
    num_nodes: number;
    num_edges: number;
}

interface DocumentsResponse {
    success: boolean;
    data: Document[];
    meta: {
        total: number;
        offset: number;
        hasMore: boolean;
    };
}

export default function DocumentsPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const limit = 10;

    // Fetch documents with proper pagination
    const fetchDocuments = useCallback(async (reset = false) => {
        try {
            if (reset) {
                setLoading(true);
                setOffset(0);
            } else if (offset > 0) {
                setRefreshing(true);
            }

            const token = localStorage.getItem('auth_token');
            if (!token) {
                setError('Authentication required. Please login again.');
                setLoading(false);
                router.push('/login');
                return;
            }

            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: reset ? '0' : offset.toString(),
            });

            const response = await fetch(
                `http://localhost:5000/api/documents?${params.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('auth_token');
                    router.push('/login');
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(`Failed to fetch documents: ${response.status}`);
            }

            const data: DocumentsResponse = await response.json();

            if (reset || offset === 0) {
                setDocuments(data.data);
            } else {
                setDocuments(prev => [...prev, ...data.data]);
            }

            setTotal(data.meta.total);
            setHasMore(data.meta.hasMore);
            setError(null);

        } catch (err) {
            console.error('Error fetching documents:', err);
            setError(err instanceof Error ? err.message : 'Failed to load documents');
            toast.error('Error loading documents', {
                description: err instanceof Error ? err.message : 'Unknown error',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [offset, limit, router]);

    // Initial fetch
    useEffect(() => {
        fetchDocuments(true);
    }, [fetchDocuments]);

    // Filter documents locally for search
    const filteredDocuments = documents.filter(doc => {
        if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
        if (searchQuery.trim() === '') return true;

        const query = searchQuery.toLowerCase();
        return doc.filename.toLowerCase().includes(query);
    });

    // Handle load more
    const handleLoadMore = () => {
        const newOffset = offset + limit;
        setOffset(newOffset);
        fetchDocuments(false);
    };

    // Handle delete document
    const handleDelete = async (documentId: string, filename: string) => {
        if (!window.confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(documentId);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(
                `http://localhost:5000/api/documents/${documentId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete document');
            }

            // Remove from local state
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
            setTotal(prev => prev - 1);

            toast.success('Document deleted', {
                description: `"${filename}" has been deleted successfully.`,
            });
        } catch (err) {
            console.error('Error deleting document:', err);
            toast.error('Delete failed', {
                description: err instanceof Error ? err.message : 'Failed to delete document',
            });
        } finally {
            setDeletingId(null);
        }
    };

    // Handle export document
    const handleExport = async (documentId: string, filename: string, format: 'json' | 'text' | 'csv') => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Authentication required');
            }

            toast.info('Preparing export...');

            const response = await fetch(
                `http://localhost:5000/api/documents/${documentId}/export?format=${format}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to export document');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename.replace(/\.[^/.]+$/, '')}-export.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            toast.success('Export successful', {
                description: `Document exported as ${format.toUpperCase()}`,
            });

        } catch (err) {
            console.error('Error exporting document:', err);
            toast.error('Export failed', {
                description: err instanceof Error ? err.message : 'Failed to export document',
            });
        }
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'processing':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs sm:text-sm">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Processing
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs sm:text-sm">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-xs sm:text-sm">
                        {status}
                    </Badge>
                );
        }
    };

    // Calculate stats
    const processingCount = documents.filter(d => d.status === 'processing').length;
    const completedCount = documents.filter(d => d.status === 'completed').length;
    const failedCount = documents.filter(d => d.status === 'failed').length;

    return (
        <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-full">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 bg-white dark:bg-gray-950 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-md shadow-purple-600/20">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text ">
                                    My Documents
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <span>View and manage all your uploaded documents</span>
                                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-50 dark:bg-blue-950 text-xs font-medium text-blue-600 dark:text-blue-400">
                                        {total}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={() => fetchDocuments(true)}
                            disabled={loading || refreshing}
                            className="flex-1 sm:flex-none border-gray-200 dark:border-gray-800 hover:border-blue-600/50 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 group"
                            size="default"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 transition-all duration-300 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                            <span>Refresh</span>
                        </Button>

                        <Button
                            onClick={() => router.push('/upload')}
                            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-purple-600/25 hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
                            size="default"
                        >
                            <Upload className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:translate-y-[-2px]" />
                            <span>Upload</span>
                        </Button>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search documents by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                        />
                    </div>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-auto h-10 sm:h-11">
                                    <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                    <span className="truncate max-w-[120px] sm:max-w-none">
                                        {filterStatus === 'all' ? 'All Status' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setFilterStatus('all')} className="cursor-pointer">
                                    All Documents
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterStatus('processing')} className="cursor-pointer">
                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                    Processing
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterStatus('completed')} className="cursor-pointer">
                                    <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                    Ready
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterStatus('failed')} className="cursor-pointer">
                                    <XCircle className="h-3 w-3 mr-2 text-red-500" />
                                    Failed
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSearchQuery('');
                                setFilterStatus('all');
                            }}
                            disabled={!searchQuery && filterStatus === 'all'}
                            className="h-10 sm:h-11"
                            size="sm"
                        >
                            <span className="hidden sm:inline">Clear</span>
                            <span className="sm:hidden">X</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 md:mb-8">
                {/* Total Documents Card */}
                <Card className="border-0 bg-gradient-to-br from-slate-600 to-slate-800 shadow-md">
                    <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-slate-200 font-medium">Total</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{total}</p>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg">
                                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Processing Card */}
                <Card className="border-0 bg-gradient-to-br from-blue-600 to-blue-800 shadow-md">
                    <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-blue-200 font-medium">Processing</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{processingCount}</p>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-white animate-spin" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Ready/Completed Card */}
                <Card className="border-0 bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-md">
                    <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-emerald-200 font-medium">Ready</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{completedCount}</p>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg">
                                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Failed Card */}
                <Card className="border-0 bg-gradient-to-br from-red-600 to-red-800 shadow-md">
                    <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-red-200 font-medium">Failed</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{failedCount}</p>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg">
                                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive" className="mb-4 md:mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
            )}

            {/* Documents Grid */}
            {loading && offset === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader className="pb-3 px-4 sm:px-6">
                                <Skeleton className="h-5 sm:h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2 mt-2" />
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </CardContent>
                            <CardFooter className="px-4 sm:px-6">
                                <Skeleton className="h-8 sm:h-9 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : filteredDocuments.length === 0 ? (
                <Card className="text-center py-8 sm:py-12">
                    <CardContent className="px-4 sm:px-6">
                        <FileUp className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                        <h3 className="text-base sm:text-lg font-semibold mb-2">No documents found</h3>
                        <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                            {searchQuery || filterStatus !== 'all'
                                ? 'Try adjusting your search or filter'
                                : 'Upload your first document to get started'}
                        </p>
                        <Button onClick={() => router.push('/upload')} size="sm" className="sm:text-base">
                            <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                            Upload Document
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-6 md:mb-8">
                        {filteredDocuments.map((document) => (
                            <Card key={document.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                                <CardHeader className="pb-3 px-4 sm:px-6">
                                    {/* FIXED: Using grid for precise control */}
                                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                                        {/* File name section - Proper truncation with ellipsis */}
                                        <div className="min-w-0 overflow-hidden">
                                            <CardTitle className="text-base sm:text-lg font-semibold">
                                                <div
                                                    className="truncate w-full text-ellipsis overflow-hidden whitespace-nowrap"
                                                    title={document.filename}
                                                >
                                                    {document.filename}
                                                </div>
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {getStatusBadge(document.status)}
                                            </CardDescription>
                                        </div>

                                        {/* Dropdown button - Always visible */}
                                        <div className="flex-shrink-0 relative z-10">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 hover:bg-gray-100 ml-auto"
                                                    >
                                                        <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[200px] sm:w-[220px]">
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/documents/${document.id}`)}
                                                        disabled={document.status !== 'completed'}
                                                        className="cursor-pointer text-sm sm:text-base"
                                                    >
                                                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleExport(document.id, document.filename, 'text')}
                                                        className="cursor-pointer text-sm sm:text-base"
                                                    >
                                                        <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                                        Export as Text
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleExport(document.id, document.filename, 'csv')}
                                                        className="cursor-pointer text-sm sm:text-base"
                                                    >
                                                        <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                                        Export as CSV
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(document.id, document.filename)}
                                                        disabled={deletingId === document.id}
                                                        className="cursor-pointer text-red-600 focus:text-red-600 text-sm sm:text-base"
                                                    >
                                                        {deletingId === document.id ? (
                                                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                                        )}
                                                        {deletingId === document.id ? 'Deleting...' : 'Delete'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow px-4 sm:px-6">
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex items-center justify-between text-xs sm:text-sm">
                                            <span className="text-muted-foreground">Size:</span>
                                            <span className="font-medium truncate pl-2 max-w-[65%]">{formatBytes(document.file_size)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs sm:text-sm">
                                            <span className="text-muted-foreground">Uploaded:</span>
                                            <span className="font-medium truncate pl-2 max-w-[65%]">{formatDate(document.created_at)}</span>
                                        </div>
                                        {document.status === 'completed' && (
                                            <>
                                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                                    <span className="text-muted-foreground">Chunks:</span>
                                                    <span className="font-medium">{document.num_chunks}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                                    <span className="text-muted-foreground">Graph Nodes:</span>
                                                    <span className="font-medium">{document.num_nodes}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                                    <span className="text-muted-foreground">Connections:</span>
                                                    <span className="font-medium">{document.num_edges}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-4 px-4 sm:px-6">
                                    <Button
                                        className="w-full text-sm sm:text-base"
                                        onClick={() => router.push(`/documents/${document.id}`)}
                                        disabled={document.status !== 'completed'}
                                        variant={document.status === 'completed' ? 'default' : 'outline'}
                                        size="sm"
                                    >
                                        {document.status === 'processing' ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 animate-spin" />
                                                <span className="truncate">Processing...</span>
                                            </>
                                        ) : document.status === 'completed' ? (
                                            <>
                                                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                                <span className="truncate">Explore Document</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                                <span className="truncate">Processing Failed</span>
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {/* Load More */}
                    {hasMore && documents.length >= limit && (
                        <div className="text-center mt-6 md:mt-8">
                            <Button
                                onClick={handleLoadMore}
                                variant="outline"
                                disabled={refreshing}
                                className="min-w-[150px] sm:min-w-[200px] text-sm sm:text-base"
                                size="sm"
                            >
                                {refreshing ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    'Load More Documents'
                                )}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}