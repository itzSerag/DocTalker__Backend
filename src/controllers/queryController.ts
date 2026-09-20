import { Request, Response, NextFunction } from 'express';
import { getCompletion } from '../utils/getCompletion';
import { getEmbeddings } from '../services/huggingface';
import DocumentModel from '../models/Document';
import { cosineSimilarity } from '../utils/cosineSimilarity';
import Chat from '../models/Chat';
import User from '../models/User';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

export const handler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { query, chatId, modelType = 'openai' } = req.body;
  const currUser = req.user;

  if (!currUser) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!query || !chatId) {
    return next(new AppError('Both "query" and "chatId" are required', 400));
  }

  if (modelType !== 'openai' && modelType !== 'gemini-text') {
    return next(new AppError('Invalid modelType. Supported: "openai", "gemini-text"', 400));
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError('Chat not found', 404));
  }

  // Retrieve document associated with the chat
  const document = await DocumentModel.findById(chat.documentId);
  if (!document) {
    return next(new AppError('Associated document not found', 404));
  }

  // Record user query in chat
  chat.messages.push({ role: 'user', content: query, model: modelType } as any);
  await chat.save();

  // Compute similarity
  const queryEmbeddings = (await getEmbeddings(query)) as number[];

  const similarityResults: {
    chunk: { rawText: string; pageNumber?: number | null; fileName?: string };
    similarity: number;
  }[] = [];

  for (const file of document.Files) {
    for (const chunk of file.Chunks) {
      if (chunk.embeddings && chunk.embeddings.length > 0) {
        const sim = cosineSimilarity(queryEmbeddings, chunk.embeddings);
        similarityResults.push({
          chunk,
          similarity: sim,
        });
      }
    }
  }

  // Sort descending
  similarityResults.sort((a, b) => b.similarity - a.similarity);

  // If no chunks or similarity is too low
  if (similarityResults.length === 0 || similarityResults[0].similarity < 0.3) {
    const fallbackResponse =
      'Sorry, I could not find relevant information in the uploaded document. Please ask another question or verify the document was processed.';

    chat.messages.push({
      role: 'assistant',
      content: fallbackResponse,
      model: modelType,
    } as any);
    await chat.save();

    await User.findByIdAndUpdate(currUser._id, { $inc: { queryRequest: 1 } });

    const lastMsg = chat.messages[chat.messages.length - 1];
    return res.status(200).json({
      response: fallbackResponse,
      topChunks: [],
      messageId: lastMsg ? lastMsg._id : null,
    });
  }

  const topSimilarityChunks = similarityResults.slice(0, 5).map((result) => ({
    rawText: result.chunk.rawText,
    pageNumber: result.chunk.pageNumber,
    fileName: result.chunk.fileName,
  }));

  const contextText = topSimilarityChunks.map((c) => c.rawText).join('\n---\n');

  const systemPrompt = `You are DocTalker Bot that answers questions based ONLY on the provided context. If the answer cannot be found in the context, politely state that you cannot find it in the document.

Context:
${contextText}

Question: ${query}`;

  let responseText: string;

  if (modelType === 'openai') {
    const chatHistory = chat.messages.map((m) => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    }));
    chatHistory.push({ role: 'user', content: systemPrompt });

    responseText = await getCompletion(chatHistory, 'openai');
  } else {
    // gemini-text
    responseText = await getCompletion(systemPrompt, 'gemini-text');
  }

  // Save assistant response to chat
  chat.messages.push({
    role: 'assistant',
    content: responseText,
    model: modelType,
  } as any);
  await chat.save();

  // Increment query counter
  await User.findByIdAndUpdate(currUser._id, { $inc: { queryRequest: 1 } });

  const lastMessage = chat.messages[chat.messages.length - 1];

  return res.status(200).json({
    status: 'success',
    response: responseText,
    topChunks: topSimilarityChunks,
    messageId: lastMessage ? lastMessage._id : null,
  });
});

export default { handler };
