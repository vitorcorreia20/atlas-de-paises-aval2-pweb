import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Atlas de Países',
  description: 'Exploração de dados demográficos e lista de países de interesse',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        <header className="bg-blue-900 text-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
            >
              🌐 Atlas de Países
            </Link>
            <nav aria-label="Navegação principal">
              <ul className="flex gap-6 text-sm font-medium">
                <li>
                  <Link
                    href="/"
                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 py-1"
                  >
                    Catálogo de Países
                  </Link>
                </li>
                <li>
                  <Link
                    href="/travel-list"
                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 py-1"
                  >
                    Países de Interesse
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
          {children}
        </main>

        <footer className="bg-slate-800 text-slate-300 text-center py-4 text-sm mt-8">
          <p>Trabalho Prático — React, Next.js e SQLite</p>
        </footer>
      </body>
    </html>
  );
}
