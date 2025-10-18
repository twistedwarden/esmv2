import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

// Create Express app
const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Body parser middleware
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Fallback response handler
function getFallbackResponse(message) {
    const lower = (message || '').toLowerCase();
    
    // Greeting responses
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hullo') || lower.includes('kamusta')) {
        return 'Hello! I\'m JironAI, your smart assistant. How can I help you today?';
    }
    
    // Name/identity responses
    if (lower.includes('name') || lower.includes('who are you') || lower.includes('pangalan')) {
        return 'Hi! I\'m JironAI, your smart assistant for the Government Scholarship Management system. I\'m here to help you with information about scholarships, applications, and more!';
    }
    
    // Help responses
    if (lower.includes('help') || lower.includes('tulong')) {
        return 'I can help you with:\n• Scholarship information and applications\n• Application status checking\n• General questions about the program\n• Multi-language support (English and Filipino)\n\nWhat would you like to know?';
    }
    
    // Scholarship-related responses
    if (lower.includes('scholarship') || lower.includes('scholar') || lower.includes('bursary')) {
        return 'I can help you with scholarship information! You can:\n• Check application status\n• Learn about available programs\n• Get help with the application process\n\nWhat specific scholarship information do you need?';
    }
    
    // Application-related responses
    if (lower.includes('application') || lower.includes('apply') || lower.includes('status')) {
        return 'For application help, I can assist you with:\n• Checking your application status\n• Understanding application requirements\n• Troubleshooting application issues\n\nWhat would you like to know about applications?';
    }
    
    // Thank you responses
    if (lower.includes('thank') || lower.includes('thanks') || lower.includes('salamat')) {
        return 'You\'re welcome! I\'m here to help anytime. Is there anything else you\'d like to know?';
    }
    
    // Goodbye responses
    if (lower.includes('bye') || lower.includes('goodbye') || lower.includes('paalam')) {
        return 'Goodbye! Feel free to come back anytime if you need help. Have a great day!';
    }
    
    // Default response
    return 'I\'m here to help! I can assist you with scholarship information, applications, and general questions. What would you like to know?';
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'JironAI Chat API (Fallback Mode)',
        version: '1.0.0',
        environment: 'fallback',
        mode: 'fallback'
    });
});

// Chat endpoint
app.post('/api/chat', (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                error: 'Missing message',
                message: 'Message is required'
            });
        }
        
        console.log('Received message:', message, 'Session ID:', sessionId);
        
        // Generate fallback response
        const reply = getFallbackResponse(message);
        
        res.json({ 
            reply,
            sessionId: sessionId || uuidv4(),
            timestamp: new Date().toISOString(),
            mode: 'fallback'
        });
        
    } catch (error) {
        console.error('Chat endpoint error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'An error occurred while processing your request'
        });
    }
});

// Chat capabilities endpoint
app.get('/api/chat/capabilities', (req, res) => {
    res.json({
        capabilities: [
            'Scholarship information and applications',
            'Application status checking',
            'General questions about the program',
            'Multi-language support (English and Filipino)'
        ],
        timestamp: new Date().toISOString(),
        mode: 'fallback'
    });
});

// Test endpoint
app.get('/api/chat/test', (req, res) => {
    const testMessage = 'Hello';
    const reply = getFallbackResponse(testMessage);
    
    res.json({
        success: true,
        message: 'Fallback mode test completed',
        testMessage,
        reply,
        timestamp: new Date().toISOString(),
        mode: 'fallback'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        message: 'The requested endpoint was not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 JironAI Chat Server Started (FALLBACK MODE)');
    console.log('='.repeat(50));
    console.log(`📍 Server running on port ${PORT}`);
    console.log(`🌐 API endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔧 CORS enabled for: http://localhost:5173`);
    console.log(`🤖 Mode: FALLBACK (No Dialogflow required)`);
    console.log(`🌱 Environment: fallback`);
    console.log('='.repeat(50));
    console.log('⚠️  Note: Running in fallback mode - Dialogflow is disabled');
    console.log('   This means responses are generated locally without AI.');
    console.log('   To enable full AI features, configure Dialogflow properly.');
    console.log('='.repeat(50));
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;