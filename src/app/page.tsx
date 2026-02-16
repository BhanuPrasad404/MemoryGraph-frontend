import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Upload, Search, Network, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Knowledge Management</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Transform Documents Into{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Living Knowledge
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
            MemoryGraph AI combines RAG with Knowledge Graphs to create your personal
            knowledge operating system. Go beyond search—understand connections,
            visualize relationships, and interact with your information intelligently.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">How MemoryGraph AI Works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
              <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">1. Upload Documents</h3>
            <p className="text-muted-foreground">
              Upload PDFs, text files, markdown, and more. Our AI automatically processes
              and understands your content.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
              <Network className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">2. Build Knowledge Graph</h3>
            <p className="text-muted-foreground">
              Automatically extract entities and relationships to create an interactive
              visual knowledge graph of your documents.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 inline-flex rounded-lg bg-pink-100 p-3 dark:bg-pink-900/20">
              <Search className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">3. Ask & Discover</h3>
            <p className="text-muted-foreground">
              Ask questions in natural language. Get AI-powered answers with citations and
              explore related concepts visually.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-purple-50 p-8 text-center dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold">Ready to Transform Your Knowledge Management?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join researchers, students, and professionals who are already using
              MemoryGraph AI to unlock the full potential of their documents.
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Your Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}