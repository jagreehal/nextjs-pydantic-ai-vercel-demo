'use client';

import { useState } from 'react';
import { Check, Copy, Volume2 } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TranslationOutputProps {
  translation: string;
  isLoading: boolean;
  toLanguage: string;
  error?: string;
}

export function TranslationOutput({
  translation,
  isLoading,
  toLanguage,
  error,
}: TranslationOutputProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!translation) return;

    try {
      await navigator.clipboard.writeText(translation);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      toast({
        title: 'Copied to clipboard',
        description: 'Translation has been copied successfully.',
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy translation to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const speakText = () => {
    if ('speechSynthesis' in globalThis && translation) {
      const utterance = new SpeechSynthesisUtterance(translation);
      utterance.lang = toLanguage || 'en';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="border border-gray-200/50 bg-white/50 p-6 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Translation
          </h3>
          {translation && !isLoading && !error && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  speakText();
                }}
                className="h-8 w-8 p-0">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  void handleCopy();
                }}
                className="h-8 w-8 p-0">
                {copied && <Check className="h-4 w-4 text-green-600" />}
                {!copied && <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>

        <div className="min-h-32 rounded-lg border border-gray-200/30 bg-gray-50/50 p-4 dark:border-gray-700/30 dark:bg-gray-800/50">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
          {!isLoading && error && (
            <div className="flex h-24 items-center justify-center text-red-500 dark:text-red-400">
              <p className="text-center">{error}</p>
            </div>
          )}
          {!isLoading && !error && translation && (
            <p className="leading-relaxed whitespace-pre-wrap text-gray-900 dark:text-gray-100">
              {translation}
            </p>
          )}
          {!isLoading && !error && !translation && (
            <div className="flex h-24 items-center justify-center text-gray-400 dark:text-gray-500">
              <p className="text-center">Translation will appear here...</p>
            </div>
          )}
        </div>

        {translation && !isLoading && !error && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {translation.length} characters
          </div>
        )}
      </div>
    </Card>
  );
}
