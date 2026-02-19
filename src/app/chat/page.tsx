// app/chat/page.tsx
'use client';

import { useState } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import SourcesPanel from '@/components/chat/SourcesPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Brain, FileText, Zap, Link, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function GlobalChatPage() {
    const [sources, setSources] = useState([]);
    const [showSources, setShowSources] = useState(true);

    const exampleQuestions = [
        {
            text: "Summarize all my documents",
            icon: FileText,
            description: "Get an overview of everything you've uploaded"
        },
        {
            text: "What are the main topics across everything?",
            icon: Search,
            description: "Find common themes across all documents"
        },
        {
            text: "Find connections between my documents",
            icon: Link,
            description: "Discover how different documents relate to each other"
        },
        {
            text: "What skills are mentioned across all files?",
            icon: Zap,
            description: "Extract technical skills from all documents"
        },
    ];

    const handleQuickQuestion = (question: string) => {
        // This would need to be integrated with ChatInterface
        // For now, it's just a placeholder
        console.log('Quick question:', question);
    };

    return (
        <div className="min-h-screen bg-black p-4 md:p-6">
            <div className="max-w-8xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg shadow-purple-500/20">
                                    <Globe className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
                                    Global Chat
                                </h1>
                                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full">
                                    <Brain className="h-4 w-4 text-purple-400" />
                                    <span className="text-sm font-medium text-blue-400">MemoryGraph AI</span>
                                </div>
                            </div>
                            <p className="text-gray-500">
                                Ask questions across <span className="font-semibold text-blue-400">ALL</span> your documents.
                                MemoryGraph AI will search everything and find connections.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Chat & Suggestions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Chat Card */}
                        <Card className="border-0 bg-gray-900/90 backdrop-blur-sm shadow-2xl shadow-purple-500/5 overflow-hidden">
                            {/* Top Gradient Bar */}
                            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                            <CardContent className="p-0">
                                {/* Use your existing ChatInterface WITHOUT documentId */}
                                <ChatInterface
                                    // NO documentId = Global chat!
                                    documentName="All Documents"
                                    className="h-[600px]"
                                    initialMessages={[]}
                                />
                            </CardContent>
                        </Card>

                        {/* Quick Questions */}
                        <Card className="border-0 bg-gray-900/90 backdrop-blur-sm shadow-2xl shadow-purple-500/5">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-200">
                                    <div className="p-1.5 bg-amber-500/10 rounded-lg">
                                        <Zap className="h-5 w-5 text-amber-400" />
                                    </div>
                                    Try These Questions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {exampleQuestions.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleQuickQuestion(item.text)}
                                            className="text-left p-4 rounded-lg border border-gray-800 bg-gray-900 hover:border-blue-500 hover:bg-gray-800 transition-all group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                                                    <item.icon className="h-4 w-4 text-gray-400 group-hover:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-200 mb-1 group-hover:text-white">{item.text}</p>
                                                    <p className="text-sm text-gray-500 group-hover:text-gray-400">{item.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Brain className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-200">MemoryGraph AI Active</p>
                                <p className="text-sm text-gray-500">
                                    Searching across all documents and building connections
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="border-gray-700 bg-gray-800 text-gray-300">
                                All documents
                            </Badge>
                            <Badge variant="outline" className="border-gray-700 bg-gray-800 text-gray-300">
                                Cross-document connections
                            </Badge>
                            <Badge variant="outline" className="border-gray-700 bg-gray-800 text-gray-300">
                                Knowledge graph insights
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}