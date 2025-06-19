/* eslint-disable @typescript-eslint/no-unnecessary-condition */
'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Mic, MicOff, Volume2 } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TranslationInputProps {
  placeholder?: string;
  maxLength?: number;
  fromLanguage: string;
  onTranslate?: (text: string) => void;
}

export function TranslationInput({
  placeholder = 'Enter text to translate...',
  maxLength = 5000,
  fromLanguage,
  onTranslate,
}: TranslationInputProps) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const win = globalThis.window as typeof globalThis & {
      webkitSpeechRecognition?: typeof SpeechRecognition;
    };
    const SpeechRecognitionCtor =
      win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setRecognition(null);
      return;
    }
    const recognitionInstance = new SpeechRecognitionCtor();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = fromLanguage || 'en';

    recognitionInstance.onresult = function (event) {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputText(transcript);
    };

    const errorHandler = (event: Event) => {
      const errorEvent = event as SpeechRecognitionErrorEvent;
      console.error('Speech recognition error:', errorEvent.error);
      setIsRecording(false);
      toast({
        title: 'Voice input error',
        description: 'Unable to access microphone or recognize speech.',
        variant: 'destructive',
      });
    };
    recognitionInstance.addEventListener('error', errorHandler);

    recognitionInstance.onend = () => {
      setIsRecording(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      recognitionInstance.onresult = null;
      recognitionInstance.onend = null;
      recognitionInstance.removeEventListener('error', errorHandler);
      recognitionInstance.stop();
    };
  }, [fromLanguage, toast]);

  const toggleRecording = () => {
    if (!recognition) {
      toast({
        title: 'Voice input not supported',
        description: "Your browser doesn't support voice input.",
        variant: 'destructive',
      });
      return;
    }

    if (isRecording) {
      if (typeof recognition.stop === 'function') recognition.stop();
      setIsRecording(false);
    } else {
      if (typeof recognition.start === 'function') recognition.start();
      setIsRecording(true);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${String(textareaRef.current.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inputText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      toast({
        title: 'Copied to clipboard',
        description: 'Text has been copied successfully.',
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy text to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const speakText = () => {
    if ('speechSynthesis' in globalThis && inputText) {
      const utterance = new SpeechSynthesisUtterance(inputText);
      utterance.lang = fromLanguage || 'en';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="border border-gray-200/50 bg-white/50 p-6 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Source Text
          </h3>
          <div className="flex items-center gap-2">
            {inputText && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={speakText}
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
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </>
            )}
            <Button
              variant={isRecording ? 'destructive' : 'ghost'}
              size="sm"
              onClick={toggleRecording}
              className={`h-8 w-8 p-0 transition-all duration-200 ${
                isRecording ? 'animate-pulse' : ''
              }`}>
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onTranslate?.(inputText);
              }}
              disabled={!inputText}
              className="h-8 px-3">
              Translate
            </Button>
          </div>
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
            }}
            placeholder={placeholder}
            maxLength={maxLength}
            className="min-h-32 w-full resize-none rounded-lg border border-gray-200/50 bg-transparent p-4 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/50 focus:outline-none dark:border-gray-700/50 dark:text-gray-100 dark:placeholder-gray-400"
            style={{ lineHeight: '1.6' }}
          />
          {isRecording && (
            <div className="absolute top-4 right-4 flex items-center gap-2 text-sm text-red-500">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Recording...
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {inputText.length} / {maxLength} characters
          </span>
          {isRecording && (
            <span className="text-red-500">
              Click microphone to stop recording
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
