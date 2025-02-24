import { Router } from 'express';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// 模拟用户数据存储
const users: { username: string; password: string }[] = [];

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 注册接口
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        error: '用户名和密码不能为空'
      });
    }

    // 检查用户名是否已存在
    if (users.some(user => user.username === username)) {
      return res.status(400).json({
        status: 'error',
        error: '用户名已存在'
      });
    }

    // 加密密码
    const hashedPassword = await hash(password, 10);

    // 保存用户信息
    users.push({
      username,
      password: hashedPassword
    });

    // 生成JWT令牌
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      status: 'success',
      token,
      user: { username }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      status: 'error',
      error: '注册失败，请稍后重试'
    });
  }
});

// 登录接口
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        error: '用户名和密码不能为空'
      });
    }

    // 查找用户
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        error: '用户名或密码错误'
      });
    }

    // 验证密码
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        status: 'error',
        error: '用户名或密码错误'
      });
    }

    // 生成JWT令牌
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      status: 'success',
      token,
      user: { username }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      status: 'error',
      error: '登录失败，请稍后重试'
    });
  }
});

export default router;