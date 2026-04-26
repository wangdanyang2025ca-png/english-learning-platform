// TTS 文本转语音服务

export class TTSService {
  // 方案 1: 使用 Web Speech API（浏览器端）
  static getWebSpeechUrl(word: string): string {
    return `data:audio/wav;base64,`; // 浏览器原生支持
  }

  // 方案 2: 使用 Google TTS
  static getGoogleTTSUrl(word: string): string {
    // 格式：https://translate.google.com/translate_a/element.js?...
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=en&client=tw-ob`;
  }

  // 方案 3: 使用 Oxford Dictionary API
  static getOxfordAudioUrl(word: string): string {
    // 需要 API key
    return `https://od-api.oxforddictionaries.com/api/v2/entries/en/${word.toLowerCase()}/pronunciations`;
  }

  // 方案 4: 使用 Azure Cognitive Services
  static getAzureTTSUrl(word: string, region: string = 'eastus'): string {
    const apiKey = process.env.AZURE_TTS_KEY;
    const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
    return endpoint;
  }

  // 方案 5: 使用 Forvo 众包发音库
  static getForvoUrl(word: string): string {
    return `https://apifree.forvo.com/action/word-pronunciations/format/json/word/${word}/language/en/`;
  }

  // 推荐方案：Google TTS（免费，质量好）
  static generateAudioUrl(word: string): string {
    // Google Translate TTS
    return this.getGoogleTTSUrl(word);
  }

  // 生成 Web Speech API 代码
  static getWebSpeechCode(word: string): string {
    return `
      const utterance = new SpeechSynthesisUtterance('${word}');
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    `;
  }
}
