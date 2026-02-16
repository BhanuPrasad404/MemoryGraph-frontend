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
    Download
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
    { id: 'all', name: 'All questions', icon: HelpCircle },
    { id: 'getting-started', name: 'Getting Started', icon: BookOpen, count: 4 },
    { id: 'documents', name: 'Documents', icon: FileText, count: 6 },
    { id: 'graph', name: 'Graph', icon: Download, count: 3 },
    { id: 'sharing', name: 'Sharing', icon: Users, count: 2 },
    { id: 'security', name: 'Security', icon: Shield, count: 5 },
    { id: 'account', name: 'Account', icon: HelpCircle, count: 5 },
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
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Simple Header */}
            <div className="border-b">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-gray-900">Home</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-gray-900">Help</span>
                    </div>

                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Help Center
                    </h1>

                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search for answers..."
                            className="pl-9 h-10 w-full bg-gray-50 dark:bg-gray-800 border-0 focus-visible:ring-1 focus-visible:ring-gray-200 rounded-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Categories Pills */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                                selectedCategory === category.id
                                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            )}
                        >
                            <category.icon className="h-3.5 w-3.5" />
                            {category.name}
                            {category.count && (
                                <span className={cn(
                                    'ml-1 px-1.5 py-0.5 rounded-full text-[10px]',
                                    selectedCategory === category.id
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
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
                                className="border rounded-lg p-4 hover:border-gray-300 transition-colors"
                            >
                                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                    {faq.question}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {faq.answer}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <HelpCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                No results found
                            </h3>
                            <p className="text-sm text-gray-500">
                                Try different keywords or browse categories
                            </p>
                        </div>
                    )}
                </div>

                {/* Still Need Help - Simple Card */}
                <div className="mt-8 border-t pt-8">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                    Still need help?
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Can't find what you're looking for? We're here to help.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => window.location.href = 'mailto:support@memorygraph.com'}
                                >
                                    <Mail className="h-4 w-4" />
                                    Email
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}