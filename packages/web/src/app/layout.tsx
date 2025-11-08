import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgentFoundry - The GitHub + App Store for AI Agents',
  description:
    'Build, validate, and publish reusable AI Skills that work seamlessly across Claude, GPT, and open-source models.',
  keywords: ['AI', 'Agents', 'Skills', 'Marketplace', 'Claude', 'GPT', 'MCP'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
