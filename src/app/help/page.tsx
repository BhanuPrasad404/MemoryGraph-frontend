'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Search,
    MessageCircle,
    Mail,
    ChevronRight,
    FileText,
    HelpCircle,
    BookOpen,
    Shield,
    Users,
    Download,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';

const faqs = [
    {
        question: 'How do I upload documents?',
        answer: 'Click the Upload button in the sidebar or drag and drop files directly into your dashboard.',
        category: 'getting-started'
    },
    {
        question: 'What file formats are supported?',
        answer: 'We support PDF, DOCX, TXT, and MD files. Maximum file size is 50MB.',
        category: 'documents'
    },
    {
        question: 'How does the graph visualization work?',
        answer: 'Your documents are analyzed and connections are created based on content similarity and named entities.',
        category: 'graph'
    },
    {
        question: 'Can I share documents with others?',
        answer: 'Yes, you can share documents via email or generate shareable links with customizable permissions.',
        category: 'sharing'
    },
    {
        question: 'Is my data secure?',
        answer: 'All data is encrypted at rest and in transit. We use industry-standard security practices.',
        category: 'security'
    },
    {
        question: 'How do I reset my password?',
        answer: 'Go to the login page and click "Forgot Password" to receive a reset link via email.',
        category: 'account'
    }
];

const categories = [
    { id: 'all', name: 'All questions', icon: HelpCircle, count: 6 },
    { id: 'getting-started', name: 'Getting Started', icon: BookOpen, count: 1 },
    { id: 'documents', name: 'Documents', icon: FileText, count: 1 },
    { id: 'graph', name: 'Graph', icon: Download, count: 1 },
    { id: 'sharing', name: 'Sharing', icon: Users, count: 1 },
    { id: 'security', name: 'Security', icon: Shield, count: 1 },
    { id: 'account', name: 'Account', icon: HelpCircle, count: 1 },
];

export default function HelpCenterPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Background Decoration - Subtle gradient orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
            </div>

            {/* Simple Header */}
            <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm relative z-10">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-300">Help</span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg shadow-purple-500/20">
                            <HelpCircle className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-100">
                            Help Center
                        </h1>
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                            <Sparkles className="h-3 w-3 text-purple-400" />
                            <span className="text-xs text-purple-400">24/7 Support</span>
                        </div>
                    </div>

                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            type="search"
                            placeholder="Search for answers..."
                            className="pl-9 h-10 w-full bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-600 focus:border-gray-600 focus:ring-1 focus:ring-gray-600 rounded-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
                {/* Categories Pills */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                                selectedCategory === category.id
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-600/20'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300 border border-gray-700'
                            )}
                        >
                            <category.icon className={cn(
                                "h-3.5 w-3.5",
                                selectedCategory === category.id ? "text-white" : "text-gray-500"
                            )} />
                            {category.name}
                            {category.count && (
                                <span className={cn(
                                    'ml-1 px-1.5 py-0.5 rounded-full text-[10px]',
                                    selectedCategory === category.id
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-700 text-gray-400'
                                )}>
                                    {category.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-3">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, index) => (
                            <div
                                key={index}
                                className="border border-gray-800 bg-gray-900/50 rounded-lg p-4 hover:border-gray-700 hover:bg-gray-900 transition-all duration-200"
                            >
                                <h3 className="font-medium text-gray-200 mb-1">
                                    {faq.question}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {faq.answer}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-lg">
                            <HelpCircle className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                            <h3 className="font-medium text-gray-300 mb-1">
                                No results found
                            </h3>
                            <p className="text-sm text-gray-600">
                                Try different keywords or browse categories
                            </p>
                        </div>
                    )}
                </div>

                {/* Still Need Help - Simple Card */}
                <div className="mt-8 border-t border-gray-800 pt-8">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg p-6 border border-gray-800">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="font-medium text-gray-200 mb-1">
                                    Still need help?
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Can't find what you're looking for? We're here to help.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                                    onClick={() => window.location.href = 'mailto:support@memorygraph.com'}
                                >
                                    <Mail className="h-4 w-4" />
                                    Email Support
                                </Button>
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <div className="border-t border-gray-800 py-6 bg-gray-900/50 backdrop-blur-sm relative z-10">
                <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-600">
                    © {new Date().getFullYear()} MemoryGraph AI. Help Center
                </div>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}