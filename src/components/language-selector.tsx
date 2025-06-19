'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';

interface Language {
  code: string;
  name: string;
  flag: string;
  popular?: boolean;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', popular: true },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', popular: true },
  { code: 'fr', name: 'French', flag: '🇫🇷', popular: true },
  { code: 'de', name: 'German', flag: '🇩🇪', popular: true },
  { code: 'it', name: 'Italian', flag: '🇮🇹', popular: true },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', popular: true },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', popular: true },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', popular: true },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', popular: true },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
];

interface LanguageSelectorProps {
  fromLanguage: string;
  toLanguage: string;
  onFromLanguageChange: (language: string) => void;
  onToLanguageChange: (language: string) => void;
  onSwapLanguages: () => void;
  detectedLanguage?: string;
}

export function LanguageSelector({
  fromLanguage,
  toLanguage,
  onFromLanguageChange,
  onToLanguageChange,
  onSwapLanguages,
  detectedLanguage,
}: LanguageSelectorProps) {
  const [recentLanguages, setRecentLanguages] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recent-languages');
    if (stored) {
      setRecentLanguages(JSON.parse(stored) as string[]);
    }
  }, []);

  const addToRecent = (languageCode: string) => {
    const updated = [
      languageCode,
      ...recentLanguages.filter((l) => l !== languageCode),
    ].slice(0, 5);
    setRecentLanguages(updated);
    localStorage.setItem('recent-languages', JSON.stringify(updated));
  };

  const handleFromLanguageChange = (language: string) => {
    onFromLanguageChange(language);
    addToRecent(language);
  };

  const handleToLanguageChange = (language: string) => {
    onToLanguageChange(language);
    addToRecent(language);
  };

  const allLanguages = LANGUAGES;
  const recentLangs = useMemo(
    () =>
      recentLanguages
        .map((code) => LANGUAGES.find((l) => l.code === code))
        .filter(Boolean) as Language[],
    [recentLanguages],
  );

  const getLanguageOptions = useMemo(() => {
    return (excludeCode?: string) => {
      const filtered = allLanguages.filter((l) => l.code !== excludeCode);
      const popular = filtered.filter((l) => l.popular);
      const recent = recentLangs.filter(
        (l) =>
          l.code !== excludeCode && !popular.some((p) => p.code === l.code),
      );
      const others = filtered.filter(
        (l) => !l.popular && !recent.some((r) => r.code === l.code),
      );
      const options = [
        ...popular.map((l) => ({ value: l.code, label: l.name, flag: l.flag })),
        ...(recent.length > 0
          ? [
              { value: 'separator-recent', label: '── Recent ──', flag: '' },
              ...recent.map((l) => ({
                value: l.code,
                label: l.name,
                flag: l.flag,
              })),
            ]
          : []),
        { value: 'separator-all', label: '── All Languages ──', flag: '' },
        ...others.map((l) => ({ value: l.code, label: l.name, flag: l.flag })),
      ];
      // Remove separator options at the start/end
      return options.filter(
        (option, idx) =>
          !option.value.startsWith('separator') ||
          (idx !== 0 && idx !== options.length - 1),
      );
    };
  }, [allLanguages, recentLangs]);

  const getLanguageName = (code: string) => {
    return LANGUAGES.find((l) => l.code === code)?.name ?? code;
  };

  return (
    <Card className="border border-gray-200/50 bg-white/50 p-6 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/50">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              From
            </span>
            {detectedLanguage && detectedLanguage !== fromLanguage && (
              <span className="text-xs text-blue-600 dark:text-blue-400">
                (Detected: {getLanguageName(detectedLanguage)})
              </span>
            )}
          </div>
          <Combobox
            options={getLanguageOptions(toLanguage)}
            value={fromLanguage}
            onValueChange={handleFromLanguageChange}
            placeholder="Select source language"
            searchPlaceholder="Search languages..."
            emptyText="No language found."
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onSwapLanguages}
          className="mt-6 rounded-full bg-blue-100 transition-all duration-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
          disabled={!fromLanguage || !toLanguage}>
          <ArrowLeftRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </Button>

        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              To
            </span>
          </div>
          <Combobox
            options={getLanguageOptions(fromLanguage)}
            value={toLanguage}
            onValueChange={handleToLanguageChange}
            placeholder="Select target language"
            searchPlaceholder="Search languages..."
            emptyText="No language found."
          />
        </div>
      </div>
    </Card>
  );
}
