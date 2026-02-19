import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Upload, Search, Network, Sparkles, Shield, Zap, Globe } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Decoration - Subtle gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/50 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">AI-Powered Knowledge Management</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-gray-100">Transform Documents Into </span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Living Knowledge
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-500">
            MemoryGraph AI combines RAG with Knowledge Graphs to create your personal
            knowledge operating system. Go beyond search—understand connections,
            visualize relationships, and interact with your information intelligently.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-purple-600/20 transition-all duration-200 hover:scale-105 active:scale-95">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-100">How MemoryGraph AI Works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-xl shadow-purple-500/5 transition-all hover:shadow-2xl hover:shadow-purple-500/10 hover:border-gray-700">
            <div className="mb-4 inline-flex rounded-lg bg-blue-500/10 p-3 border border-blue-500/20">
              <Upload className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-200">1. Upload Documents</h3>
            <p className="text-gray-500">
              Upload PDFs, text files, markdown, and more. Our AI automatically processes
              and understands your content.
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-xl shadow-purple-500/5 transition-all hover:shadow-2xl hover:shadow-purple-500/10 hover:border-gray-700">
            <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-3 border border-purple-500/20">
              <Network className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-200">2. Build Knowledge Graph</h3>
            <p className="text-gray-500">
              Automatically extract entities and relationships to create an interactive
              visual knowledge graph of your documents.
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-xl shadow-purple-500/5 transition-all hover:shadow-2xl hover:shadow-purple-500/10 hover:border-gray-700">
            <div className="mb-4 inline-flex rounded-lg bg-pink-500/10 p-3 border border-pink-500/20">
              <Search className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-200">3. Ask & Discover</h3>
            <p className="text-gray-500">
              Ask questions in natural language. Get AI-powered answers with citations and
              explore related concepts visually.
            </p>
          </div>
        </div>
      </div>

     

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-8 text-center shadow-2xl shadow-purple-500/5">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold text-gray-100">Ready to Transform Your Knowledge Management?</h2>
            <p className="mb-8 text-lg text-gray-500">
              Join researchers, students, and professionals who are already using
              MemoryGraph AI to unlock the full potential of their documents.
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-purple-600/20 transition-all duration-200 hover:scale-105 active:scale-95">
                Start Your Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 py-8 bg-gray-900/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-semibold text-gray-300">MemoryGraph AI</span>
            </div>
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} MemoryGraph AI. All rights reserved.
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}