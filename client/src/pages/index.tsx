import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import debounce from 'lodash.debounce';

export default function Home() {
  const [latex, setLatex] = useState(`\\documentclass{article}
\\begin{document}
\\section*{John Doe}
\\subsection*{Education}
\\textbf{MIT} \\hfill 2020-2024\\\\
Computer Science

\\subsection*{Skills}
\\begin{itemize}
  \\item LaTeX
  \\item Next.js
  \\item Docker
\\end{itemize}
\\end{document}`);
  
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const compile = useCallback(
    debounce(async (code: string) => {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch('http://localhost:3001/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latex: code })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.log || 'Compilation failed');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }, 1000),
    [] // debounce is stable across renders
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>LaTeX Resume Builder</h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2rem', 
        marginTop: '2rem',
        height: '80vh'
      }}>
        <div style={{ border: '1px solid #ddd', borderRadius: '8px' }}>
          <Editor
            height="100%"
            defaultLanguage="latex"
            value={latex}
            onChange={(value = '') => {
              setLatex(value);
              compile(value);
            }}
            options={{ 
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true
            }}
          />
        </div>
        
        <div style={{ border: '1px solid #ddd', borderRadius: '8px' }}>
          {loading && <div style={{ padding: '1rem' }}>Compiling...</div>}
          {error && <div style={{ padding: '1rem', color: 'red' }}>{error}</div>}
          {pdfUrl && (
            <iframe 
              src={pdfUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="PDF Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}