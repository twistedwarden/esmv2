# 🤖 Chatbot Troubleshooting Guide

## Problem: "Something went wrong" Error

Your chatbot is showing "something went wrong" because of Dialogflow authentication issues. Here are the solutions:

## 🚀 Quick Fix - Use Fallback Mode

### Option 1: Start Fallback Chatbot (Recommended)

1. **Open Command Prompt/Terminal in the GSM/api directory**
2. **Run the fallback chatbot:**
   ```bash
   cd GSM/api
   node start-fallback.js
   ```

3. **Test the chatbot:**
   - Open `test-chatbot-debug.html` in your browser
   - Click "Test API Health" to verify it's working
   - Try sending a message

### Option 2: Fix Dialogflow Authentication

1. **Check your service account file:**
   - Make sure `bpmproject-51620-442af2875f18.json` exists in `GSM/api/`
   - Verify the file has valid Google Cloud credentials

2. **Set up environment variables:**
   ```bash
   # In GSM/api/.env
   DIALOGFLOW_PROJECT_ID=bpmproject-51620
   DIALOGFLOW_LANGUAGE_CODE=en
   DIALOGFLOW_FALLBACK_MODE=false
   ```

3. **Start the main chatbot:**
   ```bash
   cd GSM/api
   npm install
   node server.js
   ```

## 🔧 Common Issues & Solutions

### Issue 1: "Cannot connect to API"
**Cause:** Chatbot server not running
**Solution:** 
- Start the fallback server: `node start-fallback.js`
- Check if port 5000 is available
- Try a different port: `PORT=5001 node start-fallback.js`

### Issue 2: "Authentication error"
**Cause:** Dialogflow credentials invalid
**Solution:**
- Use fallback mode (no Dialogflow required)
- Or fix your Google Cloud service account credentials

### Issue 3: "CORS error"
**Cause:** Frontend can't connect to API
**Solution:**
- Make sure API is running on port 5000
- Check CORS configuration in the API
- Ensure frontend is running on localhost:5173

## 🧪 Testing Your Chatbot

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```
**Expected response:**
```json
{
  "status": "healthy",
  "service": "JironAI Chat API",
  "mode": "fallback"
}
```

### Test 2: Send Message
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```
**Expected response:**
```json
{
  "reply": "Hello! I'm JironAI, your smart assistant...",
  "sessionId": "test-session-123",
  "mode": "fallback"
}
```

## 🎯 Frontend Integration

### Update your frontend to use the chatbot:

1. **API Endpoint:** `http://localhost:5000/api/chat`
2. **Method:** POST
3. **Headers:** `Content-Type: application/json`
4. **Body:**
   ```json
   {
     "message": "Your message here",
     "sessionId": "optional-session-id"
   }
   ```

### Example JavaScript:
```javascript
async function sendMessage(message) {
  try {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        sessionId: 'user-session-123'
      })
    });
    
    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Chatbot error:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}
```

## 🚨 Emergency Fallback

If nothing works, use this simple inline chatbot:

```javascript
function simpleChatbot(message) {
  const lower = message.toLowerCase();
  
  if (lower.includes('hello') || lower.includes('hi')) {
    return 'Hello! I\'m JironAI. How can I help you?';
  }
  
  if (lower.includes('scholarship')) {
    return 'I can help you with scholarship information. What would you like to know?';
  }
  
  if (lower.includes('help')) {
    return 'I can help with:\n• Scholarship information\n• Application status\n• General questions';
  }
  
  return 'I\'m here to help! What would you like to know about scholarships?';
}
```

## 📊 Status Check

### ✅ Working Features (Fallback Mode)
- Basic conversation
- Scholarship-related responses
- Multi-language support
- Session management
- Error handling

### ⚠️ Missing Features (Requires Dialogflow)
- Advanced AI responses
- Intent recognition
- Context awareness
- Natural language processing

## 🎉 Next Steps

1. **Start with fallback mode** - Get basic functionality working
2. **Test thoroughly** - Use the debug page to verify everything works
3. **Integrate with frontend** - Update your chat component
4. **Optional: Fix Dialogflow** - For advanced AI features later

The fallback mode provides a fully functional chatbot without requiring Dialogflow setup!
