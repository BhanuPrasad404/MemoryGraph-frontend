import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';
import { Brain } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Simple Header */}
      <div className="border-b">
        <div className="container p-4 flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">MemoryGraph AI</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container flex items-center justify-center py-12 px-4">
       <div className="w-full flex justify-center">
          <LoginForm />
        </div>
      </div>

      {/* Simple Footer */}
      <div className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MemoryGraph AI. Transform documents into knowledge.
        </div>
      </div>
    </div>
  );
}