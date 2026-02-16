'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadZone } from '@/components/upload/UploadZone';
import { ProcessingProgress } from '@/components/upload/ProcessingProgress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Upload, BrainCircuit, Network, AlertCircle, CheckCircle, Badge } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
    const [activeTab, setActiveTab] = useState('upload');
    const [currentDocument, setCurrentDocument] = useState<{
        id: string;
        filename: string;
        status: 'uploading' | 'processing' | 'completed' | 'failed';
        progress: number;
    } | null>(null);

    const router = useRouter();


    const handleUploadComplete = (documentId: string, filename: string) => {
        setCurrentDocument({
            id: documentId,
            filename,
            status: 'processing',
            progress: 0
        });
        setActiveTab('progress');
    };

    const handleProcessingComplete = () => {
        if (currentDocument) {
            setCurrentDocument({
                ...currentDocument,
                status: 'completed',
                progress: 100
            });

            // Auto-redirect after 2 seconds
            setTimeout(() => {
                router.push(`/documents/${currentDocument.id}`);
            }, 2000);
        }
    };

    return (
        <div className="container max-w-full p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8 sm:mb-10 text-center px-2">
                {/* Colorful header with individual word colors */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
                    <span className="text-blue-600 dark:text-blue-400">Upload</span>{' '}
                    <span className="text-purple-600 dark:text-purple-400">Documents</span>
                </h1>

                {/* Subtle gradient background */}
                <div className="relative inline-block">
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg font-medium relative z-10">
                        Transform your documents into intelligent knowledge graphs
                    </p>
                    <div className="absolute -inset-2 -z-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-xl rounded-lg" />
                </div>

                {/* Colorful dots */}
                <div className="flex justify-center gap-2 mt-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                    <div className="h-1.5 w-1.5 rounded-full bg-pink-600" />
                </div>
            </div>

            {/* Main Card */}
            <Card className="shadow-lg border-0">
                <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        {/* Title + Description */}

                        <div className="flex-1 min-w-0">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl leading-tight">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                                    <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                </div>
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                                    Add Knowledge
                                </span>
                            </CardTitle>

                            <CardDescription className="mt-1.5 text-sm text-muted-foreground leading-relaxed flex items-center gap-1">
                                <span>✨</span>
                                Upload documents to build your personal knowledge graph
                            </CardDescription>
                        </div>

                        {/* CTA */}
                        <div className="w-full sm:w-auto">

                            <Button
                                variant="outline"
                                onClick={() => router.push('/documents')}
                                className="w-full sm:w-auto h-11 sm:h-9 px-4 text-sm relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 hover:shadow-md transition-all"
                            >
                                View all documents
                            </Button>
                        </div>

                    </div>
                </CardHeader>


                <CardContent className="px-3 sm:px-6">
                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        {/* Tabs Navigation - Responsive */}
                        <TabsList className="grid grid-cols-3 gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4 sm:mb-6 md:mb-8 sticky top-0 z-10 backdrop-blur-sm bg-opacity-95">
                            <TabsTrigger
                                value="upload"
                                className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1 sm:px-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-all"
                            >
                                <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                <span className="truncate">Upload</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="progress"
                                className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1 sm:px-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed relative"
                                disabled={!currentDocument}
                            >
                                <BrainCircuit className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                <span className="hidden xs:inline">Processing</span>
                                <span className="xs:hidden">Proc</span>
                                {currentDocument && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-purple-500"></span>
                                    </span>
                                )}
                            </TabsTrigger>

                            <TabsTrigger
                                value="info"
                                className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1 sm:px-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 transition-all"
                            >
                                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                <span>Info</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Upload Tab - Responsive */}
                        <TabsContent value="upload" className="space-y-4 sm:space-y-6 md:space-y-8">
                            <UploadZone onUploadComplete={handleUploadComplete} />

                            {/* File Types Info - Responsive Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8">
                                {/* PDF Card */}
                                <div className="text-center p-3 sm:p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                                    <div className="inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 mb-2">
                                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h4 className="font-semibold text-sm sm:text-base">PDF</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Research papers, books</p>
                                    <div className="mt-2 text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400">
                                        Up to 50MB
                                    </div>
                                </div>

                                {/* DOCX Card */}
                                <div className="text-center p-3 sm:p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                                    <div className="inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 mb-2">
                                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h4 className="font-semibold text-sm sm:text-base">DOCX</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Word documents</p>
                                    <div className="mt-2 text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-400">
                                        Up to 50MB
                                    </div>
                                </div>

                                {/* TXT/MD Card */}
                                <div className="text-center p-3 sm:p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                                    <div className="inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 mb-2">
                                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h4 className="font-semibold text-sm sm:text-base">TXT/MD</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Notes, markdown</p>
                                    <div className="mt-2 text-[10px] sm:text-xs font-medium text-purple-600 dark:text-purple-400">
                                        Up to 50MB
                                    </div>
                                </div>

                                {/* JSON Card */}
                                <div className="text-center p-3 sm:p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                                    <div className="inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 mb-2">
                                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <h4 className="font-semibold text-sm sm:text-base">JSON</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Structured data</p>
                                    <div className="mt-2 text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400">
                                        Up to 50MB
                                    </div>
                                </div>
                            </div>

                            {/* Upload Tips - Mobile Friendly */}
                            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 sm:p-5 border border-blue-200 dark:border-blue-800">
                                <h4 className="font-semibold text-sm sm:text-base text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    Pro Tips for Best Results
                                </h4>
                                <ul className="space-y-2 text-xs sm:text-sm text-blue-700 dark:text-blue-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        <span>Clean PDFs with selectable text work best (scanned PDFs take longer)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        <span>Documents with clear headings and structure produce better knowledge graphs</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        <span>You can upload multiple files - each will be processed separately</span>
                                    </li>
                                </ul>
                            </div>
                        </TabsContent>

                        {/* Progress Tab - Responsive */}
                        <TabsContent value="progress" className="min-h-[300px] sm:min-h-[400px]">
                            {currentDocument ? (
                                <ProcessingProgress
                                    documentId={currentDocument.id}
                                    filename={currentDocument.filename}
                                    onComplete={handleProcessingComplete}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center py-8 sm:py-10 md:py-12 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <div className="p-3 sm:p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3 sm:mb-4">
                                        <BrainCircuit className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">No Active Processing</h3>
                                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-md">
                                        Upload a document to see real-time AI processing with live progress updates
                                    </p>
                                    <Button
                                        onClick={() => setActiveTab('upload')}
                                        className="mt-4 sm:mt-6 bg-purple-600 hover:bg-purple-700 text-white"
                                        size="sm"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Go to Upload
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        {/* Info Tab - Responsive */}
                        <TabsContent value="info" className="space-y-4 sm:space-y-6">
                            <div className="grid gap-4 sm:gap-6">
                                {/* 7-Step Process Card */}
                                <Card className="overflow-hidden border-0 shadow-sm">
                                    <CardHeader className="px-4 sm:px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
                                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                            <div className="p-1.5 bg-purple-600 rounded-lg">
                                                <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                            </div>
                                            7-Step AI Processing Pipeline
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-4 sm:px-6 py-4 sm:py-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            {/* Step 1 */}
                                            <div className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
                                                    1
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm">Upload & Store</h4>
                                                    <p className="text-xs text-muted-foreground">Secure encrypted cloud storage</p>
                                                </div>
                                            </div>

                                            {/* Step 2 */}
                                            <div className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">
                                                    2
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm">Text Extraction</h4>
                                                    <p className="text-xs text-muted-foreground">Advanced OCR & parsing</p>
                                                </div>
                                            </div>

                                            {/* Step 3 */}
                                            <div className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white text-xs font-bold">
                                                    3
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm">Knowledge Chunking</h4>
                                                    <p className="text-xs text-muted-foreground">500-char semantic chunks</p>
                                                </div>
                                            </div>

                                            {/* Step 4 */}
                                            <div className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                                                    4
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm">AI Embeddings</h4>
                                                    <p className="text-xs text-muted-foreground">Gemini AI vectorization</p>
                                                </div>
                                            </div>

                                            {/* Step 5 */}
                                            <div className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                                                    5
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm">Vector Storage</h4>
                                                    <p className="text-xs text-muted-foreground">Pinecone vector DB</p>
                                                </div>
                                            </div>

                                            {/* Step 6 */}
                                            <div className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold">
                                                    6
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm">Knowledge Graph</h4>
                                                    <p className="text-xs text-muted-foreground">Entity relationship mapping</p>
                                                </div>
                                            </div>

                                            {/* Step 7 */}
                                            <div className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 sm:col-span-2">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">
                                                    7
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm">Ready to Use</h4>
                                                    <p className="text-xs text-muted-foreground">Chat, search, and explore your knowledge graph</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Real-Time Processing Card */}
                                <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                                    <CardHeader className="px-4 sm:px-6">
                                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                            <div className="p-1.5 bg-indigo-600 rounded-lg">
                                                <Network className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                            </div>
                                            Real-Time Processing
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            Watch your document transform in real-time with live WebSocket updates.
                                            Each step shows detailed progress, estimated time, and live statistics.
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <Badge className="bg-white/50 dark:bg-gray-950/50">
                                                Live Progress
                                            </Badge>
                                            <Badge className="bg-white/50 dark:bg-gray-950/50">
                                                Estimated Time
                                            </Badge>
                                            <Badge className="bg-white/50 dark:bg-gray-950/50">
                                                Step Details
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 md:mt-8">
                <Card className="hover:shadow-sm shadow-lg  transition-shadow">
                    <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Max File Size</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold">50 MB</p>
                            </div>
                            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-sm shadow-lg  transition-shadow">
                    <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Processing Time</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold">2-5 min</p>
                            </div>
                            <BrainCircuit className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-sm shadow-lg  transition-shadow">
                    <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Supported Formats</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold">8+</p>
                            </div>
                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}