import { ChatService } from './api/services/ChatService.js';
import config from './api/config/index.js';

console.log('🧪 Testing Local Intent Matching');
console.log('='.repeat(50));

// Initialize ChatService
const chatService = new ChatService(config);

// Test messages that should match specific intents
const testMessages = [
  {
    message: 'What can I do here?',
    expectedIntent: 'Portal Welcome'
  },
  {
    message: 'How do I apply for a new scholarship?',
    expectedIntent: 'New Application Help'
  },
  {
    message: 'What documents do I need?',
    expectedIntent: 'Document Requirements Help'
  },
  {
    message: 'What is my application status?',
    expectedIntent: 'Application Status Inquiry'
  },
  {
    message: 'How do I renew my scholarship?',
    expectedIntent: 'Renewal Application Help'
  },
  {
    message: 'Hello, how are you?',
    expectedIntent: 'General greeting'
  }
];

console.log('\n🎯 Testing Intent Matching:');
console.log('='.repeat(50));

for (const test of testMessages) {
  console.log(`\n📝 Testing: "${test.message}"`);
  console.log(`🎯 Expected: ${test.expectedIntent}`);
  
  try {
    const response = await chatService.processMessage(test.message, 'test-session');
    console.log(`✅ Response: ${response.substring(0, 100)}...`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

console.log('\n' + '='.repeat(50));
console.log('🏁 Local intent matching test completed');
console.log('='.repeat(50));
