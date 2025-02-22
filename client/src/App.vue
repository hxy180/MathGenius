<!--
 * @author xyhou
 * @date 2025.2
-->
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import 'mathjax/es5/tex-svg'
import HistorySidebar from './components/HistorySidebar.vue'

interface MathJaxConfig {
  loader: {
    load: string[]
  }
  tex: {
    inlineMath: string[][]
    displayMath: string[][]
    processEscapes: boolean
    packages: { '[+]': string[] }
    tags: string
    macros: Record<string, string>
    formatError: (jax: any, err: any) => any
  }
  svg: {
    fontCache: string
    scale: number
    minScale: number
    mtextInheritFont: boolean
  }
  options: {
    enableMenu: boolean
    processHtmlClass: string
    skipHtmlTags: string[]
    renderActions: Record<string, any[]>
  }
  startup: {
    ready: () => void
  }
}

const question = ref('')
const displayQuestion = ref('')
const answer = ref('')
const loading = ref(false)
const history = ref<Array<{ question: string; answer: string; qaHistory: Array<{ question: string; answer: string }> }>>([]);
const currentQA = ref<Array<{ question: string; answer: string; originalQuestion?: string }>>([]);
const selectedHistoryIndex = ref<number>(-1);
// 移除未使用的变量

onMounted(() => {
  // 配置 MathJax，优化数学公式渲染
  (window as any).MathJax = {
    loader: {
      load: ['[tex]/ams', '[tex]/newcommand', '[tex]/html']
    },
    tex: {
      inlineMath: [['$', '$']],
      displayMath: [['$$', '$$']],
      processEscapes: true,
      packages: {'[+]': ['ams', 'newcommand', 'html']},
      tags: 'ams',
      macros: {
        R: '\\mathbb{R}',
        N: '\\mathbb{N}',
        Z: '\\mathbb{Z}'
      },
      formatError: (jax: any, err: any) => {
        return jax.formatError(err);
      }
    },
    svg: {
      fontCache: 'global',
      scale: 1.2,
      minScale: 0.5,
      mtextInheritFont: true
    },
    options: {
      enableMenu: false,
      processHtmlClass: 'math-tex',
      skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
      renderActions: {
        addMenu: [0, '', '']
      }
    },
    startup: {
      ready: () => {
        (window as any).MathJax.startup.defaultReady();
        (window as any).MathJax.startup.promise.then(() => {
          console.log('MathJax 初始化完成');
        });
      }
    }
  }

  // 从 localStorage 加载历史记录
  const savedHistory = localStorage.getItem('mathHistory')
  if (savedHistory) {
    history.value = JSON.parse(savedHistory)
  }
})

// 在 handleSubmit 函数中添加滚动逻辑
// 修改 handleSubmit 函数，添加清空输入框的逻辑
const handleSubmit = async () => {
  if (!question.value.trim()) {
    answer.value = '请输入数学问题';
    return;
  }

  try {
    loading.value = true;
    displayQuestion.value = question.value;

    // 在发送请求前添加到历史记录
    const originalQuestion = currentQA.value.length > 0 ? currentQA.value[0].originalQuestion || currentQA.value[0].question : question.value;
    const newHistoryItem = {
      question: originalQuestion,
      answer: '正在生成答案...',
      qaHistory: [...(currentQA.value.map(qa => ({
        question: qa.question,
        answer: qa.answer
      }))), {
        question: question.value,
        answer: '正在生成答案...'
      }]
    };

    // 检查是否存在相同的原始问题
    const existingIndex = history.value.findIndex(h => 
      h.qaHistory[0].question === originalQuestion
    );

    if (existingIndex >= 0) {
      history.value[existingIndex] = newHistoryItem;
    } else {
      history.value.unshift(newHistoryItem);
    }

    const requestBody = {
      question: question.value,
      originalQuestion: originalQuestion
    };

    const response = await fetch('http://localhost:3001/api/solve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    let data;
    try {
      const textResponse = await response.text();
      data = JSON.parse(textResponse);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('服务器返回的数据格式不正确');
    }

    if (!response.ok) {
      throw new Error(data?.error || '网络请求失败，请检查服务器连接');
    }
    
    if (!data) {
      throw new Error('服务器返回空响应');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.answer) {
      throw new Error('服务器返回的数据缺少答案字段');
    }

    const markedContent = marked(data.answer, {
      breaks: true,
      // sanitize: true,  // 启用 sanitize 以防止 XSS 攻击
      // headerIds: false,
      gfm: true,       // 启用 GitHub Flavored Markdown
      pedantic: false, // 不要过于严格的解析
      // mangle: false    // 防止修改数学公式中的特殊字符
    });
    
    // 保留数学公式的格式，仅移除多余的空格和不必要的符号
    answer.value = markedContent.toString()
      .replace(/\\\[(.*?)\\\]/g, (_, p1) => `$$${p1.trim()}$$`)
      .replace(/\\\((.*?)\\\)/g, (_, p1) => `$${p1.trim()}$`)
      .replace(/\\quad/g, ' ')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\times/g, '×')
      .replace(/\\cdots/g, '...')
      .replace(/\\boxed\{([^}]+)\}/g, '$1')
      .replace(/\\neq/g, '≠')
      .replace(/\\cdot/g, '·')
      .replace(/\\pm/g, '±')
      .replace(/\\Rightarrow/g, '⇒')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\(([^)]+)\)/g, '$1')
      .replace(/\[([^\]]+)\]/g, '$1')
      .trim();

    currentQA.value.push({
      question: displayQuestion.value,
      answer: answer.value,
      originalQuestion: currentQA.value.length > 0 ? currentQA.value[0].originalQuestion || currentQA.value[0].question : question.value
    });

    // 更新历史记录中的答案
    if (existingIndex >= 0) {
      history.value[existingIndex].answer = answer.value;
      history.value[existingIndex].qaHistory[history.value[existingIndex].qaHistory.length - 1].answer = answer.value;
    } else {
      history.value[0].answer = answer.value;
      history.value[0].qaHistory[history.value[0].qaHistory.length - 1].answer = answer.value;
    }
    
    localStorage.setItem('mathHistory', JSON.stringify(history.value));
    question.value = '';
    
    // 优化后的渲染逻辑
await nextTick();
    if ((window as any).MathJax) {
      await (window as any).MathJax.typesetPromise();
      console.log('公式重新渲染完成');

      const chatMessages = document.querySelector('.chat-messages');
      chatMessages?.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
      });
    }
  } catch (error) {
    console.error('Error:', error);
    answer.value = `错误：${error instanceof Error ? error.message : '发生未知错误，请稍后重试。'}`;
  } finally {
    loading.value = false;
  }
};


const clearHistory = () => {
  history.value = []
  localStorage.removeItem('mathHistory')
}
// 在 script 部分添加新的方法
const clearChat = () => {
  if (currentQA.value.length > 0) {
    const qaHistory = currentQA.value.map(qa => ({
      question: qa.question,
      answer: qa.answer
    }));
    
    // 检查是否存在相同的原始问题
    const originalQuestion = currentQA.value[0].originalQuestion || currentQA.value[0].question;
    const existingIndex = history.value.findIndex(h => 
      h.qaHistory[0].question === originalQuestion
    );
    
    if (existingIndex >= 0) {
      // 更新现有历史记录
      history.value[existingIndex].qaHistory = qaHistory;
    } else {
      // 创建新的历史记录
      history.value.unshift({
        question: originalQuestion,
        answer: qaHistory[qaHistory.length - 1].answer,
        qaHistory: qaHistory
      });
    }
    
    localStorage.setItem('mathHistory', JSON.stringify(history.value));
  }
  
  question.value = '';
  answer.value = '';
  currentQA.value = [];
  selectedHistoryIndex.value = -1;
};

const loadHistoryItem = async (item: { question: string; answer: string; qaHistory: Array<{ question: string; answer: string }> }, index: number) => {
  selectedHistoryIndex.value = index;
  currentQA.value = item.qaHistory.map(qa => ({
    question: qa.question,
    answer: qa.answer,
    originalQuestion: item.qaHistory[0].question
  }));
  
  await nextTick();
  if ((window as any).MathJax) {
    await (window as any).MathJax.typesetPromise();
    console.log('历史记录公式渲染完成');
  }
};

const clearQuestion = () => {
  question.value = '';
  answer.value = '';
  
  // 只在当前对话中添加提示语
  if (currentQA.value.length > 0) {
    currentQA.value.push({
      question: '',
      answer: '请继续提问',
      originalQuestion: currentQA.value[0]?.originalQuestion || currentQA.value[0]?.question
    });
  }

  // 滚动到底部
  setTimeout(() => {
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, 100);
};
</script>

<template>
  <div class="app-container">
    <!-- 左侧历史记录 -->
    <HistorySidebar
      :history="history"
      :selectedHistoryIndex="selectedHistoryIndex"
      @clearHistory="clearHistory"
      @clearChat="clearChat"
      @loadHistoryItem="loadHistoryItem"
    />

    <!-- 主要内容区 -->
    <div class="main-content">
      <div class="chat-container">
        <div class="chat-header">
          <h1 style="color: #ffffff;">MathGenius</h1>
          <div class="header-subtitle" style="color: #ececf1;">您的智能数学助手</div>
        </div>
        
        <div class="chat-messages" ref="chatMessages">
          <div class="welcome-message" v-if="currentQA.length === 0">
            <div class="message-content welcome-content" style="color: #ffffff;">
              <h2 style="color: #ffffff;"><i class="fas fa-robot" style="color: #ffffff;"></i> 欢迎使用 MathGenius</h2>
              <p>我是由xyhou开发的智能数学助手，可以帮您解答各种数学问题：</p>
              <ul style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; padding: 0;">
                                <li style="display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0;">
                                  <i class="fas fa-square-root-alt" style="color: #ffffff; width: 20px;"></i> 基础数学
                                </li>
                                <li style="display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0;">
                                  <i class="fas fa-superscript" style="color: #ffffff; width: 20px;"></i> 代数
                                </li>
                                <li style="display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0;">
                                  <i class="fas fa-draw-polygon" style="color: #ffffff; width: 20px;"></i> 几何
                                </li>
                                <li style="display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0;">
                                  <i class="fas fa-infinity" style="color: #ffffff; width: 20px;"></i> 高等数学
                                </li>
                              </ul>
              <p class="welcome-hint">请在下方输入您的数学问题，我会立即为您解答。</p>
            </div>
          </div>
          <template v-for="qa in currentQA" :key="qa.question">
            <div class="answer-section">
              <div class="message user-message" v-if="qa.question">
                <div class="avatar user-avatar">
                  <i class="fas fa-user"></i>
                </div>
                <div class="message-content math-tex">{{ qa.question }}</div>
              </div>
              <div class="message bot-message">
                <div class="avatar bot-avatar">
                  <i class="fas fa-robot"></i>
                </div>
                <div class="message-content math-tex" v-html="qa.answer"></div>
              </div>
            </div>
          </template>
          <div class="action-buttons" v-if="currentQA.length > 0">
            <button class="continue-button" @click="clearQuestion">
              <i class="fas fa-redo"></i>
              <span>继续提问</span>
            </button>
            <button class="solved-button" @click="clearChat">
              <i class="fas fa-check"></i>
              <span>已解决</span>
            </button>
          </div>
        </div>

        <div class="input-section">
          <textarea
            v-model="question"
            placeholder="请输入您的数学问题..."
            rows="3"
            @keydown.enter.exact.prevent="handleSubmit"
          ></textarea>
          <button @click="handleSubmit" :disabled="loading || !question.trim()">
            <span v-if="!loading">发送</span>
            <div v-else class="loading-dots">
              <span></span><span></span><span></span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

// 在 style 部分添加以下样式
<style>
@import './assets/styles/main.css';
</style>

<style scoped>
/* 公式显示优化 */
.math-tex {
  font-size: 1.1em;
  line-height: 1.6;
  color: #e0e0e0;
  overflow-x: auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* 消息样式 */
.message {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.user-message {
  align-items: flex-end;
}

.bot-message {
  align-items: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  margin: 0.5rem 0;
}

.user-message .message-content {
  background-color: #2b5278;
  color: #ffffff;
}

.bot-message .message-content {
  background-color: #1e1e1e;
  color: #ffffff;
}

/* SVG 公式容器 */
.MathJax_SVG {
  display: inline-block !important;
  vertical-align: middle;
}

/* 行内公式样式 */
mjx-container[jax="SVG"][display="inline"] {
  display: inline-block !important;
  margin: 0 0.2em !important;
}

/* 块级公式样式 */
mjx-container[jax="SVG"][display="block"] {
  margin: 1em 0 !important;
  text-align: center;
  width: 100%;
}
.avatar {
  width: 55px;
  height: 55px;
  min-width: 55px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.2rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.user-avatar {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border: 3px solid rgba(74, 144, 226, 0.4);
}

.bot-avatar {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  border: 3px solid rgba(40, 167, 69, 0.4);
}

.avatar i {
  font-size: 1.8rem;
  color: white;
}

.avatar:hover {
  transform: scale(1.08);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25);
}
</style>