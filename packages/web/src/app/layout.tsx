import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CommandPaletteProvider } from '@/components/CommandPaletteProvider';

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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CommandPaletteProvider>
            {children}
          </CommandPaletteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
