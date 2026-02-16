// /components/chat/ChatInterface.tsx - UPDATED VERSION
'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessageDisplay from './ChatMessage';
import ChatInput from './ChatInput';
import SourcesPanel from './SourcesPanel';
import { ChatMessage, ChatSource } from '@/types/chat'
import { toast } from 'sonner';
import { Loader2, AlertCircle, Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client'; // ADD THIS IMPORT

interface ChatInterfaceProps {
    documentId?: string | null;
    documentName?: string;
    initialMessages?: ChatMessage[];
    className?: string;
    onSourcesUpdate?: (sources: ChatSource[]) => void;
}

export default function ChatInterface({
    documentId = null,
    documentName = '',
    initialMessages = [],
    className = '',
    onSourcesUpdate
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true); // ADDED
    const [error, setError] = useState<string | null>(null);
    const [showSources, setShowSources] = useState(false);
    const [currentSources, setCurrentSources] = useState<ChatSource[]>([]);
    const [sessionId, setSessionId] = useState<string>(''); // ADDED
    const [userId, setUserId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load chat history and setup session
    useEffect(() => {
        loadChatHistory();
        setupSessionId();
    }, [documentId]);

    const setupSessionId = () => {
        const storedSessionId = localStorage.getItem(`chat_session_${documentId || 'global'}`);
        if (storedSessionId) {
            setSessionId(storedSessionId);
        } else {
            const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            setSessionId(newSessionId);
            localStorage.setItem(`chat_session_${documentId || 'global'}`, newSessionId);
        }
    };

    const loadChatHistory = async () => {
        try {
            setIsLoadingHistory(true);

            const result = await apiClient.getChatHistory({
                documentId: documentId || null,
                limit: 50
            });

            if (result.success && result.data) {
                // Convert DB messages to ChatMessage format
                const dbMessages: ChatMessage[] = result.data.map((msg: any) => ({
                    id: msg.id,
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                    timestamp: new Date(msg.created_at),
                    sources: msg.metadata?.sources,
                    metadata: {
                        chunks_used: msg.metadata?.chunks_used,
                        processing_time: msg.metadata?.processing_time
                    }
                }));

                // If we have messages from DB, use them
                if (dbMessages.length > 0) {
                    setMessages(dbMessages);
                    return;
                }
            }

            // If no messages in DB, show greeting
            if (messages.length === 0) {
                const greeting: ChatMessage = {
                    id: 'greeting',
                    role: 'assistant',
                    content: documentId
                        ? `Hello! I can answer questions about "${documentName || 'this document'}". What would you like to know?`
                        : 'Hello! I can answer questions across all your documents. What would you like to know?',
                    timestamp: new Date(),
                };
                setMessages([greeting]);
            }

        } catch (error) {
            console.error('Failed to load chat history:', error);
            // Even if DB fails, show greeting
            if (messages.length === 0) {
                const greeting: ChatMessage = {
                    id: 'greeting',
                    role: 'assistant',
                    content: 'Hello! How can I help you today?',
                    timestamp: new Date(),
                };
                setMessages([greeting]);
            }
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const getUserId = () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.log('DEBUG: No token found');
            return null;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub || payload.user_id || payload.id || payload.userId || payload.uid;
        } catch (error) {
            console.error('Failed to decode token:', error);
            return null;
        }
    };

    useEffect(() => {
        // This only runs on the client
        const getUserId = () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                console.log('DEBUG: No token found');
                return null;
            }

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.sub || payload.user_id || payload.id || payload.userId || payload.uid;
            } catch (error) {
                console.error('Failed to decode token:', error);
                return null;
            }
        };

        setUserId(getUserId());
    }, []);

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);
        setCurrentSources([]);
        setShowSources(false);

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Please login to use chat');
            }

            const requestBody: any = {
                query: content,
                userId: userId,
                session_id: sessionId, // ADDED THIS LINE
                options: {
                    includeSources: true,
                    includeGraph: false,
                    topK: 5,
                    temperature: 0.3
                }
            };

            // Only add documentId if it exists
            if (documentId) {
                requestBody.documentId = documentId;
            }

            const response = await fetch('http://localhost:5000/api/chat/query', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`Failed to get response: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to process query');
            }

            const aiMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                role: 'assistant',
                content: data.answer,
                timestamp: new Date(),
                sources: data.sources,
                metadata: data.metadata,
                session_id: data.session_id, // Store session_id
            };

            setMessages(prev => [...prev, aiMessage]);

            if (data.sources && data.sources.length > 0) {
                setCurrentSources(data.sources);
                onSourcesUpdate?.(data.sources);
            }

            toast.success('Response received', {
                description: `Processed in ${data.metadata?.processing_time || 0}ms`,
            });

        } catch (err) {
            console.error('Chat error:', err);
            setError(err instanceof Error ? err.message : 'Failed to send message');

            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);

            toast.error('Chat error', {
                description: err instanceof Error ? err.message : 'Unknown error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = async () => {
        try {
            // Clear from database
            await apiClient.clearChat({
                documentId: documentId || null
            });

            // Clear local state
            setMessages([]);
            setCurrentSources([]);
            setShowSources(false);

            // Generate new session ID
            const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            setSessionId(newSessionId);
            localStorage.setItem(`chat_session_${documentId || 'global'}`, newSessionId);

            // Show greeting
            const greeting: ChatMessage = {
                id: 'greeting',
                role: 'assistant',
                content: documentId
                    ? `Hello! I can answer questions about "${documentName || 'this document'}". What would you like to know?`
                    : 'Hello! I can answer questions across all your documents. What would you like to know?',
                timestamp: new Date(),
            };
            setMessages([greeting]);

            toast.info('Chat cleared');
        } catch (error) {
            console.error('Failed to clear chat:', error);
            toast.error('Failed to clear chat');
        }
    };

    const handleRegenerate = () => {
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        if (lastUserMessage) {
            handleSendMessage(lastUserMessage.content);
        }
    };

    // Show loading while fetching history
    if (isLoadingHistory) {
        return (
            <div className={`flex flex-col h-full min-h-[500px] ${className}`}>
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading chat history...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full min-h-[500px] sm:min-h-[550px] md:min-h-[600px] ${className}`}>
            {/* Header - Responsive */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <Bot className="h-5 w-5 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">
                            {documentId
                                ? `Chat with ${documentName || 'Document'}`
                                : 'Chat with All Documents'}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {documentId
                                ? 'Ask questions about this specific document'
                                : 'Ask questions across all your uploaded documents'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    {currentSources.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSources(!showSources)}
                            className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                        >
                            {showSources ? 'Hide' : 'Show'}
                            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                                {currentSources.length}
                            </Badge>
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearChat}
                        disabled={messages.length <= 1}
                        className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                    >
                        <span className="hidden sm:inline">Clear</span>
                        <span className="sm:hidden">×</span>
                    </Button>
                </div>
            </div>

            {/* Main Chat Area - Responsive */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Messages - Responsive width */}
                <div className={`flex-1 ${showSources ? 'hidden sm:block sm:w-2/3 lg:w-3/4' : 'w-full'}`}>
                    <ScrollArea
                        ref={scrollAreaRef}
                        className="h-full p-3 sm:p-4"
                    >
                        {messages.map((message, index) => (
                            <ChatMessageDisplay
                                key={message.id}
                                message={message}
                                isLast={index === messages.length - 1}
                                onRegenerate={handleRegenerate}
                            />
                        ))}

                        {/* Loading indicator - Responsive */}
                        {isLoading && (
                            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                    <span className="text-muted-foreground text-sm sm:text-base">Thinking...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </ScrollArea>

                    {/* Error display - Responsive */}
                    {error && (
                        <div className="p-3 sm:p-4 border-t">
                            <div className="flex items-center gap-2 text-destructive text-xs sm:text-sm">
                                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">{error}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sources Panel - Responsive behavior */}
                {showSources && currentSources.length > 0 && (
                    <>
                        {/* Mobile overlay */}
                        <div className={`sm:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50 ${showSources ? 'block' : 'hidden'}`}>
                            <div className="absolute right-0 top-0 h-full w-11/12 max-w-md bg-background border-l shadow-lg">
                                <div className="flex items-center justify-between p-4 border-b">
                                    <h4 className="font-semibold">Sources ({currentSources.length})</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowSources(false)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="h-[calc(100%-73px)]">
                                    <SourcesPanel
                                        sources={currentSources}
                                        documentId={documentId}
                                        documentName={documentName}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Desktop side panel */}
                        <div className="hidden sm:block sm:w-1/3 lg:w-1/4 border-l">
                            <div className="h-full flex flex-col">
                                <div className="p-3 sm:p-4 border-b flex items-center justify-between">
                                    <h4 className="font-semibold text-sm sm:text-base">Sources</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowSources(false)}
                                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                    >
                                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <SourcesPanel
                                        sources={currentSources}
                                        documentId={documentId}
                                        documentName={documentName}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Input Area - Responsive */}
            <div className="border-t p-3 sm:p-4">
                <ChatInput
                    onSendMessage={handleSendMessage}
                    disabled={isLoading}
                    placeholder={
                        documentId
                            ? "Ask about this document..."
                            : "Ask across all documents..."
                    }
                />

                {/* Stats - Responsive */}
                {messages.length > 1 && (
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between mt-2 sm:mt-3 text-xs text-muted-foreground gap-1.5 sm:gap-2">
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                            <span>{messages.filter(m => m.role === 'user').length} questions</span>
                            {messages.some(m => m.sources) && (
                                <span>
                                    {messages.reduce((acc, m) => acc + (m.sources?.length || 0), 0)} sources used
                                </span>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRegenerate}
                            disabled={isLoading || messages.filter(m => m.role === 'user').length === 0}
                            className="h-7 text-xs w-full xs:w-auto mt-1 xs:mt-0"
                        >
                            <Loader2 className="h-3 w-3 mr-1" />
                            Regenerate
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}