// /components/chat/ChatMessage.tsx
'use client';

import { ChatMessage as ChatMessageType } from '@/types/chat';
import { Bot, User, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
    message: ChatMessageType;
    isLast: boolean;
    onRegenerate?: () => void;

}

export default function ChatMessageDisplay({
    message,
    isLast,
    onRegenerate
}: ChatMessageProps) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === 'user';
    const hasSources = message.sources && message.sources.length > 0;

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={cn(
            "flex gap-3 sm:gap-4 p-4",
            isUser ? "bg-gray-50/50 dark:bg-gray-900/20" : "bg-white dark:bg-gray-950",
            !isLast && "border-b border-gray-200 dark:border-gray-800"
        )}>
            {/* Avatar - Simple and clear */}
            <div className="flex-shrink-0 mt-1">
                <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center",
                    isUser ? "bg-blue-500 text-white" : "bg-purple-500 text-white"
                )}>
                    {isUser ? (
                        <User className="h-4 w-4" />
                    ) : (
                        <Bot className="h-4 w-4" />
                    )}
                </div>
            </div>

            {/* Content - Full width, no overflow */}
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start sm:items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "font-medium text-sm sm:text-base",
                            isUser ? "text-blue-600 dark:text-blue-400" : "text-gray-800 dark:text-gray-200"
                        )}>
                            {isUser ? 'You' : 'AI Assistant'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(message.timestamp)}
                        </span>
                    </div>

                    {/* Actions - Visible on hover/always on mobile */}
                    <div className="flex items-center gap-1">
                        {!isUser && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={handleCopy}
                                >
                                    {copied ? (
                                        <Check className="h-3.5 w-3.5 text-green-600" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                                {isLast && onRegenerate && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={onRegenerate}
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Message Text - Proper word wrap */}
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                </div>

                {/* Sources - Simple display */}
                {hasSources && !isUser && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Sources:
                            </span>
                            {message.sources!.slice(0, 5).map((source, idx) => (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs"
                                >
                                    {Math.round(source.similarity * 100)}% match
                                </Badge>
                            ))}

                        </div>
                    </div>
                )}

                {/* Metadata - Simple stats */}
                {message.metadata && !isUser && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>{message.metadata.chunks_used || 0} chunks</span>
                            <span>{message.metadata.processing_time || 0}ms</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}