import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgentFoundry - Infrastructure Skills for AI Agents',
  description:
    'The AWS of AI agents. Infrastructure skills that make all other skills work better. Error recovery, health monitoring, and agent reliability.',
  keywords: ['AI', 'Agents', 'Infrastructure', 'Error Recovery', 'Reliability', 'MCP', 'Claude'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
