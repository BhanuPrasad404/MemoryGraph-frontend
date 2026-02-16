// /components/chat/ChatInput.tsx
'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Mic, MicOff, Smile, Loader2, CornerDownLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ChatInputProps {
    onSendMessage: (content: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export default function ChatInput({
    onSendMessage,
    disabled = false,
    placeholder = "Type your message..."
}: ChatInputProps) {
    const [input, setInput] = useState('');
    const [isComposing, setIsComposing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeechSupported, setIsSpeechSupported] = useState(false);
    const [speechError, setSpeechError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    // Check if speech recognition is available
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).webkitSpeechRecognition ||
                (window as any).SpeechRecognition;

            if (SpeechRecognition) {
                setIsSpeechSupported(true);
                initializeSpeechRecognition();
            } else {
                setIsSpeechSupported(false);
                setSpeechError('Voice input not supported in your browser');
            }
        }
    }, []);

    const initializeSpeechRecognition = () => {
        const SpeechRecognition = (window as any).webkitSpeechRecognition ||
            (window as any).SpeechRecognition;

        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop after user stops speaking
        recognition.interimResults = true; // Show results while speaking
        recognition.lang = 'en-US'; // Default language

        recognition.onstart = () => {
            setIsRecording(true);
            setSpeechError(null);
            toast.info('Listening... Speak now!');
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Update input with the combined text
            if (finalTranscript) {
                setInput(prev => {
                    const currentText = prev.trim();
                    return currentText
                        ? `${currentText} ${finalTranscript}`
                        : finalTranscript;
                });
            } else if (interimTranscript) {
                // Show interim results if needed (optional)
                // setInput(prev => prev + interimTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            setIsRecording(false);

            switch (event.error) {
                case 'not-allowed':
                case 'permission-denied':
                    setSpeechError('Microphone access denied. Please allow microphone access.');
                    toast.error('Microphone access denied');
                    break;
                case 'no-speech':
                    setSpeechError('No speech detected. Please try again.');
                    toast.error('No speech detected');
                    break;
                case 'audio-capture':
                    setSpeechError('No microphone found. Please check your microphone.');
                    toast.error('No microphone found');
                    break;
                default:
                    setSpeechError('Voice input failed. Please try again.');
                    toast.error('Voice input failed');
            }

            recognition.stop();
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
    };

    const toggleRecording = () => {
        if (!isSpeechSupported) {
            toast.error('Voice input not supported in your browser');
            return;
        }

        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const startRecording = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (error) {
                setSpeechError('Failed to start recording');
                toast.error('Failed to start recording');
            }
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.error('Error stopping recording:', error);
            }
        }
        setIsRecording(false);
    };

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || disabled) return;

        onSendMessage(trimmed);
        setInput('');
        setSpeechError(null);

        // Also stop recording if it's active
        if (isRecording) {
            stopRecording();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleAttach = () => {
        toast.info('Attachment feature coming soon');
    };

    const handleVoice = () => {
        if (!isSpeechSupported) {
            toast.error('Voice input not supported in your browser');
            return;
        }
        toggleRecording();
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (error) {
                    // Ignore errors during cleanup
                }
            }
        };
    }, []);

    return (
        <div className="w-full">
            {/* Speech error alert */}
            {speechError && (
                <div className="mb-2 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-red-700 dark:text-red-300">{speechError}</p>
                    </div>
                </div>
            )}

            {/* Main input area */}
            <div className="relative">
                <Textarea
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setSpeechError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    placeholder={placeholder}
                    disabled={disabled || isRecording}
                    className="min-h-[48px] sm:min-h-[56px] md:min-h-[60px] max-h-[120px] pr-20 sm:pr-24 resize-none text-sm sm:text-base"
                    rows={1}
                />

                {/* Action buttons - responsive layout */}
                <div className="absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 flex items-center gap-0.5 sm:gap-1">
                    {/* Voice button */}
                    <Button
                        type="button"
                        variant={isRecording ? "destructive" : "ghost"}
                        size="icon"
                        className={`h-7 w-7 sm:h-8 sm:w-8 ${isRecording ? 'animate-pulse' : ''}`}
                        onClick={handleVoice}
                        disabled={disabled || !isSpeechSupported}
                    >
                        {isRecording ? (
                            <div className="relative">
                                <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
                            </div>
                        ) : (
                            <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        )}
                    </Button>

                    {/* Send button */}
                    <Button
                        type="button"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        onClick={handleSend}
                        disabled={disabled || !input.trim() || isRecording}
                    >
                        {disabled ? (
                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                        ) : (
                            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        )}
                    </Button>

                    {/* Desktop: Attach button */}
                    
                </div>

                {/* Recording indicator */}
                {isRecording && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <div className="flex space-x-1">
                            <div className="h-2 w-1 bg-red-500 rounded-full animate-pulse"></div>
                            <div className="h-2 w-1 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="h-2 w-1 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-xs text-red-600 font-medium">Listening...</span>
                    </div>
                )}
            </div>

            {/* Bottom controls - responsive */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between mt-1.5 sm:mt-2 px-1 gap-1.5 sm:gap-2">
                {/* Suggest button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs justify-start px-2 w-full xs:w-auto"
                    onClick={() => {
                        const suggestions = [
                            "Summarize this document",
                            "What are the key points?",
                            "Explain the main concepts",
                            "Find related information"
                        ];
                        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
                        setInput(randomSuggestion);
                    }}
                    disabled={isRecording}
                >
                    <Smile className="h-3 w-3 mr-1.5 flex-shrink-0" />
                    <span className="truncate">Suggest a question</span>
                </Button>

                {/* Keyboard hint */}
                <div className="flex items-center justify-between xs:justify-end gap-2 text-xs text-muted-foreground w-full xs:w-auto">
                    <div className="hidden sm:inline-flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs flex items-center gap-0.5">
                            <CornerDownLeft className="h-2.5 w-2.5" />
                            Enter
                        </kbd>
                        <span>to send</span>
                        <span className="mx-1">•</span>
                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Shift</kbd>
                        <span>+</span>
                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd>
                        <span>for new line</span>
                    </div>
                    <div className="sm:hidden flex items-center gap-1">
                        <span>Press</span>
                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs flex items-center gap-0.5">
                            <CornerDownLeft className="h-2.5 w-2.5" />
                            Send
                        </kbd>
                    </div>
                </div>
            </div>

           
        </div>
    );
}