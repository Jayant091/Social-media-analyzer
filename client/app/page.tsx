"use client";

import { useState } from 'react';
import axios from 'axios';

export default function SocialMediaContentAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [analysis, setAnalysis] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<{ wordCount: number, hashtagCount: number, hasCTA: boolean } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setExtractedText('');
      setAnalysis([]);
      setAnalytics(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      
      // Validate file type
      const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.bmp', '.tiff'];
      const fileExtension = '.' + droppedFile.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        setError('Invalid file type. Please upload PDF, JPG, PNG, BMP, or TIFF files.');
        return;
      }

      // Validate file size (10MB limit)
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        return;
      }

      setFile(droppedFile);
      setError('');
      setExtractedText('');
      setAnalysis([]);
      setAnalytics(null);
    }
  };

  const analyzeEngagement = (text: string): { suggestions: string[], analytics: { wordCount: number, hashtagCount: number, hasCTA: boolean } } => {
    const suggestions: string[] = [];
    
    // Count total words
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // Count hashtags
    const hashtagMatches = text.match(/#\w+/g);
    const hashtagCount = hashtagMatches ? hashtagMatches.length : 0;
    
    // Check for call-to-action words
    const ctaWords = ['follow', 'comment', 'share', 'like', 'subscribe', 'tag', 'mention', 'click', 'visit'];
    const hasCTA = ctaWords.some(word => 
      text.toLowerCase().includes(word)
    );
    
    // Check word count
    if (wordCount < 50) {
      suggestions.push('💡 Consider adding more detail to your content (currently ' + wordCount + ' words)');
    }
    
    if (wordCount > 200) {
      suggestions.push('✂️ Consider shortening your caption (currently ' + wordCount + ' words)');
    }
    
    // Check for hashtags
    if (hashtagCount === 0) {
      suggestions.push('#️⃣ Add relevant hashtags to increase visibility');
    }
    
    // Check for call-to-action
    if (!hasCTA) {
      suggestions.push('📢 Add a call-to-action to encourage engagement (e.g., "comment below", "share your thoughts")');
    }
    
    return {
      suggestions,
      analytics: {
        wordCount,
        hashtagCount,
        hasCTA
      }
    };
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const response = await axios.post(
  `${API_URL}/api/upload`,
  formData,
  {
    headers: { "Content-Type": "multipart/form-data" }
  }
);
      if (response.data.success) {
        setExtractedText(response.data.text);
        const analysisResult = analyzeEngagement(response.data.text);
        setAnalysis(analysisResult.suggestions);
        setAnalytics(analysisResult.analytics);
      } else {
        setError('Failed to extract text from file');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during file processing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-white mb-2 text-center">
            Social Media Content Analyzer
          </h1>
          <p className="text-gray-300 text-center mb-8">
            Extract text from PDFs and images using AI-powered OCR
          </p>

          <div className="space-y-6">
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff"
                className="hidden"
                id="file-upload"
                disabled={loading}
              />
              <label
                htmlFor="file-upload"
                className={`block w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                  isDragging 
                    ? 'border-indigo-400 bg-indigo-500/20 scale-[1.02]' 
                    : 'border-indigo-500/50 bg-white/5 hover:border-indigo-400 hover:bg-white/10'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <svg
                    className={`mx-auto h-12 w-12 mb-3 transition-colors duration-200 ${
                      isDragging ? 'text-indigo-300' : 'text-indigo-400'
                    }`}
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-white text-sm font-medium">
                    {isDragging 
                      ? 'Drop your file here...' 
                      : file 
                        ? file.name 
                        : 'Click to upload or drag and drop'
                    }
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    PDF, JPG, PNG, BMP, TIFF (MAX. 10MB)
                  </p>
                </div>
              </label>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Upload and Analyze</span>
              )}
            </button>

            {extractedText && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Extracted Content
                </h2>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-gray-200 text-sm whitespace-pre-wrap font-mono">
                    {extractedText}
                  </pre>
                </div>
                
                {analytics && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <span className="mr-2">📈</span>
                      Analytics Summary
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            {analytics.wordCount}
                          </div>
                          <div className="text-sm text-gray-400">Word Count</div>
                          <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                            analytics.wordCount >= 50 && analytics.wordCount <= 200 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {analytics.wordCount >= 50 && analytics.wordCount <= 200 ? '✓ Good Length' : '⚠ Adjust Length'}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            {analytics.hashtagCount}
                          </div>
                          <div className="text-sm text-gray-400">Hashtags</div>
                          <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                            analytics.hashtagCount > 0 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {analytics.hashtagCount > 0 ? '✓ Hashtags Found' : '⚠ Add Hashtags'}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            {analytics.hasCTA ? 'Yes' : 'No'}
                          </div>
                          <div className="text-sm text-gray-400">Call-to-Action</div>
                          <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                            analytics.hasCTA 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {analytics.hasCTA ? '✓ CTA Detected' : '⚠ Add CTA'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {analysis.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <span className="mr-2">📊</span>
                      Engagement Analysis
                    </h3>
                    <div className="space-y-2">
                      {analysis.map((suggestion, index) => (
                        <div
                          key={index}
                          className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3"
                        >
                          <p className="text-indigo-200 text-sm">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(extractedText);
                    }}
                    className="flex-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={() => {
                      setExtractedText('');
                      setAnalysis([]);
                      setAnalytics(null);
                      setFile(null);
                      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/50 text-gray-300 py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Clear & Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
