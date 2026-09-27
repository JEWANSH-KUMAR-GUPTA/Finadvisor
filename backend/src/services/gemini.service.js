const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateResponse = async (prompt, contextData = null) => {
  if (process.env.GEMINI_API_KEY === 'test' || !process.env.GEMINI_API_KEY) {
    return `Mocked AI response for prompt: ${prompt}\n\nContext Data: ${JSON.stringify(contextData)}`;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    let fullPrompt = `You are FinAdvisor, an AI-powered financial assistant. 
Remember to state that you do not provide personalized financial advice or guarantee investment returns. This is for educational purposes only.
`;
    
    if (contextData) {
      fullPrompt += `\nHere is real-time market data to use in your response:\n${JSON.stringify(contextData, null, 2)}\n`;
    }

    fullPrompt += `\nUser query: ${prompt}\n\nPlease provide a helpful, natural language response explaining this data or answering the query.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini generateResponse error:', error);
    return "I encountered an error while trying to generate a response. Please try again later. Note: This platform is for educational purposes only and does not provide financial advice.";
  }
};

module.exports = { generateResponse };
