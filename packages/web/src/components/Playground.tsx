'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CodeBlock } from '@/components/ui/CodeBlock';

interface PlaygroundTool {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  exampleInput: any;
  exampleOutput: any;
}

interface PlaygroundProps {
  skillName: string;
  tools: PlaygroundTool[];
}

export function Playground({ skillName, tools }: PlaygroundProps) {
  const [selectedTool, setSelectedTool] = useState(0);
  const [input, setInput] = useState(JSON.stringify(tools[0]?.exampleInput || {}, null, 2));
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const currentTool = tools[selectedTool];

  const handleRun = async () => {
    setIsLoading(true);
    setError('');
    setOutput('');

    try {
      // Validate JSON
      const parsedInput = JSON.parse(input);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // For demo purposes, return example output
      // In production, this would make actual API calls
      const result = currentTool.exampleOutput;
      setOutput(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setError(err.message || 'Invalid JSON input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolChange = (index: number) => {
    setSelectedTool(index);
    setInput(JSON.stringify(tools[index]?.exampleInput || {}, null, 2));
    setOutput('');
    setError('');
  };

  const handleLoadExample = () => {
    setInput(JSON.stringify(currentTool.exampleInput, null, 2));
    setOutput('');
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Tool Selector */}
      <div className="flex flex-wrap gap-2">
        {tools.map((tool, index) => (
          <Button
            key={tool.name}
            variant={selectedTool === index ? 'default' : 'outline'}
            onClick={() => handleToolChange(index)}
          >
            {tool.name}
          </Button>
        ))}
      </div>

      {/* Current Tool Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-mono">{currentTool.name}</CardTitle>
              <CardDescription>{currentTool.description}</CardDescription>
            </div>
            <Badge variant="default">Interactive Demo</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Panel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Input</h4>
                <Button size="sm" variant="ghost" onClick={handleLoadExample}>
                  Load Example
                </Button>
              </div>
              <textarea
                className="w-full h-64 p-4 bg-slate-900 text-slate-200 font-mono text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter JSON input..."
              />
              <Button
                className="w-full"
                onClick={handleRun}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Running...
                  </>
                ) : (
                  <>
                    <span className="mr-2">▶️</span>
                    Run Tool
                  </>
                )}
              </Button>
            </div>

            {/* Output Panel */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Output</h4>
              {error ? (
                <div className="w-full h-64 p-4 bg-destructive/10 border border-destructive/30 rounded-lg overflow-auto">
                  <p className="text-destructive font-mono text-sm">{error}</p>
                </div>
              ) : output ? (
                <div className="w-full h-64 bg-slate-900 rounded-lg overflow-auto">
                  <CodeBlock language="json" code={output} />
                </div>
              ) : (
                <div className="w-full h-64 p-4 bg-slate-900/50 border border-border rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">
                    Output will appear here after running the tool
                  </p>
                </div>
              )}
              {output && !error && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                  <p className="text-sm text-accent">
                    ✓ Tool executed successfully
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm">
        <p className="font-semibold mb-2">Demo Mode</p>
        <p className="text-muted-foreground">
          This is an interactive demo using example data. To use real {skillName} in production,{' '}
          <a href="/guides" className="text-primary hover:underline">
            install the skill via one of our integration methods
          </a>.
        </p>
      </div>
    </div>
  );
}
