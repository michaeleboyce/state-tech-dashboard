import './globals.css';
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'State & Local Government Tech Events',
  description: 'Dashboard of upcoming technology-related events in state and local governments',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50"><StackProvider app={stackServerApp}><StackTheme>
        <header className="bg-primary text-white p-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">State & Local Gov Tech Events</h1>
          </div>
        </header>
        <main className="container mx-auto p-4">{children}</main>
        <footer className="bg-gray-100 p-4 mt-8">
          <div className="container mx-auto text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} State Tech Dashboard
          </div>
        </footer>
      </StackTheme></StackProvider></body>
    </html>
  );
}