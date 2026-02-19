'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  FileText,
  BrainCircuit,
  Network,
  Sparkles,
  Rocket,
  Zap,
  Activity,
  Cpu,
  Gauge
} from 'lucide-react';
import { useUploadWebSocket } from '@/hooks/useUploadWebSocket';
import { cn } from '@/lib/utils';

interface ProcessingProgressProps {
  documentId: string;
  filename: string;
  onComplete?: () => void;
}

const PROCESSING_STEPS = [
  {
    id: 1,
    name: 'Uploading to Storage',
    icon: Upload,
    gradient: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-500/10',
    textLight: 'text-blue-400',
    weight: 10
  },
  {
    id: 2,
    name: 'Creating Document Record',
    icon: FileText,
    gradient: 'from-green-500 to-emerald-500',
    bgLight: 'bg-green-500/10',
    textLight: 'text-green-400',
    weight: 10
  },
  {
    id: 3,
    name: 'Extracting Text Content',
    icon: FileText,
    gradient: 'from-purple-500 to-pink-500',
    bgLight: 'bg-purple-500/10',
    textLight: 'text-purple-400',
    weight: 15
  },
  {
    id: 4,
    name: 'Creating Knowledge Chunks',
    icon: BrainCircuit,
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-500/10',
    textLight: 'text-amber-400',
    weight: 15
  },
  {
    id: 5,
    name: 'Generating AI Embeddings',
    icon: Sparkles,
    gradient: 'from-pink-500 to-rose-500',
    bgLight: 'bg-pink-500/10',
    textLight: 'text-pink-400',
    weight: 25
  },
  {
    id: 6,
    name: 'Building Knowledge Graph',
    icon: Network,
    gradient: 'from-indigo-500 to-purple-500',
    bgLight: 'bg-indigo-500/10',
    textLight: 'text-indigo-400',
    weight: 15
  },
  {
    id: 7,
    name: 'Finalizing Document',
    icon: Rocket,
    gradient: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-500/10',
    textLight: 'text-emerald-400',
    weight: 10
  },
];

export function ProcessingProgress({ documentId, filename, onComplete }: ProcessingProgressProps) {
  const [userId, setUserId] = useState<string>('');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user ID from localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      try {
        if (token.startsWith('eyJ')) {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const userId = payload.sub || payload.user_id || payload.userId || payload.id || 'current-user';
            setUserId(userId);
          } else {
            setUserId('current-user');
          }
        } else {
          const parsed = JSON.parse(token);
          const userId = parsed?.user?.id || parsed?.userId || parsed?.sub || parsed?.id || 'current-user';
          setUserId(userId);
        }
      } catch (error) {
        console.error('Failed to parse token:', error);
        setUserId('current-user');
      }
    } else {
      setUserId('current-user');
    }
  }, []);

  // Use WebSocket for live updates
  const {
    isConnected,
    progress,
    estimatedTime,
    reconnect
  } = useUploadWebSocket({
    documentId,
    userId,
    onProgress: (data) => {
      console.log('Progress update:', data);
    },
    onComplete: (data) => {
      setCompleted(true);
      if (onComplete) onComplete();
    },
    onError: (error) => {
      setError(error);
    }
  });

  // Calculate current step
  const currentStep = progress?.step || 1;
  const currentProgress = progress?.progress || 0;
  const currentMessage = progress?.message || 'Starting processing...';

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const getStepIcon = (stepId: number, step: typeof PROCESSING_STEPS[0]) => {
    const status = getStepStatus(stepId);
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'current':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-400" />;
      default:
        return <step.icon className="h-5 w-5 text-gray-600" />;
    }
  };

  // Show loading while getting user ID
  if (!userId) {
    return (
      <div className="min-h-screen bg-black">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-gray-500">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-6 sm:py-8 md:py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Decoration - Subtle for dark theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-amber-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 relative z-10">
        {/* Header with Gradient */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 backdrop-blur-sm">
            {isConnected ? (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-25"></div>
                  <div className="relative h-2 w-2 rounded-full bg-green-400"></div>
                </div>
                <span className="text-sm font-medium text-green-400">
                  Live Processing
                </span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm font-medium text-amber-400">
                  Connecting...
                </span>
              </>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-100">
              Processing Document
            </h1>
            <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto px-4">
              Your document <span className="font-semibold text-blue-400">"{filename}"</span> is being transformed into an intelligent knowledge graph
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <Badge variant="outline" className="px-3 py-1.5 bg-gray-900 border-gray-800 text-gray-300">
              <Activity className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
              <span className="text-xs font-medium">Real-time</span>
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 bg-gray-900 border-gray-800 text-gray-300">
              <Cpu className="h-3.5 w-3.5 mr-1.5 text-purple-400" />
              <span className="text-xs font-medium">AI Powered</span>
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 bg-gray-900 border-gray-800 text-gray-300">
              <Gauge className="h-3.5 w-3.5 mr-1.5 text-green-400" />
              <span className="text-xs font-medium">High Performance</span>
            </Badge>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="border-red-900 bg-red-950/50 text-red-400">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Completion Message */}
        {completed && (
          <Alert className="border-green-900 bg-green-950/50">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              Document processing completed! Redirecting to document page...
            </AlertDescription>
          </Alert>
        )}

        {/* Main Progress Card */}
        <Card className="border-0 bg-gray-900/90 backdrop-blur-sm overflow-hidden shadow-2xl shadow-purple-500/5">
          {/* Top Gradient Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <CardHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-100">
                Processing Pipeline
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                {estimatedTime && (
                  <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border-gray-700 text-gray-300">
                    <Clock className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs font-medium">{estimatedTime} remaining</span>
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    "px-3 py-1.5",
                    isConnected
                      ? "bg-green-950/30 border-green-800 text-green-400"
                      : "bg-amber-950/30 border-amber-800 text-amber-400"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      isConnected ? "bg-green-400 animate-pulse" : "bg-amber-400 animate-pulse"
                    )} />
                    <span className="text-xs font-medium">{isConnected ? 'Live' : 'Offline'}</span>
                  </div>
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* Overall Progress Bar */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-400">Overall Progress</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-blue-400">
                    {currentProgress.toFixed(1)}%
                  </span>
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                    {PROCESSING_STEPS.find(s => s.id === currentStep)?.name || 'Processing'}
                  </Badge>
                </div>
              </div>
              <div className="relative">
                <Progress value={currentProgress} className="h-3 bg-gray-800" />
                <div
                  className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center animate-pulse">
                {currentMessage}
              </p>
            </div>

            {/* Step-by-Step Progress */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                Processing Steps
              </h3>
              <div className="relative">
                {/* Vertical Line - Hidden on mobile, shown on larger screens */}
                <div className="hidden sm:block absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {PROCESSING_STEPS.map((step) => {
                    const status = getStepStatus(step.id);
                    return (
                      <div
                        key={step.id}
                        className={cn(
                          "relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-300",
                          status === 'completed' && "border-green-900 bg-green-950/20",
                          status === 'current' && "border-blue-900 bg-blue-950/20 shadow-lg shadow-blue-500/10 scale-[1.02]",
                          status === 'pending' && "border-gray-800 bg-gray-900"
                        )}
                      >
                        {/* Step Number Badge */}
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          status === 'completed' && "bg-green-500/20 text-green-400",
                          status === 'current' && "bg-blue-500/20 text-blue-400 animate-pulse",
                          status === 'pending' && "bg-gray-800 text-gray-500"
                        )}>
                          {step.id}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={cn(
                              "text-sm font-medium truncate",
                              status === 'completed' && "text-green-400",
                              status === 'current' && "text-blue-400",
                              status === 'pending' && "text-gray-500"
                            )}>
                              {step.name}
                            </h4>
                            <span className="text-xs text-gray-600 ml-2 shrink-0">
                              {step.weight}%
                            </span>
                          </div>

                          {/* Progress indicator for current step */}
                          {status === 'current' && (
                            <div className="mt-2">
                              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${((currentProgress - PROCESSING_STEPS.slice(0, step.id - 1).reduce((acc, s) => acc + s.weight, 0)) / step.weight) * 100}%`
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status Icon */}
                        <div className="shrink-0">
                          {status === 'completed' && (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          )}
                          {status === 'current' && (
                            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                          )}
                          {status === 'pending' && (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-700" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-800">
              <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-purple-400" />
                You can leave this page - processing will continue in the background
              </p>
              <Button
                variant="outline"
                onClick={reconnect}
                disabled={isConnected}
                className="w-full sm:w-auto border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                {isConnected ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                    Connected
                  </>
                ) : (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reconnect
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}