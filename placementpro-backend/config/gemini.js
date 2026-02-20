const { GoogleGenerativeAI } = require('@google/generative-ai');

let geminiClient = null;

const getGeminiClient = () => {
  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return null;
    }
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
};

const getModel = () => {
  const client = getGeminiClient();
  if (!client) return null;
  return client.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

const generateContent = async (prompt) => {
  const model = getModel();
  if (!model) {
    return getFallbackResponse(prompt);
  }
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    return getFallbackResponse(prompt);
  }
};

const getFallbackResponse = (prompt) => {
  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes('resume')) {
    return 'Your resume looks good! Consider adding more quantifiable achievements, using action verbs, and tailoring it to each job description. Make sure your skills section is up to date.';
  }
  if (lowerPrompt.includes('interview')) {
    return 'For interview preparation, research the company thoroughly, practice STAR method for behavioral questions, prepare questions to ask the interviewer, and arrive early. Common topics include data structures, algorithms, and system design for technical roles.';
  }
  if (lowerPrompt.includes('placement') || lowerPrompt.includes('drive')) {
    return 'Stay updated on upcoming placement drives through the TPO notice board. Ensure your profile is complete with updated CGPA, skills, and resume. Apply early and track your applications.';
  }
  if (lowerPrompt.includes('skill') || lowerPrompt.includes('learn')) {
    return 'Focus on in-demand skills like Python, JavaScript, SQL, and cloud technologies. Complete online courses on platforms like Coursera, edX, or Udemy. Build projects to demonstrate your skills practically.';
  }
  return 'I am PlacementBot, your AI placement assistant! I can help you with resume tips, interview preparation, skill development, and placement guidance. What would you like to know?';
};

module.exports = { generateContent, getGeminiClient };
