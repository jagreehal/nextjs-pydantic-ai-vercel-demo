'use client';

import { useCallback, useEffect, useState } from 'react';
import { Languages } from 'lucide-react';

import { detectLanguage } from '@/lib/translation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/language-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { TranslationInput } from '@/components/translation-input';
import { TranslationOutput } from '@/components/translation-output';
import { translateText } from '@/app/actions';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState('');
  const [fromLanguage, setFromLanguage] = useState('en');
  const [toLanguage, setToLanguage] = useState('es');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleTranslate = (text: string) => {
    setInputText(text);
    void debouncedTranslate(text, fromLanguage, toLanguage);
  };

  // Debounced translation function
  const debouncedTranslate = useCallback(
    async (text: string, fromLanguage: string, toLanguage: string) => {
      if (!text.trim() || !fromLanguage || !toLanguage) {
        setTranslation('');
        setError('');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const result = await translateText({
          text,
          fromLanguage,
          toLanguage,
        });
        setTranslation(result);
      } catch {
        setError('Translation failed. Please try again.');
        setTranslation('');
        toast({
          title: 'Translation Error',
          description:
            'Unable to translate text. Please check your connection and try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      void debouncedTranslate(inputText, fromLanguage, toLanguage);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [inputText, fromLanguage, toLanguage, debouncedTranslate]);

  // Language detection effect
  useEffect(() => {
    if (inputText.trim().length > 10) {
      const detected = detectLanguage(inputText);
      setDetectedLanguage(detected);
    } else {
      setDetectedLanguage('');
    }
  }, [inputText]);

  const handleSwapLanguages = () => {
    const tempLang = fromLanguage;
    setFromLanguage(toLanguage);
    setToLanguage(tempLang);

    // Swap the text as well
    const tempText = inputText;
    setInputText(translation);
    setTranslation(tempText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/70 backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-900/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-2">
                <Languages className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Langslate?
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  From voice to text, and text to voice, we&apos;re speaking
                  your language.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="https://github.com/jagreehal/translati"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.468-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.984-.399 3.003-.404 1.018.005 2.046.138 3.006.404 2.289-1.552 3.295-1.23 3.295-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="hidden sm:inline">Star on GitHub</span>
                </a>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
              Langslate with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Confidence
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Experience AI powered translation with real-time voice input,
              lightning-fast results, and expert-level accuracy in 20+
              languages.
            </p>
          </div>

          <LanguageSelector
            fromLanguage={fromLanguage}
            toLanguage={toLanguage}
            onFromLanguageChange={setFromLanguage}
            onToLanguageChange={setToLanguage}
            onSwapLanguages={handleSwapLanguages}
            detectedLanguage={detectedLanguage}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <TranslationInput
              fromLanguage={fromLanguage}
              onTranslate={handleTranslate}
            />

            <TranslationOutput
              translation={translation}
              isLoading={isLoading}
              toLanguage={toLanguage}
              error={error}
            />
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Voice Input',
                description: 'Speak naturally and get instant text conversion',
                icon: '🎤',
              },
              {
                title: 'Real-time Translation',
                description:
                  'See translations as you type with smart debouncing',
                icon: '⚡',
              },
              {
                title: 'Language Detection',
                description: 'Automatic detection of source language',
                icon: '🔍',
              },
              {
                title: 'Copy & Share',
                description: 'Easy copying and text-to-speech functionality',
                icon: '📋',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200/50 bg-white/50 p-6 backdrop-blur-sm transition-all duration-200 hover:bg-white/70 dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:bg-gray-800/70">
                <div className="mb-3 text-3xl">{feature.icon}</div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
