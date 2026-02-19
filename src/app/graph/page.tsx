// app/graph/page.tsx
'use client';

import { useState, useEffect } from 'react';
import AdvancedKnowledgeGraph from '@/components/graph/Force3DGraph';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, Globe, Database, Filter, Download, RefreshCw, FileType, Clock, FileText, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GraphStats {
    total_documents: number;
    total_nodes: number;
    total_edges: number;
    documents: Array<{
        id: string;
        filename: string;
        status: string;
        created_at: string;
        num_nodes?: number;
        num_edges?: number;
    }>;
}

interface RecentDocument {
    id: string;
    filename: string;
    status: string;
    created_at: string;
    num_nodes?: number;
    num_edges?: number;
}

export default function GlobalGraphPage() {
    const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
    const [filterType, setFilterType] = useState<string>('all');
    const [graphStats, setGraphStats] = useState<GraphStats | null>(null);
    const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState<Document[]>([]);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';



    useEffect(() => {
        fetchGraphData();
    }, []);

    const fetchGraphData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');

            const docsResponse = await fetch(`${API_URL}/api/documents`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (docsResponse.ok) {
                const docsResult = await docsResponse.json();
                if (docsResult.success) {
                    const allDocs = docsResult.data || [];
                    setDocuments(allDocs);

                    const totalNodes = allDocs.reduce((sum: any, doc: { num_nodes: any; }) => sum + (doc.num_nodes || 0), 0);
                    const totalEdges = allDocs.reduce((sum: any, doc: { num_edges: any; }) => sum + (doc.num_edges || 0), 0);
                    const totalDocuments = docsResult.meta?.total || allDocs.length;

                    setGraphStats({
                        total_documents: totalDocuments,
                        total_nodes: totalNodes,
                        total_edges: totalEdges,
                        documents: allDocs,
                    });

                    const recent = allDocs
                        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 3);
                    setRecentDocs(recent);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchGraphData();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-full">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg shadow-purple-500/20">
                            <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-100">Global Knowledge Graph</h1>
                            <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
                                Visualize all entities and relationships across your entire knowledge base
                            </p>
                        </div>
                    </div>

                    {/* Stats - REAL DATA */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        {/* Total Documents Card */}
                        <Card className="border-0 bg-gradient-to-br from-blue-950 to-blue-900 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-200">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                                            {loading ? '...' : (graphStats?.total_documents || 0)}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-400 mt-1">Total Documents</div>
                                    </div>
                                    <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                        <Database className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Entities Card */}
                        <Card className="border-0 bg-gradient-to-br from-green-950 to-green-900 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-200">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl sm:text-3xl font-bold text-green-400">
                                            {loading ? '...' : (graphStats?.total_nodes || 0)}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-400 mt-1">Total Entities</div>
                                    </div>
                                    <div className="p-2.5 bg-green-500/10 rounded-xl">
                                        <Network className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Relationships Card */}
                        <Card className="border-0 bg-gradient-to-br from-purple-950 to-purple-900 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-200">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl sm:text-3xl font-bold text-purple-400">
                                            {loading ? '...' : (graphStats?.total_edges || 0)}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-400 mt-1">Relationships</div>
                                    </div>
                                    <div className="p-2.5 bg-purple-500/10 rounded-xl">
                                        <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Document Types Card */}
                        <Card className="border-0 bg-gradient-to-br from-amber-950 to-amber-900 shadow-lg shadow-amber-500/10 hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-200">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl sm:text-3xl font-bold text-amber-400">
                                            {loading ? '...' : (graphStats?.documents?.length || 0)}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-400 mt-1">Document Types</div>
                                    </div>
                                    <div className="p-2.5 bg-amber-500/10 rounded-xl">
                                        <FileType className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content */}
                <Card className="mb-4 sm:mb-6 border-0 bg-gray-900 shadow-2xl shadow-purple-500/5 overflow-hidden">
                    {/* Top Gradient Bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                    <CardHeader className="px-3 sm:px-6 border-b border-gray-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="min-w-0">
                                <CardTitle className="text-lg sm:text-xl text-gray-100">Knowledge Network</CardTitle>
                                <CardDescription className="text-sm sm:text-base truncate text-gray-500">
                                    Interactive 3D visualization of all your document relationships
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRefresh}
                                    className="text-xs sm:text-sm flex-1 sm:flex-none border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                                >
                                    <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Refresh</span>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0" style={{ height: '400px', minHeight: '300px' }}>
                        {/* Global Graph - NO documentId means it fetches ALL data */}
                        <AdvancedKnowledgeGraph
                            isGlobal={true}
                            height={400}
                        />
                    </CardContent>
                </Card>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {/* How to Use Card */}
                    <Card className="border-0 bg-gray-900 shadow-lg hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-200">
                        <CardHeader className="px-3 sm:px-6 border-b border-gray-800">
                            <CardTitle className="text-base sm:text-lg text-gray-200">How to Use</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 space-y-2 sm:space-y-3 py-4">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded flex-shrink-0">
                                    <Network className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-medium text-sm sm:text-base text-gray-200">Click Nodes</div>
                                    <div className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                                        Click any node to see detailed information
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-green-500/10 rounded flex-shrink-0">
                                    <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-medium text-sm sm:text-base text-gray-200">Filter Entities</div>
                                    <div className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                                        Use left panel to filter by entity type
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-purple-500/10 rounded flex-shrink-0">
                                    <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-medium text-sm sm:text-base text-gray-200">Explore Connections</div>
                                    <div className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                                        Drag to rotate, scroll to zoom, drag nodes
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity - REAL DATA */}
                    <Card className="border-0 bg-gray-900 shadow-lg hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-200">
                        <CardHeader className="px-3 sm:px-6 border-b border-gray-800">
                            <CardTitle className="text-base sm:text-lg text-gray-200">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 py-4">
                            {loading ? (
                                <div className="animate-pulse space-y-2 sm:space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-2 sm:gap-3">
                                            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-800 rounded"></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="h-3 sm:h-4 bg-gray-800 rounded w-3/4 mb-1 sm:mb-2"></div>
                                                <div className="h-2.5 sm:h-3 bg-gray-800 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : recentDocs.length === 0 ? (
                                <div className="text-center py-4 sm:py-6 md:py-8">
                                    <Database className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto text-gray-700 mb-2 sm:mb-4" />
                                    <div className="text-gray-400 text-sm sm:text-base">No recent activity</div>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Upload documents to see activity</p>
                                </div>
                            ) : (
                                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                                    {recentDocs.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-start gap-2 sm:gap-3 p-2 hover:bg-gray-800 rounded transition-colors"
                                        >
                                            <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded flex-shrink-0">
                                                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate text-gray-200" title={doc.filename}>
                                                    {doc.filename}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-gray-500 mt-0.5 sm:mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-600" />
                                                        <span className="truncate text-gray-500">{formatDate(doc.created_at)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Network className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-600" />
                                                        <span className="text-gray-500">{doc.num_nodes || 0} nodes</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500" />
                                                        <span className="truncate text-gray-500">{doc.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions Card */}
                    <Card className="border-0 bg-gray-900 shadow-lg hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-200">
                        <CardHeader className="px-3 sm:px-6 border-b border-gray-800">
                            <CardTitle className="text-base sm:text-lg text-gray-200">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 space-y-2 sm:space-y-3 py-4">
                            <Button
                                className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                                variant="outline"
                            >
                                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                                <span className="truncate">Export Graph Data</span>
                            </Button>
                            <Button
                                className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                                variant="outline"
                            >
                                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                                <span className="truncate">Advanced Filters</span>
                            </Button>
                            <Button
                                className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                                variant="outline"
                            >
                                <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                                <span className="truncate">View Source Documents</span>
                            </Button>
                            <Button
                                className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                                variant="outline"
                            >
                                <Network className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                                <span className="truncate">Graph Analytics</span>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}