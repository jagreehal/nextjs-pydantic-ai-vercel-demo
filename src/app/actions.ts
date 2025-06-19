'use server';

import { getPythonApiUrl } from '@/lib/utils';

const pythonApiUrl = getPythonApiUrl();

export async function translateText(params: {
  text: string;
  fromLanguage: string;
  toLanguage: string;
}): Promise<string> {
  try {
    const result = await fetch(`${pythonApiUrl}/api/ai/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to_language: params.toLanguage,
        from_language: params.fromLanguage,
        text: params.text,
      }),
    });

    if (!result.ok) {
      throw new Error(
        `Translation failed: ${result.status.toString()} ${result.statusText}`,
      );
    }

    let data: { translation: string };
    try {
      data = (await result.json()) as { translation: string };
    } catch (jsonError) {
      console.error('Failed to parse translation response:', jsonError);
      throw new Error('Translation service returned an invalid response');
    }
    return data.translation;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Translation service temporarily unavailable');
  }
}
