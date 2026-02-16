// app/chat/page.tsx
'use client';

import { useState } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import SourcesPanel from '@/components/chat/SourcesPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Brain, FileText, Zap, Link, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
            <div className="max-w-8xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                                    <Globe className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Global Chat
                                </h1>
                                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                                    <Brain className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-700">MemoryGraph AI</span>
                                </div>
                            </div>
                            <p className="text-gray-600">
                                Ask questions across <span className="font-semibold text-blue-600">ALL</span> your documents.
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
                        <Card className="border shadow-lg">
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
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-amber-500" />
                                    Try These Questions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {exampleQuestions.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleQuickQuestion(item.text)}
                                            className="text-left p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-all group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                                    <item.icon className="h-4 w-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 mb-1">{item.text}</p>
                                                    <p className="text-sm text-gray-600">{item.description}</p>
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
                <div className="mt-8 pt-6 border-t">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Brain className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium">MemoryGraph AI Active</p>
                                <p className="text-sm text-gray-600">
                                    Searching across all documents and building connections
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            <p>Global chat searches: • All documents • Cross-document connections • Knowledge graph insights</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}