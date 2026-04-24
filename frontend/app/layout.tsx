import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StackRail Dashboard',
  description: 'Real-time event stream and persona viewer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <nav className="border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-600">StackRail</h1>
              <div className="flex gap-6">
                <a href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Dashboard
                </a>
                <a
                  href="/context"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Persona Viewer
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
