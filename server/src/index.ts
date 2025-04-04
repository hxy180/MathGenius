/**
 * @author xyhou
 * @date 2025.2
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import authRouter from './auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 配置DeepSeek API
const DEEPSEEK_API_KEY = 'sk-531b3e4d011940219c2503ba8cb16ed6';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: DEEPSEEK_API_KEY
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 集成认证路由
app.use('/api/auth', authRouter);

// 统一的错误响应格式
const sendErrorResponse = (res: express.Response, status: number, message: string) => {
  return res.status(status).json({
    status: 'error',
    error: message
  });
};

// 数学问题解答API - 流式输出版本
app.post('/api/solve/stream', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return sendErrorResponse(res, 400, '请提供有效的数学问题');
    }

    console.log('发送流式请求到DeepSeek API...');
    console.log('问题:', question);

    // 设置响应头，支持流式输出
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 发送初始消息
    res.write('data: {"status": "start"}\n\n');

    // 创建流式请求
    const stream = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一个专业的数学老师，擅长解答各种数学问题。请详细解释解题思路和步骤。"
        },
        {
          role: "user",
          content: question
        }
      ],
      stream: true, // 启用流式输出
    });

    // 处理流式响应
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        // 发送内容块
        res.write(`data: {"status": "chunk", "content": ${JSON.stringify(content)}}\n\n`);
      }
    }

    // 发送完成消息
    res.write('data: {"status": "done"}\n\n');
    res.end();

  } catch (error) {
    console.error('Error:', error);
    
    let errorMessage = '服务器内部错误，请稍后重试';
    let statusCode = 500;
    
    if (error instanceof Error) {
      console.error('API错误:', error.message);
      errorMessage = `API调用失败: ${error.message}`;
      
      // 处理特定类型的错误
      if (error.message.includes('API key')) {
        statusCode = 401;
        errorMessage = 'API认证失败，请检查API密钥';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'API请求超时，请重试';
      }
    }

    // 对于已经开始的流，发送错误消息并结束
    if (res.headersSent) {
      res.write(`data: {"status": "error", "error": ${JSON.stringify(errorMessage)}}\n\n`);
      res.end();
    } else {
      // 对于尚未开始的流，发送标准错误响应
      return sendErrorResponse(res, statusCode, errorMessage);
    }
  }
});

// 添加GET方法的流式API端点，用于EventSource
app.get('/api/solve/stream', async (req, res) => {
  try {
    const question = req.query.question as string;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return sendErrorResponse(res, 400, '请提供有效的数学问题');
    }

    console.log('发送GET流式请求到DeepSeek API...');
    console.log('问题:', question);

    // 设置响应头，支持流式输出
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');  // 允许所有来源

    // 发送初始消息
    res.write('data: {"status": "start"}\n\n');

    // 创建流式请求
    const stream = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一个专业的数学老师，擅长解答各种数学问题。请详细解释解题思路和步骤。"
        },
        {
          role: "user",
          content: question
        }
      ],
      stream: true, // 启用流式输出
    });

    // 处理流式响应
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        // 发送内容块
        res.write(`data: {"status": "chunk", "content": ${JSON.stringify(content)}}\n\n`);
      }
    }

    // 发送完成消息
    res.write('data: {"status": "done"}\n\n');
    res.end();

  } catch (error) {
    console.error('Error:', error);
    
    let errorMessage = '服务器内部错误，请稍后重试';
    let statusCode = 500;
    
    if (error instanceof Error) {
      console.error('API错误:', error.message);
      errorMessage = `API调用失败: ${error.message}`;
      
      // 处理特定类型的错误
      if (error.message.includes('API key')) {
        statusCode = 401;
        errorMessage = 'API认证失败，请检查API密钥';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'API请求超时，请重试';
      }
    }

    // 对于已经开始的流，发送错误消息并结束
    if (res.headersSent) {
      res.write(`data: {"status": "error", "error": ${JSON.stringify(errorMessage)}}\n\n`);
      res.end();
    } else {
      // 对于尚未开始的流，发送标准错误响应
      return sendErrorResponse(res, statusCode, errorMessage);
    }
  }
});

// 保留原有的非流式API端点以保持兼容性
app.post('/api/solve', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return sendErrorResponse(res, 400, '请提供有效的数学问题');
    }

    console.log('发送请求到DeepSeek API...');
    console.log('问题:', question);

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一个专业的数学老师，擅长解答各种数学问题。请详细解释解题思路和步骤。"
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    console.log('DeepSeek API响应成功');
    
    if (!completion.choices?.[0]?.message?.content) {
      return sendErrorResponse(res, 500, 'API返回的响应格式不正确');
    }

    const answer = completion.choices[0].message.content.trim();
    
    if (!answer) {
      return sendErrorResponse(res, 500, 'API返回的答案为空');
    }

    return res.json({
      status: 'success',
      answer
    });

  } catch (error) {
    console.error('Error:', error);
    
    let errorMessage = '服务器内部错误，请稍后重试';
    let statusCode = 500;
    
    if (error instanceof Error) {
      console.error('API错误:', error.message);
      errorMessage = `API调用失败: ${error.message}`;
      
      // 处理特定类型的错误
      if (error.message.includes('API key')) {
        statusCode = 401;
        errorMessage = 'API认证失败，请检查API密钥';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'API请求超时，请重试';
      }
    }

    return sendErrorResponse(res, statusCode, errorMessage);
  }
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});