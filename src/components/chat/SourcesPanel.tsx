// components/chat/SourcesPanel.tsx
'use client';

import { ChatSource } from '@/types/chat';
import { FileText, ChevronRight, ExternalLink, BarChart, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useState, useRef } from 'react';

interface SourcesPanelProps {
    sources: ChatSource[];
    documentId?: any;
    documentName?: String;
    isMobile?: boolean;
}

export default function SourcesPanel({ sources, documentId, documentName, isMobile = false }: SourcesPanelProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [expandedDocuments, setExpandedDocuments] = useState<Record<string, boolean>>({});

    // ONLY ADD THIS FUNCTION - Cleans weird spacing
    const cleanText = (text: string) => {
        if (!text) return '';

        // Fix 1: Remove spaces between characters but keep normal spaces
        let cleaned = text.replace(/(\w)\s+(?=\w)/g, '$1');

        // Fix 2: Still has weird spacing? Try this pattern
        cleaned = cleaned.replace(/([a-zA-Z0-9])\s+([a-zA-Z0-9])/g, '$1$2');

        // Fix 3: Normalize multiple spaces to single space
        cleaned = cleaned.replace(/\s+/g, ' ');

        // Fix 4: Trim and return
        return cleaned.trim();
    };

    const groupedByDocument = sources.reduce((acc, source) => {
        const docId = source.document_id;
        if (!acc[docId]) {
            acc[docId] = {
                filename: source.metadata.filename,
                sources: []
            };
        }
        acc[docId].sources.push(source);
        return acc;
    }, {} as Record<string, { filename: string; sources: ChatSource[] }>);

    const sortedSources = Object.entries(groupedByDocument)
        .sort(([, a], [, b]) => b.sources.length - a.sources.length);

    const handleViewSource = (source: ChatSource) => {
        toast.info('View source', {
            description: `From ${source.metadata.filename}, chunk ${source.metadata.chunk_index}`,
            action: {
                label: 'Go to Document',
                onClick: () => {
                    window.open(`/documents/${source.document_id}`, '_blank');
                }
            },
        });
    };

    const toggleDocument = (docId: string) => {
        setExpandedDocuments(prev => ({
            ...prev,
            [docId]: !prev[docId]
        }));
    };

    const handleExport = async () => {
        try {
            await navigator.clipboard.writeText(
                JSON.stringify(sources, null, 2)
            );
            toast.success('Copied to clipboard', {
                description: 'Source data has been copied'
            });
        } catch (err) {
            toast.error('Failed to copy', {
                description: 'Please try again'
            });
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base">
                            Sources & References
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            Documents used in the response
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea ref={scrollAreaRef} className="h-full">
                    <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
                        {sortedSources.map(([docId, { filename, sources: docSources }]) => {
                            const isExpanded = expandedDocuments[docId] !== false;
                            const shouldCollapse = docSources.length > 3;

                            return (
                                <Card key={docId} className="overflow-hidden hover:shadow-sm transition-shadow">
                                    <CardContent className="p-3 sm:p-4">
                                        {/* Document Header */}
                                        <div
                                            className="flex items-center justify-between mb-2 cursor-pointer"
                                            onClick={() => shouldCollapse && toggleDocument(docId)}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <span className="font-medium text-sm truncate block" title={filename}>
                                                        {documentId ? `${documentName}` : 'All Docs'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {docSources.length} references
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Badge variant="secondary" className="text-xs">
                                                    {docSources.length}
                                                </Badge>
                                                {shouldCollapse && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-3 w-3" />
                                                        ) : (
                                                            <ChevronDown className="h-3 w-3" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Sources List */}
                                        <div className="space-y-1.5 sm:space-y-2">
                                            {docSources.slice(0, isExpanded ? docSources.length : 3).map((source, idx) => (
                                                <div
                                                    key={idx}
                                                    className="text-xs p-2 bg-muted/50 rounded-md hover:bg-muted/80 transition-colors cursor-pointer border border-transparent hover:border-border"
                                                    onClick={() => handleViewSource(source)}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs font-normal"
                                                                style={{
                                                                    backgroundColor: `rgba(34, 197, 94, ${source.similarity})`,
                                                                    borderColor: '#22c55e',
                                                                    color: source.similarity > 0.6 ? 'white' : 'inherit'
                                                                }}
                                                            >
                                                                {(source.similarity * 100).toFixed(0)}%
                                                            </Badge>
                                                            <span className="text-muted-foreground">Chunk {source.metadata.chunk_index}</span>
                                                        </div>
                                                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                                    </div>
                                                    <p className="mt-1 line-clamp-2 sm:line-clamp-3 text-muted-foreground font-sans leading-relaxed">
                                                        {cleanText(source.content_preview)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Show More/Less */}
                                        {shouldCollapse && docSources.length > 3 && (
                                            <div className="mt-2 pt-2 border-t">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full text-xs h-7"
                                                    onClick={() => toggleDocument(docId)}
                                                >
                                                    {isExpanded ? (
                                                        <>Show less</>
                                                    ) : (
                                                        <>+{docSources.length - 3} more sources</>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Footer */}
            <div className="p-2 sm:p-3 border-t bg-muted/30">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span>Total: {sources.length} sources</span>
                        <span className="hidden xs:inline">•</span>
                        <span>{sortedSources.length} documents</span>
                    </div>
                    <div className="flex gap-1.5">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            className="h-7 text-xs px-2 sm:px-3"
                        >
                            <Copy className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Export</span>
                            <span className="sm:hidden">Copy</span>
                        </Button>
                        {isMobile && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="h-7 text-xs px-2"
                            >
                                ↑ Top
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}