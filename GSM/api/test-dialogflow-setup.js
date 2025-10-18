import { ChatService } from './services/ChatService.js';
import config from './config/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Dialogflow Setup');
console.log('='.repeat(50));

// Test 1: Check service account file
console.log('\n1. Checking service account file...');
try {
  const serviceAccountPath = join(__dirname, 'bpmproject-51620-442af2875f18.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  console.log('✅ Service account file found and readable');
  console.log('   Project ID:', serviceAccount.project_id);
  console.log('   Client Email:', serviceAccount.client_email);
} catch (error) {
  console.log('❌ Service account file error:', error.message);
}

// Test 2: Check intents file
console.log('\n2. Checking intents file...');
try {
  const intentsPath = join(__dirname, '../dialogflow_intents.json');
  const intentsData = JSON.parse(readFileSync(intentsPath, 'utf8'));
  console.log('✅ Intents file found and readable');
  console.log('   Number of intents:', intentsData.intents.length);
  console.log('   Sample intents:');
  intentsData.intents.slice(0, 3).forEach(intent => {
    console.log(`   - ${intent.displayName}: ${intent.trainingPhrases.length} training phrases`);
  });
} catch (error) {
  console.log('❌ Intents file error:', error.message);
}

// Test 3: Initialize ChatService
console.log('\n3. Initializing ChatService...');
try {
  const chatService = new ChatService(config);
  console.log('✅ ChatService initialized successfully');
  console.log('   Project ID:', chatService.projectId);
  console.log('   Language Code:', chatService.languageCode);
  console.log('   Intents loaded:', chatService.intents.length);
  console.log('   Dialogflow client:', chatService.sessionClient ? 'Available' : 'Not available');
  console.log('   Mode:', chatService.sessionClient ? 'Dialogflow' : 'Local Intent Matching');
} catch (error) {
  console.log('❌ ChatService initialization error:', error.message);
}

// Test 4: Test message processing
console.log('\n4. Testing message processing...');
const testMessages = [
  'What can I do here?',
  'How do I apply for a new scholarship?',
  'What documents do I need?',
  'What is my application status?',
  'Hello, how are you?'
];

try {
  const chatService = new ChatService(config);
  
  for (const message of testMessages) {
    console.log(`\n   Testing: "${message}"`);
    try {
      const response = await chatService.processMessage(message, 'test-session');
      console.log(`   Response: ${response.substring(0, 100)}...`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  }
} catch (error) {
  console.log('❌ Message processing test error:', error.message);
}

console.log('\n' + '='.repeat(50));
console.log('🏁 Dialogflow setup test completed');
console.log('='.repeat(50));
