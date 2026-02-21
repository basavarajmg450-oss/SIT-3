const { getModel, getFallbackResponse } = require('../config/gemini');
const StudentProfile = require('../models/StudentProfile');

const PLACEMENT_SYSTEM_PROMPT = `You are PlacementBot, an intelligent AI assistant for PlacementPro - a college placement management system. 
You help students with:
- Resume writing tips and feedback
- Interview preparation (technical and HR)
- Placement process guidance
- Skill development recommendations
- Career advice
- Company research tips
- Salary negotiation tips
- Aptitude test preparation

Be encouraging, helpful, concise, and accurate. Format responses clearly with bullet points when listing items.`;

const sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    let studentContext = '';
    if (req.user.role === 'student') {
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile) {
        studentContext = `Student Profile Context: Name: ${profile.name}, Branch: ${profile.branch}, CGPA: ${profile.cgpa}, Skills: ${profile.skills.join(', ')}, Backlogs: ${profile.backlogs}`;
      }
    }

    const fullSystemPrompt = `${PLACEMENT_SYSTEM_PROMPT}${studentContext ? `\n\n${studentContext}` : ''}`;
    const model = getModel(fullSystemPrompt);

    if (!model) {
      return res.json({ success: true, response: getFallbackResponse(null, message) });
    }

    // Modern SDK Chat History Format
    const chatHistory = conversationHistory.slice(-10).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    res.json({ success: true, response, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('chatbot error:', error);
    const fallbackResponse = getFallbackResponse(error, req.body.message || '');
    res.json({ success: true, response: fallbackResponse, timestamp: new Date().toISOString() });
  }
};

const mockInterview = async (req, res) => {
  try {
    const { role, round, previousAnswer, question } = req.body;
    const model = getModel(PLACEMENT_SYSTEM_PROMPT);

    let prompt;
    if (!question) {
      prompt = `Generate a ${round || 'technical'} interview question for a ${role || 'software engineer'} position.
Format: 
Question: [question]
Hint: [brief hint]
Expected Time: [time in minutes]`;
    } else {
      prompt = `Evaluate this interview answer and provide constructive feedback:
Role: ${role || 'Software Engineer'}
Round: ${round || 'Technical'}
Question: ${question}
Answer: ${previousAnswer}

Provide:
1. Score (1-10)
2. What was good
3. What could be improved
4. Ideal answer key points`;
    }

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ success: true, response, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Mock interview error:', error);
    res.status(500).json({ success: false, message: 'Mock interview unavailable.' });
  }
};

const getResumeReview = async (req, res) => {
  try {
    const { resumeText } = req.body;
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    const model = getModel(PLACEMENT_SYSTEM_PROMPT);

    const prompt = `Review this student's profile and provide detailed resume feedback:
Name: ${profile?.name || 'Student'}
Branch: ${profile?.branch || 'N/A'}
CGPA: ${profile?.cgpa || 'N/A'}
Skills: ${profile?.skills?.join(', ') || 'N/A'}
Projects: ${profile?.projects?.map((p) => p.title).join(', ') || 'N/A'}
Certifications: ${profile?.certifications?.map((c) => c.name).join(', ') || 'N/A'}
${resumeText ? `Resume Content: ${resumeText}` : ''}

Provide:
1. Overall Resume Score (1-10)
2. Strengths
3. Areas for Improvement
4. Missing Elements
5. Action Items (prioritized)`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ success: true, response, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Resume review error:', error);
    res.status(500).json({ success: false, message: 'Resume review unavailable.' });
  }
};

module.exports = { sendMessage, mockInterview, getResumeReview };
