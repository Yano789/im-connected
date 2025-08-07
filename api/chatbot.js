// Vercel serverless function wrapper for AI Chatbot
const path = require('path');
const express = require('express');

// Create Express app for the AI chatbot
const app = express();
app.use(express.json());

// Import and use the existing chatbot routes
const assistantsRoute = require('../../BACKEND/AI_chatbot/src/app/api/assistants/route.ts');
const threadsRoute = require('../../BACKEND/AI_chatbot/src/app/api/assistants/threads/route.ts');
const actionsRoute = require('../../BACKEND/AI_chatbot/src/app/api/assistants/threads/[threadId]/actions/route.ts');
const messagesRoute = require('../../BACKEND/AI_chatbot/src/app/api/assistants/threads/[threadId]/messages/route.ts');

// Mount routes
app.use('/api/assistants', assistantsRoute);
app.use('/api/assistants/threads', threadsRoute);

module.exports = app;
