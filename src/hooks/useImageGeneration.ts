'use client';

import { useState, useCallback } from 'react';

interface GenerateImagesResponse {
  success: boolean;
  featuredImage?: string;
  mediaImages?: string[];
  prompts?: string[];
  error?: string;
}

export function useImageGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImages = useCallback(async (article: any): Promise<GenerateImagesResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ article }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate images: ${response.statusText}`);
      }

      const data = await response.json() as GenerateImagesResponse;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error generating images:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateImages,
    loading,
    error,
  };
}
