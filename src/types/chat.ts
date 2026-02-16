// /lib/types/chat.ts
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    sources?: ChatSource[];
    metadata?: Record<string, any>;
    session_id?: string;
}

export interface ChatSource {
    content_preview: string;
    document_id: string;
    chunk_id: string;
    similarity: number;
    metadata: {
        filename: string;
        chunk_index: number;
    };
}

export interface ChatResponse {
    success: boolean;
    query: string;
    answer: string;
    sources?: ChatSource[];
    graph?: any;
    metadata: {
        processing_time: number;
        chunks_used: number;
        top_k: number;
        document_filter?: string;
    };
}