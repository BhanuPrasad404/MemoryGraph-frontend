'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import DocumentSearch from '@/components/document/DocumentSearch';
import dynamic from 'next/dynamic';

// Create the dynamic import for the graph (add after your other imports)
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
    ssr: false,
});

import {
    ArrowLeft,
    FileText,
    BrainCircuit,
    Network,
    MessageSquare,
    Download,
    Trash2,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    Search,
    BarChart3,
    FileUp,
    Zap
} from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import ChatInterface from '../chat/ChatInterface';
import AdvancedKnowledgeGraph from '../graph/Force3DGraph';

interface DocumentDetail {
    id: string;
    filename: string;
    file_url: string;
    status: string;
    file_size: number;
    created_at: string;
    updated_at: string;
    num_chunks: number;
    num_nodes: number;
    num_edges: number;
}

export default function DocumentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const documentId = params.id as string;
    const [documentGraphData, setDocumentGraphData] = useState<any>(null);
    const [graphLoading, setGraphLoading] = useState(false);
    const [document, setDocument] = useState<DocumentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [deleting, setDeleting] = useState(false);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Fetch document details
    const fetchDocument = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Authentication required. Please login again.');
            }

            const response = await fetch(
                `${API_BASE_URL}/api/documents/${documentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Document not found');
                }
                throw new Error(`Failed to fetch document: ${response.status}`);
            }

            const data = await response.json();
            setDocument(data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching document:', err);
            setError(err instanceof Error ? err.message : 'Failed to load document');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchDocument();
        }
    }, [documentId]);

    const fetchDocumentGraph = async () => {
        try {
            setGraphLoading(true);
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(
                `${API_BASE_URL}/api/graph/document/${documentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch graph: ${response.status}`);
            }

            const data = await response.json();
            setDocumentGraphData(data);
        } catch (err) {
            console.error('Error fetching graph:', err);
            toast.error('Failed to load graph', {
                description: err instanceof Error ? err.message : 'Please try again',
            });
            setDocumentGraphData({ nodes: [], edges: [] });
        } finally {
            setGraphLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'graph' && documentId && !documentGraphData) {
            fetchDocumentGraph();
        }
    }, [activeTab, documentId]);

    // Handle delete
    const handleDelete = async () => {
        if (!document || !confirm(`Are you sure you want to delete "${document.filename}"? This action cannot be undone.`)) {
            return;
        }

        setDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(
                `${API_BASE_URL}/api/documents/${documentId}`,
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
            toast.success('Document deleted', {
                description: `"${document.filename}" has been deleted successfully.`,
            });

            router.push('/dashboard');
        } catch (err) {
            console.error('Error deleting document:', err);
            toast.error('Delete failed', {
                description: err instanceof Error ? err.message : 'Failed to delete document',
            });
        } finally {
            setDeleting(false);
        }
    };

    // Get status badge - Vercel dark theme style
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'processing':
                return (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs sm:text-sm">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        <span className="hidden sm:inline">Processing</span>
                        <span className="sm:hidden">Proc.</span>
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs sm:text-sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Ready</span>
                        <span className="sm:hidden">Ready</span>
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs sm:text-sm">
                        <XCircle className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Failed</span>
                        <span className="sm:hidden">Failed</span>
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20 text-xs sm:text-sm">
                        {status}
                    </Badge>
                );
        }
    };

    const getNodeColor = (type: string): string => {
        const colors: Record<string, string> = {
            person: '#2196F3',
            organization: '#4CAF50',
            concept: '#FF9800',
            topic: '#9C27B0',
            location: '#F44336'
        };
        return colors[type] || '#607D8B';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <div className="container mx-auto p-4 sm:p-6">
                    <Button
                        variant="ghost"
                        className="mb-4 sm:mb-6 text-gray-400 hover:text-white hover:bg-gray-800"
                        onClick={() => router.back()}
                        size="sm"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                        <span className="hidden sm:inline">Back to Documents</span>
                        <span className="sm:hidden">Back</span>
                    </Button>
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader className="px-4 sm:px-6">
                            <Skeleton className="h-6 sm:h-8 w-3/4 bg-gray-800" />
                            <Skeleton className="h-3 sm:h-4 w-1/2 mt-2 bg-gray-800" />
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6">
                            <div className="space-y-3 sm:space-y-4">
                                <Skeleton className="h-4 w-full bg-gray-800" />
                                <Skeleton className="h-4 w-2/3 bg-gray-800" />
                                <Skeleton className="h-4 w-1/2 bg-gray-800" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error || !document) {
        return (
            <div className="min-h-screen bg-black">
                <div className="container mx-auto p-4 sm:p-6">
                    <Button
                        variant="ghost"
                        className="mb-4 sm:mb-6 text-gray-400 hover:text-white hover:bg-gray-800"
                        onClick={() => router.push('/documents')}
                        size="sm"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                        <span className="hidden sm:inline">Back to Documents</span>
                        <span className="sm:hidden">Back</span>
                    </Button>
                    <Alert variant="destructive" className="bg-red-950/50 border-red-800 text-red-400 text-sm sm:text-base">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {error || 'Document not found'}
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-full">
                {/* Back button and header */}
                <div className="mb-4 sm:mb-6">
                    <Button
                        variant="ghost"
                        className="mb-3 sm:mb-4 px-2 sm:px-4 text-gray-400 hover:text-white hover:bg-gray-800"
                        onClick={() => router.push('/documents')}
                        size="sm"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Back to Documents</span>
                        <span className="sm:hidden">Back</span>
                    </Button>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-100 truncate" title={document.filename}>
                                    {document.filename}
                                </h1>
                                {getStatusBadge(document.status)}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 truncate" title={`Document ID: ${document.id}`}>
                                ID: {document.id}
                            </p>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                            <Button
                                variant="outline"
                                onClick={() => window.open(document.file_url, '_blank')}
                                disabled={document.status !== 'completed'}
                                size="sm"
                                className="flex-1 sm:flex-none border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-700"
                            >
                                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">View Original</span>
                                <span className="sm:hidden">View</span>
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleting}
                                size="sm"
                                className="flex-1 sm:flex-none bg-red-950/50 hover:bg-red-900 text-red-400 hover:text-red-300 border border-red-800"
                            >
                                {deleting ? (
                                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                                ) : (
                                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                )}
                                <span className="hidden sm:inline">Delete</span>
                                <span className="sm:hidden">Del</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Document Info - Mobile responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                    {/* Document Info Card */}
                    <Card className="bg-gray-900 border-gray-800 shadow-lg">
                        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 border-b border-gray-800">
                            <CardTitle className="text-xs sm:text-sm font-semibold text-gray-300 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-400" />
                                Document Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 pt-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                                    <span className="text-sm text-gray-500">File Size</span>
                                    <span className="text-sm font-medium text-gray-300">{formatBytes(document.file_size)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                                    <span className="text-sm text-gray-500">Uploaded</span>
                                    <span className="text-sm font-medium text-gray-300">{formatDate(document.created_at)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-500">Last Updated</span>
                                    <span className="text-sm font-medium text-gray-300">{formatDate(document.updated_at)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Processing Stats Card */}
                    <Card className="bg-gray-900 border-gray-800 shadow-lg">
                        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 border-b border-gray-800">
                            <CardTitle className="text-xs sm:text-sm font-semibold text-gray-300 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                Processing Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 pt-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs sm:text-sm p-3 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-md">
                                    <span className="text-gray-300 font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-emerald-400" />
                                        <span>Content Chunks</span>
                                    </span>
                                    <span className="font-bold text-emerald-400 bg-gray-800 px-2 py-1 rounded-md shadow-sm">{document.num_chunks}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs sm:text-sm p-3 bg-amber-500/10 border-l-4 border-amber-500 rounded-md">
                                    <span className="text-gray-300 font-medium flex items-center gap-2">
                                        <BrainCircuit className="h-4 w-4 text-amber-400" />
                                        <span>Knowledge Nodes</span>
                                    </span>
                                    <span className="font-bold text-amber-400 bg-gray-800 px-2 py-1 rounded-md shadow-sm">{document.num_nodes}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs sm:text-sm p-3 bg-rose-500/10 border-l-4 border-rose-500 rounded-md">
                                    <span className="text-gray-300 font-medium flex items-center gap-2">
                                        <Network className="h-4 w-4 text-rose-400" />
                                        <span>Connections</span>
                                    </span>
                                    <span className="font-bold text-rose-400 bg-gray-800 px-2 py-1 rounded-md shadow-sm">{document.num_edges}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="sm:col-span-2 lg:col-span-1 bg-gray-900 border-gray-800 shadow-lg">
                        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 border-b border-gray-800">
                            <CardTitle className="text-xs sm:text-sm font-semibold text-gray-300 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-400" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 py-4">
                            <div className="space-y-3">
                                <Button
                                    className="w-full justify-start text-sm bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 hover:border-blue-600/30 font-medium py-2"
                                    onClick={() => setActiveTab('search')}
                                    disabled={document.status !== 'completed'}
                                >
                                    <Search className="h-4 w-4 mr-2" />
                                    Search Content
                                </Button>
                                <Button
                                    className="w-full justify-start text-sm bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-600/20 hover:border-purple-600/30 font-medium py-2"
                                    onClick={() => setActiveTab('graph')}
                                    disabled={document.status !== 'completed'}
                                >
                                    <Network className="h-4 w-4 mr-2" />
                                    View Knowledge Graph
                                </Button>
                                <Button
                                    className="w-full justify-start text-sm bg-pink-600/10 hover:bg-pink-600/20 text-pink-400 border border-pink-600/20 hover:border-pink-600/30 font-medium py-2"
                                    onClick={() => setActiveTab('chat')}
                                    disabled={document.status !== 'completed'}
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Chat with Document
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 mb-4 sm:mb-6 w-full overflow-x-auto bg-gray-900 border border-gray-800">
                        <TabsTrigger value="overview" className="text-xs sm:text-sm data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400">
                            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                            <span className="hidden xs:inline">Overview</span>
                            <span className="xs:hidden">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="search" disabled={document.status !== 'completed'} className="text-xs sm:text-sm data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400 disabled:text-gray-600">
                            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                            <span className="hidden xs:inline">Search</span>
                            <span className="xs:hidden">Search</span>
                        </TabsTrigger>
                        <TabsTrigger value="graph" disabled={document.status !== 'completed'} className="text-xs sm:text-sm data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400 disabled:text-gray-600">
                            <Network className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                            <span className="hidden xs:inline">Graph</span>
                            <span className="xs:hidden">Graph</span>
                        </TabsTrigger>
                        <TabsTrigger value="chat" disabled={document.status !== 'completed'} className="text-xs sm:text-sm data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400 disabled:text-gray-600">
                            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                            <span className="hidden xs:inline">Chat</span>
                            <span className="xs:hidden">Chat</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview">
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader className="px-3 sm:px-6">
                                <CardTitle className="text-lg sm:text-xl text-gray-100">Document Overview</CardTitle>
                                <CardDescription className="text-sm sm:text-base text-gray-500">
                                    Complete details and processing information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-3 sm:px-6">
                                {document.status === 'processing' ? (
                                    <div className="text-center py-8 sm:py-12">
                                        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 animate-spin text-blue-400" />
                                        <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-200">Processing Document</h3>
                                        <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                                            Your document is being processed. This may take a few minutes depending on the file size.
                                        </p>
                                        <Button onClick={fetchDocument} size="sm" className="sm:text-base bg-blue-600 hover:bg-blue-700 text-white border-0">
                                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 animate-spin" />
                                            Refresh Status
                                        </Button>
                                    </div>
                                ) : document.status === 'failed' ? (
                                    <div className="text-center py-8 sm:py-12">
                                        <XCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-red-400" />
                                        <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-200">Processing Failed</h3>
                                        <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                                            There was an error processing your document. Please try uploading it again.
                                        </p>
                                        <Button onClick={() => router.push('/upload')} size="sm" className="sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                                            <FileUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                            Upload Again
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 sm:space-y-6">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-200">Document Content</h3>
                                            <p className="text-gray-400 text-sm sm:text-base">
                                                This document has been successfully processed into {document.num_chunks} content chunks.
                                                The AI has extracted {document.num_nodes} key concepts and identified {document.num_edges} relationships
                                                between them to build your knowledge graph.
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-200">What You Can Do</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                                <Card className="bg-gray-800 border-gray-700">
                                                    <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                                                        <div className="text-center">
                                                            <Search className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-blue-400" />
                                                            <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base text-gray-200">Search Content</h4>
                                                            <p className="text-xs sm:text-sm text-gray-500">
                                                                Search through all extracted content chunks
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card className="bg-gray-800 border-gray-700">
                                                    <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                                                        <div className="text-center">
                                                            <Network className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-green-400" />
                                                            <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base text-gray-200">Explore Graph</h4>
                                                            <p className="text-xs sm:text-sm text-gray-500">
                                                                Visualize the knowledge graph and connections
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card className="bg-gray-800 border-gray-700">
                                                    <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                                                        <div className="text-center">
                                                            <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-purple-400" />
                                                            <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base text-gray-200">Chat with AI</h4>
                                                            <p className="text-xs sm:text-sm text-gray-500">
                                                                Ask questions about this specific document
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Search Tab */}
                    <TabsContent value="search">
                        <DocumentSearch
                            documentId={documentId}
                            documentName={document.filename}
                        />
                    </TabsContent>

                    {/* Graph Tab */}
                    <TabsContent value="graph">
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader className="px-3 sm:px-6">
                                <CardTitle className="text-lg sm:text-xl text-gray-100">Document Knowledge Graph</CardTitle>
                                <CardDescription className="text-sm sm:text-base text-gray-500">
                                    Visualize entities and connections within this document
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0" style={{ height: '500px', minHeight: '300px' }}>
                                <AdvancedKnowledgeGraph
                                    documentId={documentId}
                                    height={500}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Chat Tab */}
                    <TabsContent value="chat">
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader className="px-3 sm:px-6">
                                <CardTitle className="text-lg sm:text-xl text-gray-100">Chat with Document</CardTitle>
                                <CardDescription className="text-sm sm:text-base text-gray-500 truncate">
                                    Ask questions about "{document.filename}"
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {document.status === 'completed' ? (
                                    // ACTUAL CHAT INTERFACE
                                    <div className="h-[500px] min-h-[300px]">
                                        <ChatInterface
                                            documentId={document.id}
                                            documentName={document.filename}
                                        />
                                    </div>
                                ) : document.status === 'processing' ? (
                                    <div className="text-center py-8 sm:py-12">
                                        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 animate-spin text-blue-400" />
                                        <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-200">Document Still Processing</h3>
                                        <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                                            Your document is being processed. Chat will be available once processing is complete.
                                        </p>
                                        <Button onClick={fetchDocument} size="sm" className="sm:text-base bg-blue-600 hover:bg-blue-700 text-white border-0">
                                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 animate-spin" />
                                            Refresh Status
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 sm:py-12">
                                        <XCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-red-400" />
                                        <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-200">Processing Failed</h3>
                                        <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                                            This document failed to process. Please delete and upload again.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}