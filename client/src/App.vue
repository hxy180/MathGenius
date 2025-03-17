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
// 添加流式响应相关的状态
const isStreaming = ref(false);
const streamedAnswer = ref('');
// 添加按钮显示控制状态
const showActionButtons = ref(false);

onMounted(() => {
  // 配置 MathJax，优化数学公式渲染
  (window as any).MathJax = {
    loader: {
      load: ['[tex]/ams', '[tex]/newcommand', '[tex]/html', '[tex]/noerrors', '[tex]/noundefined', '[tex]/configmacros', '[tex]/tagformat', '[tex]/color', '[tex]/colortbl', '[tex]/bbox']
    },
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
      processEnvironments: true,
      packages: {'[+]': ['ams', 'newcommand', 'html', 'noerrors', 'noundefined', 'configmacros', 'tagformat', 'color', 'colortbl', 'bbox']},
      tags: 'ams',
      macros: {
        // 基础符号
        R: '\\mathbb{R}',
        N: '\\mathbb{N}',
        Z: '\\mathbb{Z}',
        Q: '\\mathbb{Q}',
        C: '\\mathbb{C}',
        // 运算符
        sum: '\\sum',
        max: '\\max',
        min: '\\min',
        frac: '\\frac',
        dots: '\\dots',
        ldots: '\\ldots',
        cdots: '\\cdots',
        vdots: '\\vdots',
        ddots: '\\ddots',
        // 关系符号
        equiv: '\\equiv',
        mid: '\\mid',
        parallel: '\\parallel',
        nparallel: '\\nparallel',
        // 模运算
        mod: '\\mod',
        pmod: '\\pmod',
        // 集合符号
        emptyset: '\\emptyset',
        varnothing: '\\varnothing',
        // 逻辑符号
        implies: '\\Rightarrow',
        iff: '\\Leftrightarrow',
        exists: '\\exists',
        forall: '\\forall',
        // 其他常用符号
        infty: '\\infty',
        nabla: '\\nabla',
        partial: '\\partial',
        // 向量符号
        vec: '\\vec',
        overrightarrow: '\\overrightarrow'
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

  // 添加MathJax自动渲染观察器
  setTimeout(() => {
    setupMathJaxObserver();
  }, 1000);

  // 不再需要监听滚动事件，因为我们已经删除了滚动到底部按钮
})

// 设置MathJax自动渲染观察器
const setupMathJaxObserver = () => {
  if (!(window as any).MathJax) {
    console.error('MathJax not loaded');
    return;
  }

  let timeout: number | null = null;
  const delay = 500;

  const observer = new MutationObserver(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => {
      try {
        (window as any).MathJax.typeset();
      } catch (err) {
        console.error('MathJax typeset error:', err);
      }
    }, delay);
  });

  observer.observe(document.body, { childList: true, subtree: true });
  console.log('MathJax observer setup complete');
};

// 预处理LaTeX公式
const preprocessLatex = (text: string): string => {
  if (!text) return '';
  
  return text
    // 修复常见的LaTeX命令
    .replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, '\\sum_{$1}^{$2}')
    .replace(/\\max\{([^}]+)\}/g, '\\max\\{$1\\}')
    .replace(/\\min\{([^}]+)\}/g, '\\min\\{$1\\}')
    .replace(/\\dots/g, '\\ldots')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '\\frac{$1}{$2}')
    // 确保下标和上标正确
    .replace(/_([\w\d]+)(?![{])/g, '_{$1}')
    .replace(/\^([\w\d]+)(?![{])/g, '^{$1}')
    // 处理其他常见问题
    .replace(/\\geq/g, '\\geq ')
    .replace(/\\leq/g, '\\leq ')
    .replace(/\\neq/g, '\\neq ')
    .replace(/\\cdot/g, '\\cdot ')
    .replace(/\\pm/g, '\\pm ')
    .replace(/\\Rightarrow/g, '\\Rightarrow ')
    // 添加更多LaTeX符号处理
    .replace(/\\mid/g, '\\mid ')
    .replace(/\\equiv/g, '\\equiv ')
    .replace(/\\mod/g, '\\mod ')
    .replace(/\\pmod/g, '\\pmod ')
    .replace(/od\{([^}]+)\}/g, '\\pmod{$1}')
    .replace(/\\ldots/g, '\\ldots ')
    .replace(/\\cdots/g, '\\cdots ')
    .replace(/\\vdots/g, '\\vdots ')
    .replace(/\\ddots/g, '\\ddots ')
    // 集合符号
    .replace(/\\emptyset/g, '\\emptyset ')
    .replace(/\\in/g, '\\in ')
    // 添加新的处理规则
    .replace(/([0-9]+)n/g, '$1n')
    .replace(/n\^\{1\}\^\{([^}]+)\}/g, 'n^{$1}')
    .replace(/n\^(\d+)/g, 'n^{$1}')
    .replace(/x_(\d+)/g, 'x_{$1}')
    .replace(/([<>])\s*-\\frac/g, '$1 -\\frac')
    .replace(/\\frac(\{[^}]+\}\{[^}]+\})/g, '\\frac$1')
    .replace(/\\times/g, '\\times ')
    .replace(/\\Delta/g, '\\Delta ')
    .replace(/\\in/g, '\\in ')
    .replace(/\\notin/g, '\\notin ')
    .replace(/\\subset/g, '\\subset ')
    .replace(/\\subseteq/g, '\\subseteq ')
    .replace(/\\supset/g, '\\supset ')
    .replace(/\\supseteq/g, '\\supseteq ')
    .replace(/\\cup/g, '\\cup ')
    .replace(/\\cap/g, '\\cap ')
    .replace(/\\setminus/g, '\\setminus ')
    // 逻辑符号
    .replace(/\\forall/g, '\\forall ')
    .replace(/\\exists/g, '\\exists ')
    .replace(/\\neg/g, '\\neg ')
    .replace(/\\lor/g, '\\lor ')
    .replace(/\\land/g, '\\land ')
    .replace(/\\Rightarrow/g, '\\Rightarrow ')
    .replace(/\\Leftarrow/g, '\\Leftarrow ')
    .replace(/\\Leftrightarrow/g, '\\Leftrightarrow ')
    // 括号处理
    .replace(/\\left\(/g, '\\left( ')
    .replace(/\\right\)/g, '\\right) ')
    .replace(/\\left\[/g, '\\left[ ')
    .replace(/\\right\]/g, '\\right] ')
    .replace(/\\left\\{/g, '\\left\\{ ')
    .replace(/\\right\\}/g, '\\right\\} ')
    // 修复常见错误格式
    .replace(/\{([^{}]*),\s*([^{}]*),\s*\\ldots,\s*([^{}]*)\}/g, '\\{$1, $2, \\ldots, $3\\}');
};

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

    // 隐藏操作按钮，因为开始新的提问
    showActionButtons.value = false;

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

    // 添加当前问题到对话历史
    currentQA.value.push({
      question: displayQuestion.value,
      answer: '正在思考...',
      originalQuestion: currentQA.value.length > 0 ? currentQA.value[0].originalQuestion || currentQA.value[0].question : question.value
    });

    // 重置流式响应状态
    isStreaming.value = true;
    streamedAnswer.value = '';

    // 使用流式API，确保连接到正确的服务器端口
    const serverUrl = 'http://localhost:3001'; // 服务器地址
    const eventSource = new EventSource(`${serverUrl}/api/solve/stream?question=${encodeURIComponent(question.value)}`);
    
    // 处理流式事件
    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.status === 'start') {
          // 流开始
          console.log('流式响应开始');
        } else if (data.status === 'chunk') {
          // 接收内容块
          streamedAnswer.value += data.content;
          
          // 更新当前对话中的最后一个回答
          if (currentQA.value.length > 0) {
            const markedContent = marked(streamedAnswer.value, {
              breaks: true,
              gfm: true,
              pedantic: false,
            });
            
            // 预处理LaTeX公式，然后应用其他格式化
            const formattedAnswer = preprocessLatex(markedContent.toString())
              .replace(/\\\[(.*?)\\\]/g, (_, p1) => `$$${p1.trim()}$$`)
              .replace(/\\\((.*?)\\\)/g, (_, p1) => `$${p1.trim()}$`)
              .replace(/\\quad/g, ' ')
              .replace(/\\text\{([^}]+)\}/g, '$1')
              .replace(/\\times/g, '×')
              .trim();
            
            currentQA.value[currentQA.value.length - 1].answer = formattedAnswer;
            
            // 更新历史记录
            if (existingIndex >= 0) {
              history.value[existingIndex].answer = formattedAnswer;
              history.value[existingIndex].qaHistory[history.value[existingIndex].qaHistory.length - 1].answer = formattedAnswer;
            } else {
              history.value[0].answer = formattedAnswer;
              history.value[0].qaHistory[history.value[0].qaHistory.length - 1].answer = formattedAnswer;
            }
            
            // 不再自动滚动到底部，允许用户自由滚动
            // 只在收到包含数学公式的内容时尝试渲染
            const hasLatex = data.content && (
              data.content.includes('$') || 
              data.content.includes('\\') || 
              /\\[a-zA-Z]+/.test(data.content)
            );
            
            if (hasLatex) {
              await nextTick();
              if ((window as any).MathJax) {
                try {
                  await (window as any).MathJax.typesetPromise();
                } catch (mathJaxError) {
                  console.error('MathJax渲染错误:', mathJaxError);
                }
              }
            }
          }
        } else if (data.status === 'done') {
          // 流结束
          console.log('流式响应完成');
          eventSource.close();
          isStreaming.value = false;
          
          // 显示操作按钮
          showActionButtons.value = true;
          
          // 保存最终结果到localStorage
          localStorage.setItem('mathHistory', JSON.stringify(history.value));
          
          // 在回答完成后，再次尝试渲染所有数学公式
          await nextTick();
          if ((window as any).MathJax) {
            try {
              // 强制重新渲染所有公式
              document.querySelectorAll('.math-tex').forEach(el => {
                el.setAttribute('data-needs-typeset', 'true');
              });
              
              await (window as any).MathJax.typesetPromise();
              console.log('最终数学公式渲染完成');
            } catch (mathJaxError) {
              console.error('最终MathJax渲染错误:', mathJaxError);
            }
          }
        } else if (data.status === 'error') {
          // 处理错误
          console.error('流式响应错误:', data.error);
          eventSource.close();
          isStreaming.value = false;
          
          if (currentQA.value.length > 0) {
            currentQA.value[currentQA.value.length - 1].answer = `错误：${data.error}`;
          }
        }
      } catch (parseError) {
        console.error('解析流式数据错误:', parseError);
      }
    };
    
    // 处理错误
    eventSource.onerror = (error) => {
      console.error('EventSource错误:', error);
      eventSource.close();
      isStreaming.value = false;
      
      if (currentQA.value.length > 0) {
        currentQA.value[currentQA.value.length - 1].answer = '连接错误，请重试';
      }
    };
    
    question.value = '';
  } catch (error) {
    console.error('Error:', error);
    answer.value = `错误：${error instanceof Error ? error.message : '发生未知错误，请稍后重试。'}`;
    isStreaming.value = false;
  } finally {
    loading.value = false;
  }
};


const clearHistory = () => {
  // 完全清空历史记录
  history.value = []
  localStorage.removeItem('mathHistory')
  
  // 同时清空当前对话
  currentQA.value = []
  question.value = ''
  answer.value = ''
  selectedHistoryIndex.value = -1
  showActionButtons.value = false
}
// 在 script 部分添加新的方法
const clearChat = () => {
  // 隐藏操作按钮
  showActionButtons.value = false;
  
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
  
  // 显示操作按钮，因为历史记录中的对话已经完成
  showActionButtons.value = true;
  isStreaming.value = false;
  
  await nextTick();
  if ((window as any).MathJax) {
    try {
      // 强制重新渲染所有公式
      document.querySelectorAll('.math-tex').forEach(el => {
        el.setAttribute('data-needs-typeset', 'true');
      });
      
      await (window as any).MathJax.typesetPromise();
      console.log('历史记录公式渲染完成');
    } catch (mathJaxError) {
      console.error('历史记录MathJax渲染错误:', mathJaxError);
    }
  }
};

const clearQuestion = () => {
  question.value = '';
  answer.value = '';
  
  // 立即隐藏操作按钮
  showActionButtons.value = false;
  
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
    const chatMessages = document.querySelector('.conversation-container');
    if (chatMessages) {
      chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, 100);
};

// 添加滚动到底部的函数
const scrollToBottom = () => {
  const chatMessages = document.querySelector('.conversation-container');
  if (chatMessages) {
    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: 'smooth'
    });
  }
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
          <div class="conversation-container">
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
            
            <!-- 操作按钮区域 - 放在回答下方 -->
            <div class="action-buttons" v-if="currentQA.length > 0 && showActionButtons && !isStreaming">
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
          
          <!-- 删除滚动到底部按钮 -->
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
/* 应用容器样式 */
.app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
}

/* 主内容区域样式 */
.main-content {
  margin-left: 5px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #121212;
  overflow: hidden;
  padding: 1rem 0;
  flex: 1;
}

/* 聊天容器样式 */
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  position: relative;
  padding-left: 0.125rem;
  overflow: hidden;
}

/* 对话区域固定大小 */
.chat-messages {
  flex: 1;
  overflow: hidden;
  padding: 1rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 1100px;
  background-color: #1a1a1a;
  border-radius: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  min-height: 0;
}

/* 对话内容容器 */
.conversation-container {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
  width: 100%;
  min-height: 0;
  max-height: calc(100vh - 200px);
}

/* 公式显示优化 */
.math-tex {
  font-size: 1.1em;
  line-height: 1.6;
  color: #e0e0e0;
  overflow-x: auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* 聊天头部样式 */
.chat-header {
  width: 1100px;
  background-color: #2d2d30;
  padding: 1rem;
  text-align: center;
  border-radius: 12px 12px 0 0;
  margin: 0;
  flex-shrink: 0;
}

/* 消息内容样式优化 */
.message-content {
  max-width: 85%;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  margin: 0.5rem 0;
  word-wrap: break-word; /* 确保长文本换行 */
  overflow-wrap: break-word;
}

/* 输入区域固定在底部 */
.input-section {
  display: flex;
  padding: 1rem;
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 0 0 12px 12px;
  position: relative;
  z-index: 20;
  width: 1100px;
  margin: 0;
  flex-shrink: 0;
  height: 100px;
}

/* 操作按钮样式 - 修改为非固定位置 */
.action-buttons {
  display: flex;
  gap: 10px;
  background-color: rgba(30, 30, 30, 0.8);
  padding: 12px 18px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  margin: 20px auto 10px auto; /* 上下边距，水平居中 */
  width: fit-content; /* 根据内容调整宽度 */
  transition: all 0.3s ease;
}

/* 继续提问按钮 */
.continue-button {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.continue-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.continue-button i {
  font-size: 0.9rem;
}

/* 已解决按钮 */
.solved-button {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.solved-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.solved-button i {
  font-size: 0.9rem;
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

/* 优化输入框样式 */
.input-section textarea {
  flex: 1;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #444;
  background-color: #2a2a2a;
  color: #fff;
  font-size: 1rem;
  resize: none;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.5;
  overflow-y: auto;
  max-height: 150px;
}

.input-section textarea:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.input-section button {
  margin-left: 0.75rem;
  padding: 0 1.5rem;
  height: 100%;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
}

.input-section button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.input-section button:disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 修复输入框滚动条样式 */
.input-section textarea::-webkit-scrollbar {
  width: 8px;
}

.input-section textarea::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 4px;
}

.input-section textarea::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.input-section textarea::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* 欢迎消息样式 - 确保与其他对话一致 */
.welcome-message {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
  width: 100%;
}

.welcome-content {
  max-width: 85%;
  text-align: center;
}

.welcome-hint {
  margin-top: 1.5rem;
  font-style: italic;
  opacity: 0.9;
}

/* 响应式调整 */
@media (max-width: 1600px) {
  .chat-messages,
  .chat-header,
  .input-section {
    width: calc(100% - 0.25rem);
    max-width: 1100px;
  }
  
  .conversation-container {
    max-height: calc(100vh - 180px);
  }
}

/* 删除不再需要的样式 */
.action-buttons-container {
  display: none;
}

.scroll-to-bottom-button {
  display: none;
}

/* 修复对话区域中的消息布局 */
.answer-section {
  width: 100%;
  margin-bottom: 20px;
}

/* 确保对话区域在新对话和已有对话中保持一致的大小 */
.welcome-message .welcome-content {
  max-width: 85%;
  margin: 0 auto;
}
</style>