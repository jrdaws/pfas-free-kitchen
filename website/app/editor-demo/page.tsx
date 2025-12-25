"use client";

import { useState } from "react";
import { VisualEditor } from "@/app/components/editor/VisualEditor";
import { Button } from "@/components/ui/button";
import { Code, Eye } from "lucide-react";

const DEMO_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demo Page</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      color: #1a202c;
      margin: 0 0 20px 0;
      font-size: 2.5rem;
      font-weight: 700;
    }
    p {
      color: #4a5568;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    .button {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .button:hover {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .card {
      background: #f7fafc;
      padding: 24px;
      border-radius: 8px;
      margin-top: 24px;
      border-left: 4px solid #667eea;
    }
    .card h2 {
      color: #2d3748;
      margin: 0 0 12px 0;
      font-size: 1.5rem;
    }
    .card p {
      margin: 0;
      color: #718096;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to the Visual Editor</h1>
    <p>
      This is a demonstration of the Lovable-style visual editor. Click on any element
      to select it, then use the properties panel on the right to edit its styles and content.
    </p>
    <button class="button">Click Me!</button>

    <div class="card">
      <h2>Try It Out</h2>
      <p>
        Select this card and change its background color, or edit the text content.
        You can also use the element tree on the left to navigate through the page structure.
      </p>
    </div>

    <div class="card">
      <h2>Key Features</h2>
      <p>
        Hover over elements to see them highlighted with a dashed border.
        Click to select and see a solid blue border with resize handles.
        Press Escape to deselect.
      </p>
    </div>
  </div>
</body>
</html>
`;

export default function EditorDemoPage() {
  const [html, setHtml] = useState(DEMO_HTML);
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-terminal-bg">
      {/* Header */}
      <div className="border-b border-terminal-text/20 bg-terminal-bg p-4">
        <div className="flex items-center justify-between max-w-full">
          <div>
            <h1 className="text-xl font-display font-bold text-terminal-text">
              Visual Editor Demo
            </h1>
            <p className="text-xs text-terminal-dim mt-1">
              Click elements to edit • Press Escape to deselect
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCode(!showCode)}
              className="border-terminal-text/30 text-terminal-text hover:border-terminal-accent"
            >
              {showCode ? (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Show Editor
                </>
              ) : (
                <>
                  <Code className="mr-2 h-4 w-4" />
                  Show Code
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {showCode ? (
          <div className="h-full p-4">
            <div className="terminal-window h-full">
              <div className="terminal-header-modern">
                <span className="terminal-title">HTML Source</span>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-zinc-600" />
                  <div className="w-2 h-2 rounded-full bg-zinc-600" />
                  <div className="w-2 h-2 rounded-full bg-zinc-600" />
                </div>
              </div>
              <div className="terminal-content h-full overflow-auto">
                <pre className="text-xs text-terminal-text font-mono whitespace-pre-wrap">
                  {html}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <VisualEditor html={html} onHtmlChange={setHtml} />
        )}
      </div>
    </div>
  );
}
