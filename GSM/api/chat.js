import dialogflow from '@google-cloud/dialogflow';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables (optional; used for language only)
dotenv.config();

// Load service account JSON from local file instead of .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use the correct service account file name
const serviceAccountPath = join(__dirname, 'bpmproject-51620-442af2875f18.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

const projectId = process.env.DIALOGFLOW_PROJECT_ID || 'bpmproject-51620';
const languageCode = process.env.DIALOGFLOW_LANGUAGE_CODE || 'en';

const sessionClient = new dialogflow.SessionsClient({
  credentials: serviceAccount,
});

function buildFallback(message) {
	const lower = (message || '').toLowerCase();
	let fallbackResponse = 'I\'m here to help! How can I assist you today?';

	if (lower.includes('name') || lower.includes('who are you') || lower.includes('pangalan')) {
		fallbackResponse = 'Hi! I\'m JironAI, your smart assistant. I\'m here to help you with information about scholarships, applications, and more!';
	} else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hullo') || lower.includes('kamusta')) {
		fallbackResponse = 'Hello! I\'m JironAI. How can I help you today?';
	} else if (lower.includes('help') || lower.includes('tulong')) {
		fallbackResponse = 'I can help you with:\n• Scholarship information\n• Application status\n• General questions\n\nWhat would you like to know?';
	}

	return fallbackResponse;
}

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST');
		return res.status(405).json({ error: 'Method Not Allowed' });
	}

	try {
		const { message, sessionId } = req.body || {};
		if (!message) {
			return res.status(400).json({ error: 'Missing message' });
		}

		const sessionPath = `projects/${projectId}/agent/sessions/${sessionId || uuidv4()}`;
		const request = {
			session: sessionPath,
			queryInput: {
				text: {
					text: message,
					languageCode,
				},
			},
		};

		console.log('Sending request to Dialogflow...');
		try {
			const [response] = await sessionClient.detectIntent(request);
			const result = response.queryResult;
			console.log('Dialogflow response:', result.fulfillmentText);
			
			// Check if we got a response from Dialogflow
			if (result.fulfillmentText && result.fulfillmentText.trim()) {
				return res.status(200).json({ reply: result.fulfillmentText });
			}

			// Dialogflow responded but empty fulfillment: use fallback
			return res.status(200).json({ reply: buildFallback(message) });
		} catch (err) {
			// Dialogflow error: still respond gracefully with fallback
			console.error('Dialogflow error:', err);
			return res.status(200).json({ reply: buildFallback(message) });
		}
	} catch (err) {
		console.error('Chat handler error:', err);
		
		// Provide more specific error messages
		let errorMessage = 'Something went wrong. Please try again.';
		
		if (err.message.includes('ENOENT')) {
			errorMessage = 'Service account file not found. Please check the configuration.';
		} else if (err.message.includes('credentials')) {
			errorMessage = 'Authentication error. Please check your Google Cloud credentials.';
		} else if (err.message.includes('network') || err.message.includes('timeout')) {
			errorMessage = 'Network error. Please check your internet connection and try again.';
		}
		
		return res.status(500).json({ 
			error: errorMessage,
			details: process.env.NODE_ENV === 'development' ? err.message : undefined
		});
	}
} 