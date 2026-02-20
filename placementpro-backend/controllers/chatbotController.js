const { generateContent } = require('../config/gemini');
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

    let context = '';
    if (req.user.role === 'student') {
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile) {
        context = `Student Context: Name: ${profile.name}, Branch: ${profile.branch}, CGPA: ${profile.cgpa}, Skills: ${profile.skills.join(', ')}, Backlogs: ${profile.backlogs}`;
      }
    }

    const historyText = conversationHistory
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'User' : 'Bot'}: ${m.content}`)
      .join('\n');

    const prompt = `${PLACEMENT_SYSTEM_PROMPT}
${context ? `\n${context}` : ''}
${historyText ? `\nConversation History:\n${historyText}` : ''}

User: ${message}
Bot:`;

    const response = await generateContent(prompt);

    res.json({ success: true, response, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('chatbot error:', error);
    res.status(500).json({ success: false, message: 'Chatbot unavailable.', response: 'I apologize, I am temporarily unavailable. Please try again shortly.' });
  }
};

const mockInterview = async (req, res) => {
  try {
    const { role, round, previousAnswer, question } = req.body;

    let prompt;

    if (!question) {
      prompt = `${PLACEMENT_SYSTEM_PROMPT}

Generate a ${round || 'technical'} interview question for a ${role || 'software engineer'} position.
Format: 
Question: [question]
Hint: [brief hint]
Expected Time: [time in minutes]`;
    } else {
      prompt = `${PLACEMENT_SYSTEM_PROMPT}

Evaluate this interview answer and provide constructive feedback:
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

    const response = await generateContent(prompt);
    res.json({ success: true, response, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Mock interview unavailable.' });
  }
};

const getResumeReview = async (req, res) => {
  try {
    const { resumeText } = req.body;

    const profile = await StudentProfile.findOne({ userId: req.user._id });

    const prompt = `${PLACEMENT_SYSTEM_PROMPT}

Review this student's profile and provide detailed resume feedback:
Name: ${profile?.name}
Branch: ${profile?.branch}
CGPA: ${profile?.cgpa}
Skills: ${profile?.skills?.join(', ')}
Projects: ${profile?.projects?.map((p) => p.title).join(', ')}
Certifications: ${profile?.certifications?.map((c) => c.name).join(', ')}
${resumeText ? `Resume Content: ${resumeText}` : ''}

Provide:
1. Overall Resume Score (1-10)
2. Strengths
3. Areas for Improvement
4. Missing Elements
5. Action Items (prioritized)`;

    const response = await generateContent(prompt);
    res.json({ success: true, response, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Resume review unavailable.' });
  }
};

module.exports = { sendMessage, mockInterview, getResumeReview };
