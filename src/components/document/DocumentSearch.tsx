// components/document/DocumentSearch.tsx
'use client';

import { useState } from 'react';
import { Search, FileText, BarChart3, ExternalLink, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface DocumentSearchProps {
    documentId: string;
    documentName: string;
}

interface SearchResult {
    id: string;
    content: string;
    similarity: number;
    chunk_index: number;
    vector_id: string;
}

interface SearchResponse {
    success: boolean;
    query: string;
    results: Array<{
        document_id: string;
        filename: string;
        chunks: SearchResult[];
    }>;
    metadata: {
        total_chunks: number;
        total_documents: number;
        min_score: number;
    };
}

export default function DocumentSearch({ documentId, documentName }: DocumentSearchProps) {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
    const [minScore, setMinScore] = useState(0.5);

    const handleSearch = async () => {
        if (!query.trim()) {
            toast.error('Please enter a search query');
            return;
        }

        setIsSearching(true);
        try {
            // Note: You need to add searchDocuments method to apiClient
            const response = await apiClient.searchDocuments(query, documentId, { minScore });

            if (response.success) {
                setSearchResults(response);
                toast.success('Search complete', {
                    description: `Found ${response.metadata.total_chunks} results`,
                });
            } else {
                toast.error('Search failed', {
                    description: response.error || 'Please try again',
                });
            }
        } catch (error: any) {
            toast.error('Search error', {
                description: error.message || 'Failed to search documents',
            });
        } finally {
            setIsSearching(false);
        }
    };

    const cleanPdfText = (text: string): string => {
        if (!text || typeof text !== 'string') return '';

        let cleaned = text;

        // ===== PHASE 1: REMOVE ALL JUNK CHARACTERS =====
        cleaned = cleaned.replace(/[^\w\s.,!?;:'"()\-@#$/&%+=\[\]{}<>]/g, ' ');

        // Specifically target common PDF/OCR junk patterns
        cleaned = cleaned.replace(/[•~|\\*^`_]/g, ' ');
        cleaned = cleaned.replace(/[{}]/g, ' ');

        // ===== PHASE 2: FIX ALL SPACING ISSUES =====
        cleaned = cleaned.replace(/\s+/g, ' ');

        const nonSpaceChars = cleaned.replace(/\s/g, '').length;
        const spaceCount = (cleaned.match(/\s/g) || []).length;

        if (spaceCount > nonSpaceChars * 0.6 && nonSpaceChars > 10) {
            const noSpaces = cleaned.replace(/\s/g, '');
            let reconstructed = noSpaces.replace(/([a-z])([A-Z])/g, '$1 $2');
            reconstructed = reconstructed.replace(/([.!?])([A-Z])/g, '$1 $2');
            reconstructed = reconstructed.replace(/(\d)([A-Za-z])/g, '$1 $2');
            reconstructed = reconstructed.replace(/([A-Za-z])(\d)/g, '$1 $2');

            const wordEndings = ['ing', 'ed', 'ly', 'tion', 'ment', 'ness', 'ity', 'al', 'ive', 'ous', 'able'];
            wordEndings.forEach(ending => {
                const regex = new RegExp(`([a-zA-Z])(${ending})([A-Z])`, 'g');
                reconstructed = reconstructed.replace(regex, `$1$2 $3`);
            });

            cleaned = reconstructed;
        }

        // ===== PHASE 3: FIX SPECIFIC OCR ERRORS =====
        cleaned = cleaned.replace(/([A-Z])0([A-Z])/g, '$1O$2');
        cleaned = cleaned.replace(/([a-z])0([a-z])/g, '$1o$2');
        cleaned = cleaned.replace(/(\d)[Il1](\d)/g, '$1l$2');
        cleaned = cleaned.replace(/([A-Z])5([A-Z])/g, '$1S$2');
        cleaned = cleaned.replace(/\b([A-Z][a-z]*)-\s*([a-z]+)\b/g, '$1$2');
        cleaned = cleaned.replace(/\b([a-z]+)\s*-\s*([a-z]+)\b/gi, '$1-$2');
        cleaned = cleaned.replace(/(\w+)\s*@\s*(\w+)/g, '$1@$2');
        cleaned = cleaned.replace(/(\w+)\s*\.\s*(com|org|edu|net|in|ac)/gi, '$1.$2');
        cleaned = cleaned.replace(/(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)/g, '$1$2$3$4$5$6$7$8$9$10');
        cleaned = cleaned.replace(/\b(\d{10})\b/g, '+91 $1');

        // ===== PHASE 4: FIX PUNCTUATION AND FORMATTING =====
        cleaned = cleaned.replace(/([.,!?;:])\1+/g, '$1');
        cleaned = cleaned.replace(/\s+([.,!?;:])/g, '$1');
        cleaned = cleaned.replace(/([.,!?;:])(?![0-9\s])/g, '$1 ');
        cleaned = cleaned.replace(/\s*["']\s*/g, '"');
        cleaned = cleaned.replace(/""+/g, '"');
        cleaned = cleaned.replace(/\s*\(\s*/g, ' (');
        cleaned = cleaned.replace(/\s*\)\s*/g, ') ');

        // ===== PHASE 5: FIX SENTENCE STRUCTURE =====
        cleaned = cleaned.replace(/(?:^|[.!?]\s+)([a-z])/g, match => match.toUpperCase());
        cleaned = cleaned.replace(/([.!?])([A-Z])/g, '$1 $2');
        cleaned = cleaned.replace(/([a-z])-\s+([a-z])/g, '$1$2');

        // ===== PHASE 6: FINAL CLEANUP =====
        cleaned = cleaned.replace(/\s[^\w\s]\s/g, ' ');
        cleaned = cleaned.replace(/\s[bcdefghjklmnopqrstuvwxyz]\s/gi, ' ');
        cleaned = cleaned.replace(/\s+/g, ' ');

        return cleaned.trim();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSearch();
        }
    };

    const formatContent = (content: string) => {
        if (!content) return '';
        return content.replace(/\s+/g, ' ').trim();
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Search Header */}
            <Card className="w-full">
                <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                    <div className="space-y-3 sm:space-y-4">
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 flex-wrap">
                                <Search className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                <span className="truncate">Search Within This Document</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                Find content using semantic search. Searches for meaning, not just exact words.
                            </p>
                        </div>

                        {/* Search Input */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1 relative">
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Search for concepts, topics, or phrases..."
                                    className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                            </div>
                            <Button
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="h-10 sm:h-11 text-sm sm:text-base"
                            >
                                {isSearching ? (
                                    <>
                                        <span className="inline sm:hidden">...</span>
                                        <span className="hidden sm:inline">Searching...</span>
                                    </>
                                ) : (
                                    'Search'
                                )}
                            </Button>
                        </div>

                        {/* Search Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-muted-foreground gap-2 sm:gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-3 w-3 flex-shrink-0" />
                                    <span>Min match: </span>
                                    <select
                                        value={minScore}
                                        onChange={(e) => setMinScore(parseFloat(e.target.value))}
                                        className="bg-transparent border-none focus:outline-none text-xs sm:text-sm"
                                    >
                                        <option value="0.5">50%</option>
                                        <option value="0.6">60%</option>
                                        <option value="0.7">70%</option>
                                        <option value="0.8">80%</option>
                                        <option value="0.9">90%</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-3 w-3 flex-shrink-0" />
                                    <span className="hidden xs:inline">Semantic search (finds related concepts)</span>
                                    <span className="xs:hidden">Semantic search</span>
                                </div>
                            </div>

                            {searchResults && (
                                <div className="font-medium text-xs sm:text-sm">
                                    {searchResults.metadata.total_chunks} results found
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Area */}
            {searchResults ? (
                <div className="space-y-3 sm:space-y-4">
                    {/* Results Header */}
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                        <h4 className="font-semibold text-sm sm:text-base truncate">
                            Results for "{searchResults.query}"
                        </h4>
                        <Badge variant="outline" className="text-xs sm:text-sm">
                            {searchResults.results.length} document{searchResults.results.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>

                    {/* Results List */}
                    <div className="h-[400px] sm:h-[500px]">
                        <ScrollArea className="h-full pr-2 sm:pr-4">
                            <div className="space-y-3 sm:space-y-4">
                                {searchResults.results.map((docResult, docIndex) => (
                                    <Card key={docResult.document_id} className="overflow-hidden">
                                        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                                    <CardTitle className="text-sm sm:text-base truncate" title={docResult.filename}>
                                                        {docResult.filename}
                                                    </CardTitle>
                                                </div>
                                                <Badge variant="secondary" className="text-xs sm:text-sm w-fit sm:w-auto">
                                                    {docResult.chunks.length} match{docResult.chunks.length !== 1 ? 'es' : ''}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-3 sm:px-6">
                                            <div className="space-y-2 sm:space-y-3">
                                                {docResult.chunks.map((chunk, chunkIndex) => (
                                                    <div
                                                        key={`${chunk.vector_id}-${chunkIndex}`}
                                                        className="p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                                    >
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 sm:mb-2 gap-1 sm:gap-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <Badge
                                                                    variant="outline"
                                                                    className="font-mono text-xs"
                                                                    style={{
                                                                        backgroundColor: `rgba(34, 197, 94, ${chunk.similarity})`,
                                                                        borderColor: '#22c55e'
                                                                    }}
                                                                >
                                                                    {(chunk.similarity * 100).toFixed(0)}% match
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Chunk {chunk.chunk_index + 1}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 sm:w-auto p-0 sm:p-2 self-end"
                                                                onClick={() => {
                                                                    toast.info('View chunk', {
                                                                        description: `Chunk ${chunk.chunk_index + 1}`,
                                                                    });
                                                                }}
                                                            >
                                                                <ExternalLink className="h-3 w-3" />
                                                                <span className="hidden sm:inline ml-1 text-xs">View</span>
                                                            </Button>
                                                        </div>
                                                        <p className="text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-4">
                                                            {cleanPdfText(chunk.content)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            ) : (
                /* Empty State */
                <Card className="w-full">
                    <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                        <div className="text-center py-6 sm:py-8 md:py-12">
                            <Search className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Search This Document</h3>
                            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
                                Enter a search term to find related content within "{documentName}".
                                This uses semantic search to find concepts, not just exact words.
                            </p>
                            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuery('technical skills')}
                                    className="text-xs"
                                >
                                    technical skills
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuery('projects')}
                                    className="text-xs"
                                >
                                    projects
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuery('experience')}
                                    className="text-xs"
                                >
                                    experience
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuery('education')}
                                    className="text-xs"
                                >
                                    education
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}