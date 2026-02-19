import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';
import { Brain } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Decoration - Subtle gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Simple Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm relative z-10">
        <div className="container p-4 flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20 group-hover:shadow-purple-600/30 transition-all">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-100 group-hover:text-white transition-colors">MemoryGraph AI</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container flex items-center justify-center py-12 px-4 relative z-10">
        <div className="w-full flex justify-center">
          <LoginForm />
        </div>
      </div>

      {/* Simple Footer */}
      <div className="border-t border-gray-800 py-6 bg-gray-900/50 backdrop-blur-sm relative z-10">
        <div className="container text-center text-sm text-gray-600">
          © {new Date().getFullYear()} MemoryGraph AI. Transform documents into knowledge.
        </div>
      </div>
    </div>
  );
}