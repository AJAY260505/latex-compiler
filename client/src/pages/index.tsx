import { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import debounce from 'lodash.debounce';
import { useTheme } from '../context/ThemeContext';
import { showError } from '../components/Toast';

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
  const { theme, toggleTheme } = useTheme();

  const compile = useCallback(
    debounce(async (code: string) => {
      setLoading(true);
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
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        compile(latex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [compile, latex]);

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">LaTeX Resume Builder</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button 
              onClick={() => compile(latex)}
              className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-800 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Compiling...' : 'Compile'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-160px)]">
          {/* Editor Panel */}
          <div className={`rounded-lg shadow-lg p-4 flex flex-col ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">LaTeX Editor</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                  Format
                </button>
                <button 
                  className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => setLatex('')}
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="latex"
                value={latex}
                onChange={(value = '') => {
                  setLatex(value);
                  compile(value);
                }}
                theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                options={{ 
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true
                }}
              />
            </div>
          </div>

          {/* Preview Panel */}
          <div className={`rounded-lg shadow-lg p-4 flex flex-col ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">PDF Preview</h2>
              {loading && (
                <div className="flex items-center text-blue-600">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded overflow-hidden">
              {pdfUrl && (
                <iframe 
                  src={pdfUrl}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg flex items-center gap-4 ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
          }`}>
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            <span className="text-lg">Generating PDF...</span>
          </div>
        </div>
      )}
    </div>
  );
}