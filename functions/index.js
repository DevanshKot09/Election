/**
 * @fileoverview Google Cloud Functions for Indian Election Assistant
 * @description Serverless backend functions for voter verification, polling booth search,
 * BigQuery analytics, Natural Language API integration, and Firestore operations
 * @author Indian Election Assistant Team
 * @version 2.0.0
 */

const functions = require('@google-cloud/functions-framework');
const { BigQuery } = require('@google-cloud/bigquery');
const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');
const { LanguageServiceClient } = require('@google-cloud/language');

// Initialize Google Cloud clients
const bigquery = new BigQuery();
const storage = new Storage();
const firestore = new Firestore();
const language = new LanguageServiceClient();

const PROJECT_ID = 'prompt-war-submission-1';
const DATASET_ID = 'election_analytics';
const BUCKET_NAME = 'prompt-war-election-assets';

/**
 * Verifies voter registration
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
functions.http('verifyVoter', async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { voterId, name, timestamp } = req.body;

    // Validate input
    if (!voterId || !name) {
      res.status(400).json({
        success: false,
        message: 'Voter ID and name are required'
      });
      return;
    }

    // Log to BigQuery
    await logEventToBigQuery('voter_verification', {
      voter_id: voterId,
      name,
      timestamp
    });

    // In production, this would query actual ECI database
    // For demo, return mock verification
    const isValid = voterId.length === 10;

    res.json({
      success: true,
      verified: isValid,
      message: isValid ? 'Voter registration verified' : 'Voter ID not found',
      data: isValid ? {
        voterId,
        name,
        constituency: 'New Delhi',
        pollingBooth: 'Government Primary School, Sector 15',
        status: 'Active'
      } : null
    });
  } catch (error) {
    console.error('Error verifying voter:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Searches for polling booth by location
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
functions.http('searchPollingBooth', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { location, timestamp } = req.body;

    if (!location) {
      res.status(400).json({
        success: false,
        message: 'Location is required'
      });
      return;
    }

    // Log search to BigQuery
    await logEventToBigQuery('polling_booth_search', {
      location,
      timestamp
    });

    // Mock polling booth data
    const pollingBooths = [
      {
        name: 'Government Primary School, Sector 15',
        address: 'Sector 15, Rohini, New Delhi - 110085',
        lat: 28.7041,
        lng: 77.1025,
        distance: '1.2 km',
        waitTime: '15-20 mins',
        constituency: 'North West Delhi',
        facilities: ['Wheelchair accessible', 'Parking available', 'Drinking water']
      }
    ];

    res.json({
      success: true,
      results: pollingBooths,
      count: pollingBooths.length
    });
  } catch (error) {
    console.error('Error searching polling booth:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Logs event to BigQuery
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
functions.http('logToBigQuery', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const eventData = req.body;
    await logEventToBigQuery(eventData.event_name, eventData.event_data);

    res.json({
      success: true,
      message: 'Event logged to BigQuery'
    });
  } catch (error) {
    console.error('Error logging to BigQuery:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Analyzes text using Natural Language API
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
functions.http('analyzeText', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { text, features } = req.body;

    if (!text) {
      res.status(400).json({
        success: false,
        message: 'Text is required'
      });
      return;
    }

    const document = {
      content: text,
      type: 'PLAIN_TEXT'
    };

    const results = {};

    // Analyze sentiment
    if (features.includes('sentiment')) {
      const [sentiment] = await language.analyzeSentiment({ document });
      results.sentiment = {
        score: sentiment.documentSentiment.score,
        magnitude: sentiment.documentSentiment.magnitude
      };
    }

    // Extract entities
    if (features.includes('entities')) {
      const [entities] = await language.analyzeEntities({ document });
      results.entities = entities.entities.map(entity => ({
        name: entity.name,
        type: entity.type,
        salience: entity.salience
      }));
    }

    // Analyze syntax
    if (features.includes('syntax')) {
      const [syntax] = await language.analyzeSyntax({ document });
      results.syntax = {
        tokenCount: syntax.tokens.length
      };
    }

    res.json({
      success: true,
      analysis: results
    });
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * AI-powered chatbot using Natural Language API
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
functions.http('chatbot', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { question, context, timestamp } = req.body;

    if (!question) {
      res.status(400).json({
        success: false,
        message: 'Question is required'
      });
      return;
    }

    // Analyze question intent
    const document = {
      content: question,
      type: 'PLAIN_TEXT'
    };

    const [entities] = await language.analyzeEntities({ document });
    const [sentiment] = await language.analyzeSentiment({ document });

    // Log chatbot interaction
    await logEventToBigQuery('chatbot_query', {
      question,
      sentiment: sentiment.documentSentiment.score,
      timestamp
    });

    // Generate response based on entities and intent
    const response = generateChatbotResponse(question, entities.entities);

    res.json({
      success: true,
      response,
      sentiment: sentiment.documentSentiment.score,
      entities: entities.entities.map(e => e.name)
    });
  } catch (error) {
    console.error('Error in chatbot:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Uploads file to Cloud Storage
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
functions.http('uploadFile', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // File upload logic would go here
    // This is a placeholder for the actual implementation
    res.json({
      success: true,
      message: 'File upload endpoint ready',
      url: `https://storage.googleapis.com/${BUCKET_NAME}/uploads/file.jpg`
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Gets document from Firestore
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
functions.http('getFirestoreDoc', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { collection, documentId } = req.body;

    const docRef = firestore.collection(collection).doc(documentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        message: 'Document not found'
      });
      return;
    }

    res.json({
      success: true,
      data: doc.data()
    });
  } catch (error) {
    console.error('Error getting Firestore document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Saves document to Firestore
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
functions.http('saveFirestoreDoc', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { collection, documentId, data } = req.body;

    const docRef = firestore.collection(collection).doc(documentId);
    await docRef.set(data, { merge: true });

    res.json({
      success: true,
      message: 'Document saved successfully'
    });
  } catch (error) {
    console.error('Error saving Firestore document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Queries BigQuery
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
functions.http('queryBigQuery', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { query } = req.body;

    const options = {
      query,
      location: 'US'
    };

    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();

    res.json({
      success: true,
      data: rows,
      rowCount: rows.length
    });
  } catch (error) {
    console.error('Error querying BigQuery:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Helper function to log events to BigQuery
 * @param {string} eventName - Event name
 * @param {Object} eventData - Event data
 */
async function logEventToBigQuery(eventName, eventData) {
  try {
    const tableId = 'events';
    const rows = [{
      event_id: generateId(),
      event_name: eventName,
      event_data: JSON.stringify(eventData),
      timestamp: new Date().toISOString()
    }];

    await bigquery
      .dataset(DATASET_ID)
      .table(tableId)
      .insert(rows);

    console.log(`Logged event ${eventName} to BigQuery`);
  } catch (error) {
    console.error('Error logging to BigQuery:', error);
  }
}

/**
 * Generates chatbot response based on question analysis
 * @param {string} question - User question
 * @param {Array} entities - Extracted entities
 * @returns {string} Response text
 */
function generateChatbotResponse(question, entities) {
  const lowerQuestion = question.toLowerCase();

  // Registration queries
  if (lowerQuestion.includes('register') || lowerQuestion.includes('registration')) {
    return 'To register as a voter in India, you need to be 18 years or older and an Indian citizen. Visit the National Voters\' Service Portal (nvsp.in) to apply online. You\'ll need proof of identity, age, and residence. The process typically takes 2-4 weeks.';
  }

  // EPIC card queries
  if (lowerQuestion.includes('epic') || lowerQuestion.includes('voter id') || lowerQuestion.includes('voter card')) {
    return 'EPIC (Electors Photo Identity Card) is your official voter ID card issued by the Election Commission of India. You can apply for it online at nvsp.in or visit your local Electoral Registration Officer. Bring documents like Aadhaar, passport, or driving license as proof.';
  }

  // Polling booth queries
  if (lowerQuestion.includes('polling') || lowerQuestion.includes('booth') || lowerQuestion.includes('where to vote')) {
    return 'You can find your polling booth by entering your address or PIN code in our Search section. Polling booths are typically located in schools, community centers, or government buildings. They open at 7:00 AM and close at 6:00 PM on election day.';
  }

  // Voting process queries
  if (lowerQuestion.includes('how to vote') || lowerQuestion.includes('voting process')) {
    return 'On election day: 1) Go to your assigned polling booth, 2) Show your EPIC card or valid photo ID, 3) Get your finger marked with indelible ink, 4) Press the button next to your chosen candidate on the EVM, 5) Verify your vote on the VVPAT slip. Your vote is completely secret and secure.';
  }

  // EVM queries
  if (lowerQuestion.includes('evm') || lowerQuestion.includes('voting machine')) {
    return 'EVM (Electronic Voting Machine) is used for voting in Indian elections. It has two units: Control Unit (with polling officer) and Ballot Unit (where you vote). Press the button next to your chosen candidate\'s symbol. The VVPAT (paper trail) lets you verify your vote for 7 seconds.';
  }

  // Helpline queries
  if (lowerQuestion.includes('helpline') || lowerQuestion.includes('contact') || lowerQuestion.includes('help')) {
    return 'For election-related queries, call the Election Commission of India helpline at 1950 (toll-free). You can also visit eci.gov.in or your state\'s Chief Electoral Officer website. Local Electoral Registration Officers are available at district offices.';
  }

  // Default response
  return 'I can help you with information about voter registration, EPIC cards, polling booths, voting process, and election dates. For specific queries, please call the ECI helpline at 1950 or visit eci.gov.in.';
}

/**
 * Generates unique ID
 * @returns {string} Unique identifier
 */
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = {
  verifyVoter: functions.http('verifyVoter'),
  searchPollingBooth: functions.http('searchPollingBooth'),
  logToBigQuery: functions.http('logToBigQuery'),
  analyzeText: functions.http('analyzeText'),
  chatbot: functions.http('chatbot'),
  uploadFile: functions.http('uploadFile'),
  getFirestoreDoc: functions.http('getFirestoreDoc'),
  saveFirestoreDoc: functions.http('saveFirestoreDoc'),
  queryBigQuery: functions.http('queryBigQuery')
};

// Made with Bob
