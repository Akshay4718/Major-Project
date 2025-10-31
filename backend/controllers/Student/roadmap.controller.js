import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateRoadmap = async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ 
        success: false,
        message: 'Topic is required to generate a learning path' 
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.'
      });
    }

    // Initialize the model (using gemini-2.0-flash like resume analyzer)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create a detailed prompt for the AI
    const prompt = `Analyze the topic "${topic}" and create a comprehensive learning roadmap in JSON format with these sections:
    1. topic (the topic name)
    2. steps (array of 5-7 learning steps, each containing):
       - title (step name)
       - description (2-3 sentences explaining what to learn)
       - duration (estimated time like "2-3 weeks")
       - resources (array of 3-4 learning resources, each with):
         * title (resource name)
         * url (valid URL to the resource)
         * type ("article" or "video")

    Requirements:
    - Order steps from beginner to advanced
    - Include mix of articles and videos
    - Prefer free resources from reputable sources (MDN, freeCodeCamp, YouTube, official docs)
    - Make URLs valid and working
    - Include practical projects in descriptions

    Return ONLY valid JSON, no additional text or markdown.`;

    // Send prompt to Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse Gemini's response safely (same approach as resume analyzer)
    let roadmap;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      roadmap = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
    } catch (jsonError) {
      console.error('Error parsing Gemini JSON:', jsonError, '\nResponse text:', text);
      throw new Error('AI returned invalid JSON format');
    }

    // Validate the structure
    if (!roadmap.steps || !Array.isArray(roadmap.steps)) {
      throw new Error('Invalid roadmap structure');
    }

    // Return success response
    res.status(200).json({
      success: true,
      roadmap: roadmap
    });

  } catch (error) {
    console.error('Error generating roadmap:', error);
    
    // Handle specific error types
    if (error.message.includes('API key')) {
      return res.status(500).json({ 
        success: false,
        message: 'Gemini API configuration error. Please contact administrator.' 
      });
    }
    
    if (error instanceof SyntaxError) {
      return res.status(500).json({ 
        success: false,
        message: 'Failed to parse AI response. Please try again.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate learning path. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
