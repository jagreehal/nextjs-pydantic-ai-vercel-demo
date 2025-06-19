// Mock translation service - In production, you would integrate with Google Translate API, DeepL, etc.
export async function translateTextStub(
  text: string,
  fromLanguage: string,
  toLanguage: string,
): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) =>
    setTimeout(resolve, 800 + Math.random() * 400),
  );

  // Mock translations for demo purposes
  const mockTranslations: Record<string, Record<string, string>> = {
    'Hello, how are you?': {
      es: 'Hola, ¿cómo estás?',
      fr: 'Bonjour, comment allez-vous?',
      de: 'Hallo, wie geht es dir?',
      it: 'Ciao, come stai?',
      pt: 'Olá, como você está?',
      ru: 'Привет, как дела?',
      ja: 'こんにちは、元気ですか？',
      ko: '안녕하세요, 어떻게 지내세요?',
      zh: '你好，你好吗？',
    },
    'Thank you very much': {
      es: 'Muchas gracias',
      fr: 'Merci beaucoup',
      de: 'Vielen Dank',
      it: 'Grazie mille',
      pt: 'Muito obrigado',
      ru: 'Большое спасибо',
      ja: 'どうもありがとうございます',
      ko: '정말 고맙습니다',
      zh: '非常感谢',
    },
    'Good morning': {
      es: 'Buenos días',
      fr: 'Bonjour',
      de: 'Guten Morgen',
      it: 'Buongiorno',
      pt: 'Bom dia',
      ru: 'Доброе утро',
      ja: 'おはようございます',
      ko: '좋은 아침입니다',
      zh: '早上好',
    },
  };

  // Check for exact matches first
  if (
    Object.prototype.hasOwnProperty.call(mockTranslations, text) &&
    mockTranslations[text][toLanguage]
  ) {
    return mockTranslations[text][toLanguage];
  }

  // For demo purposes, generate a mock translation
  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ru: 'Russian',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ar: 'Arabic',
    hi: 'Hindi',
    th: 'Thai',
    vi: 'Vietnamese',
    tr: 'Turkish',
    pl: 'Polish',
    nl: 'Dutch',
    sv: 'Swedish',
    da: 'Danish',
    no: 'Norwegian',
  };

  return `[Translation from ${languageNames[fromLanguage] || fromLanguage} to ${languageNames[toLanguage] || toLanguage}]: ${text}`;
}

export function detectLanguage(text: string): string {
  // Simple language detection based on character patterns
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja';
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko';
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0E00-\u0E7F]/.test(text)) return 'th';
  if (/[\u0400-\u04FF]/.test(text)) return 'ru';

  // For European languages, use simple word patterns
  const lowerText = text.toLowerCase();
  if (/\b(el|la|los|las|y|de|en|un|una)\b/.test(lowerText)) return 'es';
  if (/\b(le|la|les|et|de|dans|un|une)\b/.test(lowerText)) return 'fr';
  if (/\b(der|die|das|und|in|zu|mit|auf)\b/.test(lowerText)) return 'de';
  if (/\b(il|la|lo|gli|le|e|di|in|per)\b/.test(lowerText)) return 'it';
  if (/\b(o|a|os|as|e|de|em|para|com)\b/.test(lowerText)) return 'pt';

  return 'en'; // Default to English
}
