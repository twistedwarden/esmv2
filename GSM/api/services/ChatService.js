import { SessionsClient } from '@google-cloud/dialogflow';
import { v4 as uuidv4 } from 'uuid';
import { FallbackHandler } from '../utils/FallbackHandler.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

export class ChatService {
  constructor(config) {
    this.config = config;
    this.projectId = config.dialogflow.projectId;
    this.languageCode = config.dialogflow.languageCode;
    this.fallbackMode = config.dialogflow.enableFallbackMode;
    this.intents = this.loadIntents();
    
    if (this.fallbackMode) {
      console.log('⚠️  Running in FALLBACK MODE - Dialogflow disabled');
      console.log('Dialogflow client not initialized (fallback mode enabled)');
      return;
    }

    // Initialize Dialogflow client with proper authentication
    const clientConfig = {
      projectId: config.dialogflow.projectId,
    };

    // Use key file if specified and available
    if (config.dialogflow.useKeyFile && config.dialogflow.keyFilename) {
      try {
        const serviceAccount = JSON.parse(readFileSync(config.dialogflow.keyFilename, 'utf8'));
        clientConfig.credentials = serviceAccount;
        console.log('✅ Service account credentials loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load service account file:', error.message);
        console.log('⚠️  Falling back to environment credentials or key file path');
        clientConfig.keyFilename = config.dialogflow.keyFilename;
      }
    }
    
    // Use credentials from environment if available
    if (config.dialogflow.credentials) {
      clientConfig.credentials = config.dialogflow.credentials;
    }

    try {
      this.sessionClient = new SessionsClient(clientConfig);
      console.log('✅ Dialogflow client initialized with project:', this.projectId);
      console.log('📚 Loaded', this.intents.length, 'intents from configuration');
    } catch (error) {
      console.error('❌ Failed to initialize Dialogflow client:', error.message);
      console.log('⚠️  Falling back to local intent matching');
      this.sessionClient = null;
    }
  }

  loadIntents() {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const intentsPath = join(__dirname, '../../dialogflow_intents.json');
      const intentsData = JSON.parse(readFileSync(intentsPath, 'utf8'));
      console.log('📚 Loaded', intentsData.intents.length, 'intents from file');
      return intentsData.intents;
    } catch (error) {
      console.warn('⚠️  Could not load intents file:', error.message);
      return [];
    }
  }

  async processMessage(message, sessionId) {
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message provided');
    }

    // If in fallback mode, use only fallback responses
    if (this.fallbackMode) {
      console.log('Using fallback mode - skipping Dialogflow');
      return FallbackHandler.getResponse(message);
    }

    // Check if Dialogflow client is available
    if (!this.sessionClient) {
      console.log('Dialogflow client not available - using local intent matching');
      return this.matchLocalIntent(message);
    }

    const sessionPath = this.sessionClient.projectAgentSessionPath(
      this.projectId, 
      sessionId || uuidv4()
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: this.languageCode,
        },
      },
    };

    try {
      console.log('Sending request to Dialogflow...');
      console.log('Session path:', sessionPath);
      console.log('Request:', JSON.stringify(request, null, 2));
      
      const responses = await this.sessionClient.detectIntent(request);
      const result = responses[0].queryResult;
      
      console.log('Dialogflow response:', result.fulfillmentText);
      
      // Return Dialogflow response if available, otherwise use fallback
      if (result.fulfillmentText && result.fulfillmentText.trim()) {
        return result.fulfillmentText;
      }
      
      return FallbackHandler.getResponse(message);
    } catch (error) {
      console.error('Dialogflow error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack
      });
      
      // Check if it's an authentication error
      if (error.code === 16 || error.message.includes('authentication')) {
        console.error('Authentication error detected. Please check your Dialogflow credentials.');
        console.log('Using local intent matching due to authentication error');
        return this.matchLocalIntent(message);
      }
      
      // Return local intent matching on other Dialogflow errors
      console.log('Using local intent matching due to Dialogflow error');
      return this.matchLocalIntent(message);
    }
  }

  matchLocalIntent(message) {
    if (!this.intents || this.intents.length === 0) {
      console.log('No intents available - using basic fallback');
      return FallbackHandler.getResponse(message);
    }

    const lowerMessage = message.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    // Find the best matching intent
    for (const intent of this.intents) {
      const score = this.calculateIntentScore(lowerMessage, intent);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = intent;
      }
    }

    // If we found a good match (score > 0.3), use it
    if (bestMatch && bestScore > 0.3) {
      console.log(`🎯 Matched intent: ${bestMatch.displayName} (score: ${bestScore.toFixed(2)})`);
      return this.getIntentResponse(bestMatch, message);
    }

    // Otherwise use fallback
    console.log('No good intent match found - using fallback');
    return FallbackHandler.getResponse(message);
  }

  calculateIntentScore(message, intent) {
    let maxScore = 0;
    
    // Check training phrases
    for (const phrase of intent.trainingPhrases) {
      const phraseLower = phrase.toLowerCase();
      const score = this.calculatePhraseScore(message, phraseLower);
      maxScore = Math.max(maxScore, score);
    }

    return maxScore;
  }

  calculatePhraseScore(message, phrase) {
    // Simple keyword matching with scoring
    const messageWords = message.split(/\s+/);
    const phraseWords = phrase.split(/\s+/);
    
    let matches = 0;
    let totalWords = Math.max(messageWords.length, phraseWords.length);
    
    for (const word of messageWords) {
      if (phraseWords.some(pw => pw.includes(word) || word.includes(pw))) {
        matches++;
      }
    }
    
    // Also check for exact phrase matches
    if (phrase.includes(message) || message.includes(phrase)) {
      return 1.0;
    }
    
    return matches / totalWords;
  }

  getIntentResponse(intent, originalMessage) {
    if (intent.responses && intent.responses.length > 0) {
      const response = intent.responses[0];
      if (response.text && response.text.text && response.text.text.length > 0) {
        return response.text.text[0];
      }
    }
    
    // Fallback to intent name-based response
    return this.getIntentBasedResponse(intent.displayName, originalMessage);
  }

  getIntentBasedResponse(intentName, message) {
    const responses = {
      'Portal Welcome': 'Welcome to the Caloocan Scholarship Management Portal! Here are your main options:\n\n1. **Scholar Dashboard** - Track your application status\n2. **New Application** - Apply for a new scholarship\n3. **Renewal Application** - Renew your existing scholarship\n4. **UCC Portal** - Access additional resources\n\nWhich option would you like to explore?',
      
      'New Application Help': 'The new scholarship application is a 4-step process:\n\n**Step 1:** Personal Information\n**Step 2:** Parent Information\n**Step 3:** Employment & Income Information\n**Step 4:** Scholarship Information\n\n**Required Documents:**\n- Certificate of Enrollment\n- Transcript of Records\n- Certificate of Good Moral\n- Income Certificate\n- Barangay Certificate\n- Valid ID\n- Birth Certificate\n\nWould you like me to guide you through any specific step?',
      
      'Application Status Inquiry': 'To check your application status:\n\n1. **Use the Scholar Dashboard** - Log in and view real-time status\n2. **Check your Reference Number** - Use this to track your application\n3. **Contact the Scholarship Office** - Call or email for updates\n\n**Application Stages:**\n- General Requirements & Interview\n- Endorsed to SSC Approval\n- Approved Application\n- Grants Processing\n- Grants Disbursed\n\nDo you have your reference number?',
      
      'Document Requirements Help': '**Required Documents:**\n- Certificate of Enrollment (COE)\n- Transcript of Records (TOR)\n- Certificate of Good Moral Character\n- Income Certificate\n- Barangay Certificate\n- Valid ID (any government-issued)\n- Birth Certificate\n\n**Document Guidelines:**\n- All documents must be clear and readable\n- File size limit: 5MB per document\n- Accepted formats: PDF, JPG, PNG\n- Documents must be recent (within 6 months)\n\nNeed help with any specific document?'
    };
    
    return responses[intentName] || FallbackHandler.getResponse(message);
  }

  async getSessionInfo(sessionId) {
    return {
      sessionId: sessionId || uuidv4(),
      projectId: this.projectId,
      languageCode: this.languageCode,
      intentsLoaded: this.intents.length,
      mode: this.sessionClient ? 'dialogflow' : 'local'
    };
  }
} 