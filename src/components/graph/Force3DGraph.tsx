// components/graph/AdvancedKnowledgeGraph.tsx (FINAL WORKING VERSION)
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ZoomIn,
    ZoomOut,
    RefreshCw,
    Network,
    Eye,
    EyeOff,
    Filter,
    Download,
    Users,
    Building,
    Lightbulb,
    MapPin,
    BookOpen,
    X,
    Menu,
    Maximize2,
    Minimize2,
    MousePointer2
} from 'lucide-react';

// Dynamically import without SSR
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
    ssr: false,
});

interface AdvancedGraphProps {
    documentId?: string;
    isGlobal?: boolean;
    height?: number;
    width?: number | string;
    onNodeClick?: (node: any) => void;
}

export default function AdvancedKnowledgeGraph({
    documentId,
    isGlobal = false,
    height = 500,
    width = '100%',
    onNodeClick
}: AdvancedGraphProps) {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [selectedLink, setSelectedLink] = useState<any>(null);
    const [showLabels, setShowLabels] = useState(true);
    const [filters, setFilters] = useState<Record<string, boolean>>({
        person: true,
        organization: true,
        concept: true,
        topic: true,
        location: true
    });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showMobileDetails, setShowMobileDetails] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<any>(null);
    const [hoveredLink, setHoveredLink] = useState<any>(null);

    const graphRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Dynamic height for mobile
    const getGraphHeight = () => {
        if (isFullscreen) return window.innerHeight;
        if (typeof window !== 'undefined' && window.innerWidth < 640) {
            return 400; // Shorter on mobile
        }
        return height;
    };

    // Fetch data from backend
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                let apiUrl = '';
                if (documentId) {
                    apiUrl = `http://localhost:5000/api/graph/document/${documentId}`;
                } else {
                    apiUrl = 'http://localhost:5000/api/graph/user';
                }

                const token = localStorage.getItem('auth_token');
                const response = await fetch(apiUrl, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                const result = await response.json();

                if (result.success) {
                    const transformedData = transformData(result.data);
                    setGraphData(transformedData);
                } else {
                    throw new Error(result.error || 'Failed to load graph');
                }
            } catch (err: any) {
                console.error('Graph error:', err);
                setError(err.message || 'Failed to load graph data');
            } finally {
                setIsLoading(false);
            }
        };

        if (documentId || isGlobal) {
            fetchData();
        }
    }, [documentId, isGlobal]);

    // Handle fullscreen
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isFullscreen]);

    const transformData = (data: any) => {
        if (!data?.nodes) return { nodes: [], links: [] };

        const filteredNodes = data.nodes
            .filter((node: any) => filters[node.type] !== false)
            .map((node: any) => ({
                id: node.id,
                name: node.name,
                type: node.type,
                color: getNodeColor(node.type),
                val: calculateNodeSize(node),
                relevance: node.metadata?.relevance || 5,
                occurrenceCount: node.metadata?.occurrence_count || 1,
                metadata: node.metadata
            }));

        const nodeIds = new Set(filteredNodes.map((n: any) => n.id));
        const filteredLinks = (data.edges || [])
            .filter((edge: any) =>
                nodeIds.has(edge.source_node) && nodeIds.has(edge.target_node)
            )
            .map((edge: any) => ({
                source: edge.source_node,
                target: edge.target_node,
                relationship: edge.relationship,
                color: getLinkColor(edge.relationship),
                weight: edge.weight || 1
            }));

        return { nodes: filteredNodes, links: filteredLinks };
    };

    const calculateNodeSize = (node: any): number => {
        const baseSize = 5;
        const relevance = node.metadata?.relevance || 5;
        const occurrences = node.metadata?.occurrence_count || 1;
        return baseSize + (relevance * 0.5) + Math.log(occurrences + 1) * 2;
    };

    const getNodeColor = (type: string): string => {
        const colors: Record<string, string> = {
            person: '#3B82F6',
            organization: '#10B981',
            concept: '#F59E0B',
            topic: '#8B5CF6',
            location: '#EF4444'
        };
        return colors[type] || '#6B7280';
    };

    const getLinkColor = (relationship: string): string => {
        const colors: Record<string, string> = {
            works_at: '#10B981',
            collaborates_with: '#3B82F6',
            attended: '#F59E0B',
            'enrolled in': '#8B5CF6',
            'faculty member of': '#6366F1',
            'contributes to': '#06B6D4',
            'affiliated with': '#8B5CF6'
        };
        return colors[relationship] || '#9CA3AF';
    };

    const getNodeIcon = (type: string) => {
        const icons: Record<string, any> = {
            person: Users,
            organization: Building,
            concept: Lightbulb,
            topic: BookOpen,
            location: MapPin
        };
        return icons[type] || Network;
    };

    const handleNodeClick = useCallback((node: any) => {
        console.log('Node clicked:', node);
        setSelectedNode(node);
        setSelectedLink(null);
        setShowMobileDetails(true);

        if (graphRef.current && node.x && node.y && node.z) {
            graphRef.current.centerAt(node.x, node.y, node.z, 800);
            graphRef.current.zoom(2, 1000);
        }

        if (onNodeClick) onNodeClick(node);
    }, [onNodeClick]);

    const handleLinkClick = useCallback((link: any) => {
        console.log('Link clicked:', link);
        setSelectedLink(link);
        setSelectedNode(null);
        setShowMobileDetails(true);
    }, []);

    const handleNodeHover = useCallback((node: any) => {
        setHoveredNode(node);
        if (node) {
            setHoveredLink(null);
        }
    }, []);

    const handleLinkHover = useCallback((link: any) => {
        setHoveredLink(link);
        if (link) {
            setHoveredNode(null);
        }
    }, []);

    const handleZoomIn = () => {
        if (graphRef.current && graphRef.current.camera) {
            const camera = graphRef.current.camera();
            if (camera) {
                const newPosition = {
                    x: camera.position.x * 0.8,
                    y: camera.position.y * 0.8,
                    z: camera.position.z * 0.8
                };
                graphRef.current.cameraPosition(
                    newPosition,
                    camera.lookAt || { x: 0, y: 0, z: 0 },
                    500
                );
            }
        }
    };

    const handleZoomOut = () => {
        if (graphRef.current && graphRef.current.camera) {
            const camera = graphRef.current.camera();
            if (camera) {
                const newPosition = {
                    x: camera.position.x * 1.2,
                    y: camera.position.y * 1.2,
                    z: camera.position.z * 1.2
                };
                graphRef.current.cameraPosition(
                    newPosition,
                    camera.lookAt || { x: 0, y: 0, z: 0 },
                    500
                );
            }
        }
    };

    const handleResetView = () => {
        if (graphRef.current) {
            graphRef.current.cameraPosition(
                { x: 0, y: 0, z: 150 },
                { x: 0, y: 0, z: 0 },
                1000
            );
        }
        setSelectedNode(null);
        setSelectedLink(null);
        setHoveredNode(null);
        setHoveredLink(null);
        setShowMobileDetails(false);
    };

    const handleZoomToFit = () => {
        if (graphRef.current) {
            graphRef.current.zoomToFit(1000);
        }
    };

    const toggleFilter = (type: string) => {
        setFilters(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const exportGraphData = () => {
        const dataStr = JSON.stringify(graphData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `knowledge-graph-${Date.now()}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const nodeThreeObject = useCallback((node: any) => {
        const nodeColor = new THREE.Color(node.color);
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: nodeColor,
            transparent: true,
            opacity: 0.9,
            shininess: 30
        });

        const sphere = new THREE.Mesh(geometry, material);
        sphere.scale.setScalar(node.val * 0.15);

        return sphere;
    }, []);

    const linkWidth = useCallback((link: any) => {
        return (link.weight || 1) * 2;
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center rounded-lg bg-gray-900" style={{ height: getGraphHeight() }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <div className="text-gray-300 text-sm sm:text-base">Loading knowledge graph...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center rounded-lg bg-gray-900" style={{ height: getGraphHeight() }}>
                <div className="text-center p-4">
                    <div className="text-red-400 text-base sm:text-xl mb-2">Error Loading Graph</div>
                    <div className="text-gray-400 text-sm sm:text-base max-w-md">{error}</div>
                </div>
            </div>
        );
    }

    if (!graphData.nodes.length) {
        return (
            <div className="flex items-center justify-center rounded-lg bg-gray-900" style={{ height: getGraphHeight() }}>
                <div className="text-center p-4">
                    <div className="text-4xl mb-4">🌌</div>
                    <div className="text-xl mb-2 text-white">No Graph Data</div>
                    <div className="text-gray-400">Upload documents to build your knowledge graph</div>
                </div>
            </div>
        );
    }

    const graphHeight = getGraphHeight();

    return (
        <div
            ref={containerRef}
            className={`relative w-full rounded-lg overflow-hidden bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''
                }`}
            style={{
                height: graphHeight,
                width: isFullscreen ? '100vw' : '100%'
            }}
        >
            {/* Canvas Container - Proper hover events */}
            <div className="absolute inset-0 z-0">
                <ForceGraph3D
                    ref={graphRef}
                    graphData={graphData}
                    nodeLabel={(node: any) => showLabels ? `
                        <div style="
                            background: rgba(15, 23, 42, 0.98);
                            color: white;
                            padding: 14px;
                            border-radius: 10px;
                            max-width: 300px;
                            border: 2px solid ${node.color};
                            backdrop-filter: blur(10px);
                            font-family: system-ui, -apple-system, sans-serif;
                            font-size: 14px;
                            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
                            z-index: 10000;
                            pointer-events: none;
                        ">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: ${node.color}; border: 2px solid white;"></div>
                                <strong style="font-size: 16px; color: white;">${node.name}</strong>
                            </div>
                            <div style="
                                display: inline-block;
                                padding: 4px 12px;
                                background: ${node.color}20;
                                border: 1px solid ${node.color};
                                border-radius: 20px;
                                font-size: 12px;
                                text-transform: capitalize;
                                color: white;
                                font-weight: 500;
                            ">
                                ${node.type}
                            </div>
                            <div style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
                                <div>Relevance: ${node.relevance}/10</div>
                                <div>Occurrences: ${node.occurrenceCount}</div>
                            </div>
                        </div>
                    ` : ''}
                    nodeColor={(node: any) => hoveredNode?.id === node.id ? '#FFFFFF' : node.color}
                    nodeVal={(node: any) => node.val}
                    nodeThreeObject={nodeThreeObject}
                    linkLabel={(link: any) => showLabels ? `
                        <div style="
                            background: rgba(15, 23, 42, 0.98);
                            color: white;
                            padding: 12px;
                            border-radius: 8px;
                            max-width: 280px;
                            border: 2px solid ${link.color};
                            backdrop-filter: blur(10px);
                            font-family: system-ui, -apple-system, sans-serif;
                            font-size: 13px;
                            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
                            z-index: 10000;
                            pointer-events: none;
                        ">
                            <strong style="font-size: 14px; text-transform: capitalize; color: white;">${link.relationship}</strong>
                            ${link.weight ? `<div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Connection Strength: ${link.weight}</div>` : ''}
                            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: #94a3b8;">
                                Click for details
                            </div>
                        </div>
                    ` : ''}
                    linkColor={(link: any) => hoveredLink === link ? '#FFFFFF' : link.color}
                    linkWidth={(link: any) => hoveredLink === link ? 4 : linkWidth(link)}
                    linkDirectionalParticles={hoveredLink ? 3 : 1}
                    linkDirectionalParticleSpeed={0.005}
                    linkDirectionalParticleWidth={2}
                    onNodeClick={handleNodeClick}
                    onLinkClick={handleLinkClick}
                    onNodeHover={handleNodeHover}
                    onLinkHover={handleLinkHover}
                    backgroundColor="#0f172a"
                    enableNodeDrag={true}
                    enableNavigationControls={true}
                    warmupTicks={100}
                    cooldownTicks={0}
                    showNavInfo={false}
                />
            </div>

            {/* OVERLAY LAYER - ALL CONTROLS */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Hover Indicator */}
                {(hoveredNode || hoveredLink) && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-gray-600 pointer-events-none">
                        <div className="flex items-center gap-2 text-sm">
                            <MousePointer2 className="h-4 w-4" />
                            <span>Hovering over: </span>
                            <span className="font-medium">
                                {hoveredNode?.name || (hoveredLink?.relationship ? 'Connection' : '')}
                            </span>
                        </div>
                    </div>
                )}

                {/* Top Controls - Responsive */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex flex-wrap gap-2 pointer-events-auto">
                    {/* Stats Card - Mobile compact */}
                    <div className="bg-black/90 backdrop-blur-sm text-white p-2 sm:p-3 rounded-lg flex items-center gap-2 sm:gap-4 border border-gray-700">
                        <div className="text-center">
                            <div className="text-sm sm:text-lg font-bold text-blue-300">{graphData.nodes.length}</div>
                            <div className="text-xs text-gray-300">Entities</div>
                        </div>
                        <div className="h-6 sm:h-8 w-px bg-gray-700"></div>
                        <div className="text-center">
                            <div className="text-sm sm:text-lg font-bold text-green-300">{graphData.links.length}</div>
                            <div className="text-xs text-gray-300">Connections</div>
                        </div>
                    </div>

                    {/* Control Buttons - Responsive */}
                    <div className="flex gap-1 sm:gap-2 ml-auto">
                        {/* Mobile menu button */}
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="sm:hidden bg-black/80 hover:bg-black/90 text-white border border-gray-700 pointer-events-auto h-8 w-8 p-0"
                        >
                            <Menu className="h-4 w-4" />
                        </Button>

                        {/* Control buttons - hide some on mobile */}
                        <div className="hidden sm:flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleZoomIn}
                                className="bg-black/80 hover:bg-black/90 text-white border border-gray-700 pointer-events-auto"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleZoomOut}
                                className="bg-black/80 hover:bg-black/90 text-white border border-gray-700 pointer-events-auto"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleZoomToFit}
                                className="bg-black/80 hover:bg-black/90 text-white border border-gray-700 pointer-events-auto"
                            >
                                🔍
                            </Button>
                        </div>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleResetView}
                            className="bg-black/80 hover:bg-black/90 text-white border border-gray-700 pointer-events-auto h-8 w-8 sm:h-9 sm:w-auto sm:px-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Reset</span>
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowLabels(!showLabels)}
                            className="bg-black/80 hover:bg-black/90 text-white border border-gray-700 pointer-events-auto h-8 w-8 sm:h-9 sm:w-auto sm:px-2"
                        >
                            {showLabels ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="hidden sm:inline ml-1">Labels</span>
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={toggleFullscreen}
                            className="bg-black/80 hover:bg-black/90 text-white border border-gray-700 pointer-events-auto h-8 w-8 sm:h-9 sm:w-auto sm:px-2"
                        >
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Zoom Controls (bottom left) */}
                <div className="sm:hidden absolute bottom-20 left-2 flex gap-1 pointer-events-auto">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleZoomIn}
                        className="bg-black/80 hover:bg-black/90 text-white border border-gray-700 pointer-events-auto h-8 w-8 p-0"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleZoomOut}
                        className="bg-black/80 hover:bg-black/90 text-white border border-gray-700 pointer-events-auto h-8 w-8 p-0"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleZoomToFit}
                        className="bg-black/80 hover:bg-black/90 text-white border border-gray-700 pointer-events-auto h-8 w-8 p-0"
                    >
                        🔍
                    </Button>
                </div>

                {/* Desktop Sidebar - Filters */}
                <div className="hidden sm:block absolute left-4 top-24 pointer-events-auto">
                    <div className="bg-black/90 backdrop-blur-sm text-white p-4 rounded-lg w-56 border border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                            <Filter className="h-4 w-4" />
                            <div className="text-sm font-medium">Filter Entities</div>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(filters).map(([type, enabled]) => {
                                const Icon = getNodeIcon(type);
                                const nodeCount = graphData.nodes.filter((n: any) => n.type === type).length;

                                return (
                                    <div key={type} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full cursor-pointer"
                                                style={{ backgroundColor: getNodeColor(type) }}
                                                onClick={() => toggleFilter(type)}
                                            />
                                            <Icon className="h-4 w-4" />
                                            <span className="text-sm capitalize">{type}s</span>
                                        </div>
                                        <Badge
                                            variant={enabled ? "default" : "outline"}
                                            className="cursor-pointer bg-gray-800 hover:bg-gray-700"
                                            onClick={() => toggleFilter(type)}
                                        >
                                            {nodeCount}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Mobile Filters Panel */}
                {showMobileFilters && (
                    <div className="sm:hidden absolute left-2 right-2 top-16 bg-black/95 backdrop-blur-sm text-white p-4 rounded-lg border border-gray-700 pointer-events-auto">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <div className="text-sm font-medium">Filters</div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowMobileFilters(false)}
                                className="h-6 w-6 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(filters).map(([type, enabled]) => {
                                const Icon = getNodeIcon(type);
                                const nodeCount = graphData.nodes.filter((n: any) => n.type === type).length;

                                return (
                                    <div
                                        key={type}
                                        className={`flex items-center justify-between p-2 rounded border ${enabled ? 'bg-gray-800 border-gray-600' : 'bg-gray-900/50 border-gray-700'}`}
                                        onClick={() => toggleFilter(type)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: getNodeColor(type) }}
                                            />
                                            <Icon className="h-3.5 w-3.5" />
                                            <span className="text-xs capitalize">{type}</span>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            {nodeCount}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Selected Node/Link Panel - Responsive */}
                {(selectedNode || selectedLink) && !showMobileFilters && (
                    <>
                        {/* Desktop Panel */}
                        <div className="hidden sm:block absolute right-4 top-24 pointer-events-auto">
                            <div className="bg-black/95 backdrop-blur-sm text-white p-4 rounded-lg w-72 border border-gray-700 max-h-[70vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{
                                            backgroundColor: selectedNode?.color || selectedLink?.color
                                        }}></div>
                                        <div className="font-medium">
                                            {selectedNode ? 'Entity Details' : 'Relationship'}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedNode(null);
                                            setSelectedLink(null);
                                        }}
                                        className="h-6 w-6 p-0 hover:bg-white/10 text-gray-300"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {selectedNode && (
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-lg font-bold break-words">{selectedNode.name}</div>
                                            <div className="text-sm text-gray-300 capitalize">{selectedNode.type}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-900/70 p-3 rounded border border-gray-700">
                                                <div className="text-xs text-gray-400">Relevance</div>
                                                <div className="text-lg font-bold text-blue-300">
                                                    {selectedNode.relevance}/10
                                                </div>
                                            </div>
                                            <div className="bg-gray-900/70 p-3 rounded border border-gray-700">
                                                <div className="text-xs text-gray-400">Occurrences</div>
                                                <div className="text-lg font-bold text-green-300">
                                                    {selectedNode.occurrenceCount}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedLink && (
                                    <div className="space-y-3">
                                        <div className="text-lg font-bold capitalize break-words">{selectedLink.relationship}</div>
                                        <div className="bg-gray-900/70 p-3 rounded border border-gray-700">
                                            <div className="text-xs text-gray-400">Connection Strength</div>
                                            <div className="text-xl font-bold text-yellow-300">
                                                {selectedLink.weight?.toFixed(1) || '1.0'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Details Panel */}
                        <div className="sm:hidden absolute bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm text-white p-4 rounded-t-lg border-t border-gray-700 pointer-events-auto max-h-[50vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{
                                        backgroundColor: selectedNode?.color || selectedLink?.color
                                    }}></div>
                                    <div className="font-medium text-sm">
                                        {selectedNode ? 'Entity Details' : 'Relationship'}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedNode(null);
                                        setSelectedLink(null);
                                        setShowMobileDetails(false);
                                    }}
                                    className="h-6 w-6 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {selectedNode && (
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-base font-bold break-words">{selectedNode.name}</div>
                                        <div className="text-xs text-gray-300 capitalize">{selectedNode.type}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-gray-900/70 p-2 rounded border border-gray-700">
                                            <div className="text-xs text-gray-400">Relevance</div>
                                            <div className="text-base font-bold text-blue-300">
                                                {selectedNode.relevance}/10
                                            </div>
                                        </div>
                                        <div className="bg-gray-900/70 p-2 rounded border border-gray-700">
                                            <div className="text-xs text-gray-400">Occurrences</div>
                                            <div className="text-base font-bold text-green-300">
                                                {selectedNode.occurrenceCount}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedLink && (
                                <div className="space-y-3">
                                    <div className="text-base font-bold capitalize break-words">{selectedLink.relationship}</div>
                                    <div className="bg-gray-900/70 p-2 rounded border border-gray-700">
                                        <div className="text-xs text-gray-400">Connection Strength</div>
                                        <div className="text-lg font-bold text-yellow-300">
                                            {selectedLink.weight?.toFixed(1) || '1.0'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Bottom Controls - Responsive */}
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-center pointer-events-auto">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={exportGraphData}
                        className="bg-black/80 hover:bg-black/90 text-white border border-gray-700 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                    >
                        <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Export</span>
                        <span className="sm:hidden">Save</span>
                    </Button>

                    <div className="hidden sm:flex items-center gap-4">
                        <div className="text-sm text-gray-300">
                            {isGlobal ? '🌐 Global Graph' : '📄 Document Graph'}
                        </div>
                        <div className="flex items-center gap-2">
                            {Object.entries(filters).map(([type]) => {
                                const count = graphData.nodes.filter((n: any) => n.type === type).length;
                                return (
                                    <div key={type} className="flex items-center gap-1">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: getNodeColor(type) }}
                                        ></div>
                                        <span className="text-xs text-gray-400">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mobile info */}
                    <div className="sm:hidden text-xs text-gray-300">
                        {graphData.nodes.length} nodes • {graphData.links.length} links
                    </div>
                </div>
            </div>
        </div>
    );
}