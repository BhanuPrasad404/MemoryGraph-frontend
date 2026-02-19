'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Upload,
    FileText,
    X,
    CheckCircle,
    AlertCircle,
    Loader2,
    BrainCircuit,
    FileJson,
    File,
    Sparkles,
    Shield,
    Zap,
    Clock,
    ArrowRight
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
    onUploadComplete: (documentId: string, filename: string) => void;
}

const ACCEPTED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
    'text/markdown': ['.md'],
    'application/json': ['.json'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc']
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const fileTypeIcons = {
    pdf: { icon: '📕', color: 'from-red-500 to-rose-500', bg: 'bg-red-500/10' },
    txt: { icon: '📝', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10' },
    md: { icon: '📘', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10' },
    json: { icon: '📊', color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10' },
    docx: { icon: '📄', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10' },
    doc: { icon: '📄', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10' },
    default: { icon: '📁', color: 'from-gray-500 to-gray-600', bg: 'bg-gray-500/10' }
};

const features = [
    { icon: Sparkles, label: 'AI Processing', desc: 'Intelligent extraction', color: 'text-purple-400' },
    { icon: BrainCircuit, label: 'Knowledge Graph', desc: 'Build connections', color: 'text-blue-400' },
    { icon: Shield, label: 'Secure', desc: 'Encrypted storage', color: 'text-green-400' },
    { icon: Zap, label: 'Fast', desc: 'Real-time progress', color: 'text-amber-400' }
];

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);
        setSuccess(null);

        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError(`File size exceeds 50MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
            return;
        }

        // Validate file type
        if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type) &&
            !file.name.match(/\.(pdf|txt|md|json|docx|doc)$/i)) {
            setError('Unsupported file type. Please upload PDF, TXT, MD, JSON, or DOCX files.');
            return;
        }

        setSelectedFile(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: ACCEPTED_FILE_TYPES,
        disabled: uploading
    });

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setError(null);
        setSuccess(null);
        setUploadProgress(0);

        try {
            const response = await apiClient.uploadFile(selectedFile, (progressPercent) => {
                setUploadProgress(Math.min(progressPercent, 90));
            });

            setUploadProgress(100);

            if (response.success) {
                setSuccess('Document uploaded successfully! Processing started...');

                if (response.documentId) {
                    setTimeout(() => {
                        onUploadComplete(response.documentId, selectedFile.name);
                    }, 1000);
                } else {
                    throw new Error('No documentId in response');
                }
            } else {
                throw new Error(response.error || 'Upload failed');
            }

        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload document. Please try again.');
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setError(null);
        setSuccess(null);
        setUploadProgress(0);
    };

    const getFileInfo = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase() || 'default';
        return fileTypeIcons[ext as keyof typeof fileTypeIcons] || fileTypeIcons.default;
    };

    return (
        <div className="min-h-screen bg-black py-8 px-4 relative overflow-hidden">
            {/* Background Decoration - Subtle for dark theme */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-amber-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-3xl mx-auto space-y-8 relative z-10">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 backdrop-blur-sm">
                        <Upload className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">
                            Document Upload
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                        <span className="text-gray-100">
                            Upload Your
                        </span>
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent ml-2">
                            Document
                        </span>
                    </h1>

                    <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
                        Upload documents to build your intelligent knowledge graph.
                        Our AI will extract insights and create connections automatically.
                    </p>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                        {features.map((feature, idx) => (
                            <Badge
                                key={idx}
                                variant="outline"
                                className="px-3 py-2 bg-gray-900 border-gray-800 text-gray-300"
                            >
                                <feature.icon className={`h-3.5 w-3.5 mr-1.5 ${feature.color}`} />
                                <span className="text-xs font-medium">
                                    {feature.label}
                                </span>
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Main Upload Card */}
                <Card className="border-0 bg-gray-900/90 backdrop-blur-sm overflow-hidden shadow-2xl shadow-purple-500/5">
                    {/* Top Gradient Bar */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                    <CardContent className="p-6 sm:p-8 space-y-6">
                        {/* Drag & Drop Zone */}
                        <div
                            {...getRootProps()}
                            className={cn(
                                "relative group border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300",
                                isDragActive
                                    ? "border-blue-500 bg-blue-950/30 scale-[1.02]"
                                    : "border-gray-800 hover:border-blue-500 hover:bg-gray-800/50",
                                uploading && "opacity-50 cursor-not-allowed pointer-events-none"
                            )}
                        >
                            <input {...getInputProps()} />

                            {/* Animated Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 rounded-2xl transition-all duration-500"></div>

                            <div className="relative space-y-4">
                                <div className={cn(
                                    "inline-flex p-5 rounded-full transition-all duration-300",
                                    isDragActive
                                        ? "bg-gradient-to-r from-blue-500 to-purple-500 scale-110"
                                        : "bg-gradient-to-r from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20"
                                )}>
                                    <Upload className={cn(
                                        "h-8 w-8 sm:h-10 sm:w-10 transition-all duration-300",
                                        isDragActive ? "text-white" : "text-blue-400 group-hover:scale-110"
                                    )} />
                                </div>

                                <div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-100">
                                        {isDragActive ? (
                                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                                Drop your file here
                                            </span>
                                        ) : (
                                            'Drag & drop your document'
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        or <span className="text-blue-400 font-medium cursor-pointer hover:underline">browse files</span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
                                    <Badge variant="outline" className="px-2 py-1 border-gray-700 bg-gray-800 text-gray-400">PDF</Badge>
                                    <Badge variant="outline" className="px-2 py-1 border-gray-700 bg-gray-800 text-gray-400">TXT</Badge>
                                    <Badge variant="outline" className="px-2 py-1 border-gray-700 bg-gray-800 text-gray-400">MD</Badge>
                                    <Badge variant="outline" className="px-2 py-1 border-gray-700 bg-gray-800 text-gray-400">JSON</Badge>
                                    <Badge variant="outline" className="px-2 py-1 border-gray-700 bg-gray-800 text-gray-400">DOCX</Badge>
                                </div>

                                <p className="text-xs text-gray-600">
                                    Maximum file size: 50MB
                                </p>
                            </div>
                        </div>

                        {/* Selected File Preview */}
                        {selectedFile && (
                            <div className="animate-in slide-in-from-bottom-4 duration-300">
                                <div className="relative bg-gray-800 rounded-xl border border-gray-700 p-4">
                                    {/* Decorative corner gradient */}
                                    <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-tl-xl"></div>

                                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            {/* File Icon with Gradient */}
                                            <div className={cn(
                                                "p-3 rounded-xl bg-gradient-to-r",
                                                getFileInfo(selectedFile.name).color,
                                                "text-white"
                                            )}>
                                                <span className="text-2xl">{getFileInfo(selectedFile.name).icon}</span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium text-gray-100 truncate">
                                                        {selectedFile.name}
                                                    </p>
                                                    <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300 border-gray-600">
                                                        {selectedFile.name.split('.').pop()?.toUpperCase()}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <File className="h-3 w-3" />
                                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Ready to process
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {!uploading && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={removeFile}
                                                className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-950/50"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Upload Progress */}
                                    {uploading && (
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Uploading...</span>
                                                <span className="font-medium text-blue-400">{uploadProgress}%</span>
                                            </div>
                                            <div className="relative">
                                                <Progress value={uploadProgress} className="h-2 bg-gray-700" />
                                                <div
                                                    className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <Alert variant="destructive" className="border-red-900 bg-red-950/50 text-red-400 animate-in slide-in-from-bottom-4">
                                <AlertCircle className="h-4 w-4 text-red-400" />
                                <AlertDescription className="text-red-300">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Success Message */}
                        {success && (
                            <Alert className="border-green-900 bg-green-950/50 animate-in slide-in-from-bottom-4">
                                <CheckCircle className="h-4 w-4 text-green-400" />
                                <AlertDescription className="text-green-300">
                                    {success}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-800">
                            <Button
                                variant="outline"
                                onClick={removeFile}
                                disabled={!selectedFile || uploading}
                                className="w-full sm:w-auto order-2 sm:order-1 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className={cn(
                                    "w-full sm:w-auto min-w-[180px] relative overflow-hidden group order-1 sm:order-2",
                                    "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-purple-600/20"
                                )}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                                        Process Document
                                        <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Processing Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="border-0 bg-gradient-to-br from-blue-950/30 to-indigo-950/30">
                        <CardContent className="p-4 flex items-start gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <BrainCircuit className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-gray-200">AI Processing</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    Documents are analyzed using advanced AI to extract entities and relationships
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-purple-950/30 to-pink-950/30">
                        <CardContent className="p-4 flex items-start gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Sparkles className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-gray-200">Knowledge Graph</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    All extracted information is connected into an interactive knowledge graph
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}