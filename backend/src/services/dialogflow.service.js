const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

const getDialogflowClient = () => {
  if (process.env.DIALOGFLOW_PROJECT_ID === 'test') {
    return null; // Mock for test env
  }
  
  const credentials = {
    client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
    private_key: process.env.DIALOGFLOW_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  return new dialogflow.SessionsClient({
    projectId: process.env.DIALOGFLOW_PROJECT_ID,
    credentials,
  });
};

const sessionClient = getDialogflowClient();

const detectIntent = async (projectId, sessionId, query, languageCode = 'en-US') => {
  // If we are in local testing without real credentials, return a mocked response
  if (!sessionClient) {
    return mockDetectIntent(query);
  }

  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    return {
      intent: result.intent?.displayName || 'UNKNOWN_QUERY',
      parameters: result.parameters?.fields ? extractFields(result.parameters.fields) : {},
      fulfillmentText: result.fulfillmentText
    };
  } catch (error) {
    console.error('Dialogflow intent detection error:', error);
    // Fallback to mock on error or invalid config
    return mockDetectIntent(query);
  }
};

// Helper to convert Struct to JS Object
const extractFields = (fields) => {
  const result = {};
  for (const key in fields) {
    const field = fields[key];
    result[key] = field[field.kind];
  }
  return result;
};

// Simple mock for local development without actual GCP credentials
const mockDetectIntent = (query) => {
  const q = query.toLowerCase();
  
  if (q.includes('stock') || q.includes('apple') || q.includes('aapl')) {
    return { intent: 'STOCK_QUERY', parameters: { symbol: 'AAPL' } };
  } else if (q.includes('crypto') || q.includes('bitcoin') || q.includes('btc')) {
    return { intent: 'CRYPTO_QUERY', parameters: { symbol: 'BTCUSDT' } };
  } else if (q.includes('convert') || q.includes('usd') || q.includes('forex')) {
    return { intent: 'FOREX_QUERY', parameters: { from: 'USD', to: 'INR' } };
  } else if (q.includes('hi') || q.includes('hello')) {
    return { intent: 'GREETING', parameters: {} };
  }
  
  return { intent: 'UNKNOWN_QUERY', parameters: {} };
};

module.exports = { detectIntent };
