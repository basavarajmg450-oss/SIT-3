const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const initGemini = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Gemini Init: API Key present?', !!apiKey);
    if (apiKey) {
      console.log('Gemini Init: API Key starts with:', apiKey.substring(0, 8));
    }
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.log('Gemini Init: Returning NULL (key missing or placeholder)');
      return null;
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

const getModel = (systemInstruction) => {
  const client = initGemini();
  if (!client) return null;

  return client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemInstruction || "You are a helpful assistant."
  });
};

const generateContent = async (prompt, systemPrompt) => {
  try {
    const model = getModel(systemPrompt);
    if (!model) return getFallbackResponse(null, prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    return getFallbackResponse(error, prompt);
  }
};

const getFallbackResponse = (error, prompt) => {
  console.error("Gemini Error Context Full:", error);
  const message = error?.message || "";

  if (message.includes('quota') || message.includes('429')) {
    return "⚠️ **SYSTEM ERROR: API Quota Exceeded.** Your current Google Gemini API key has run out of free credits. Please update the `GEMINI_API_KEY` in your `.env` file with a fresh key from Google AI Studio.";
  }

  if (message.includes('API_KEY_INVALID') || message.includes('403')) {
    return "⚠️ **SYSTEM ERROR: Invalid API Key.** The API key in your `.env` file is incorrect or unauthorized. Please verify your key at Google AI Studio.";
  }

  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes('resume')) {
    return 'I seem to be having trouble reaching my AI brain! For resumes: Use clear headers and quantify your achievements. (Note: The AI is currently unavailable due to a connection or quota issue).';
  }

  return "I'm experiencing a temporary connection issue. This usually happens when the API key is over-quota or invalid. Please check your backend logs.";
};

module.exports = { generateContent, getModel, initGemini, getFallbackResponse };
