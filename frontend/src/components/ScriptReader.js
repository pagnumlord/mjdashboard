// components/ScriptReader.js - Google Docs Viewer approach

import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, Copy, RefreshCw, Eye, Settings } from 'lucide-react';

const ScriptReader = () => {
  const [docUrl, setDocUrl] = useState('');
  const [viewerUrl, setViewerUrl] = useState('');
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Load saved URL on component mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('melodicJustice_script_url');
    const savedViewerUrl = localStorage.getItem('melodicJustice_script_viewer_url');
    
    if (savedUrl && savedViewerUrl) {
      setDocUrl(savedUrl);
      setViewerUrl(savedViewerUrl);
    }
  }, []);

  // Convert Google Docs sharing URL to embedded viewer URL
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    try {
      let processedUrl = docUrl.trim();
      
      // Handle different Google Docs URL formats
      if (processedUrl.includes('docs.google.com/document/d/')) {
        // Extract document ID
        const match = processedUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
          const docId = match[1];
          // Create embedded viewer URL that preserves formatting better
          const embeddedUrl = `https://docs.google.com/document/d/${docId}/preview`;
          setViewerUrl(embeddedUrl);
          
          // Save to localStorage
          localStorage.setItem('melodicJustice_script_url', docUrl);
          localStorage.setItem('melodicJustice_script_viewer_url', embeddedUrl);
        } else {
          setError('Could not extract document ID from URL');
        }
      } else {
        setError('Please enter a valid Google Docs URL');
      }
    } catch (err) {
      setError('Error processing URL: ' + err.message);
    }
  };

  const clearViewer = () => {
    setDocUrl('');
    setViewerUrl('');
    setError('');
    localStorage.removeItem('melodicJustice_script_url');
    localStorage.removeItem('melodicJustice_script_viewer_url');
  };

  const refreshViewer = () => {
    if (viewerUrl) {
      // Force refresh by adding timestamp
      const refreshUrl = viewerUrl.includes('?') 
        ? `${viewerUrl}&refresh=${Date.now()}` 
        : `${viewerUrl}?refresh=${Date.now()}`;
      setViewerUrl(refreshUrl);
    }
  };

  const copyInstructions = () => {
    const instructions = `How to set up your script in Google Docs:

1. Open your script document in Google Docs
2. Click the "Share" button (top right)
3. Change permissions to "Anyone with the link can view"
4. Copy the sharing URL
5. Paste it in the Script Reader

This will display your script with all original formatting preserved!`;
    
    navigator.clipboard.writeText(instructions);
    alert('Instructions copied to clipboard!');
  };

  return (
    <div className="rounded-lg p-6 fade-in shadow-xl" style={{ backgroundColor: '#2f2a2f' }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Script Reader</h2>
            <p className="text-gray-400">View your Google Docs script with original formatting preserved</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-all"
            title="Show setup instructions"
          >
            <Settings className="w-4 h-4" />
            Setup Help
          </button>
          
          {viewerUrl && (
            <>
              <button
                onClick={refreshViewer}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-all"
                title="Refresh document"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <a
                href={viewerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-all"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
                New Tab
              </a>
              
              <button
                onClick={clearViewer}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-all"
                title="Clear document"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Setup Instructions */}
      {showInstructions && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-white">Setup Instructions</h3>
            <button
              onClick={copyInstructions}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
          </div>
          <ol className="text-gray-300 space-y-2">
            <li className="flex items-start">
              <span className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
              <span>Open your script document in Google Docs</span>
            </li>
            <li className="flex items-start">
              <span className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
              <span>Click the <strong>"Share"</strong> button (top right corner)</span>
            </li>
            <li className="flex items-start">
              <span className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
              <span>Change permissions to <strong>"Anyone with the link can view"</strong></span>
            </li>
            <li className="flex items-start">
              <span className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
              <span>Copy the sharing URL from the share dialog</span>
            </li>
            <li className="flex items-start">
              <span className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">5</span>
              <span>Paste the URL in the field below and click "Load Document"</span>
            </li>
          </ol>
          <div className="mt-4 p-3 bg-green-900 bg-opacity-30 border border-green-800 rounded">
            <p className="text-green-100 text-sm">
              <strong>✓ Benefit:</strong> Your script will display with all original formatting, centering, fonts, and styling exactly as you created it!
            </p>
          </div>
        </div>
      )}

      {/* URL Input Form */}
      {!viewerUrl && (
        <div className="mb-6">
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-2 font-medium">Google Docs Script URL:</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/your-document-id/edit"
                  className="flex-grow px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
                >
                  Load Document
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                ⚠️ Make sure your document is set to <strong>"Anyone with the link can view"</strong>
              </p>
            </div>
            
            {error && (
              <div className="p-4 bg-red-900 bg-opacity-30 border border-red-800 rounded-lg">
                <p className="text-red-100">{error}</p>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Document Viewer */}
      {viewerUrl ? (
        <div className="bg-white rounded-lg shadow-inner overflow-hidden" style={{ minHeight: '75vh' }}>
          <iframe
            src={viewerUrl}
            className="w-full rounded-lg"
            style={{ 
              height: '75vh', 
              border: 'none',
              backgroundColor: 'white'
            }}
            title="Google Docs Script Viewer"
            allow="fullscreen"
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-inner flex flex-col items-center justify-center text-center p-8" style={{ minHeight: '70vh' }}>
          <FileText className="w-20 h-20 mb-6 opacity-30 text-gray-400" />
          <h3 className="text-xl font-semibold mb-3 text-gray-700">No Script Loaded</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Connect your Google Docs script to view it with perfect formatting preservation
          </p>
          
          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-6 rounded-xl border border-cyan-200 max-w-lg">
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-cyan-600 mr-2" />
              <h4 className="font-semibold text-gray-800">Why use Google Docs viewer?</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-2 text-left">
              <li className="flex items-start">
                <span className="text-green-500 font-bold mr-2">✓</span>
                <span><strong>Perfect formatting:</strong> Character names centered, dialogue indented</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 font-bold mr-2">✓</span>
                <span><strong>Original fonts & styling:</strong> Exactly as you designed it</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 font-bold mr-2">✓</span>
                <span><strong>No conversion errors:</strong> No more formatting disasters</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 font-bold mr-2">✓</span>
                <span><strong>Always up-to-date:</strong> Changes sync automatically</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptReader;