<script setup lang="ts">
import { ref } from 'vue'

interface HistoryItem {
  question: string;
  answer: string;
  qaHistory: Array<{ question: string; answer: string }>;
}

defineProps<{
  history: HistoryItem[];
  selectedHistoryIndex: number;
}>();

const emit = defineEmits<{
  clearHistory: [];
  clearChat: [];
  loadHistoryItem: [item: HistoryItem, index: number];
}>();

const confirmClear = () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    emit('clearHistory');
  }
};
</script>

<template>
  <div class="history-sidebar">
    <div class="sidebar-header">
      <h2>历史记录</h2>
      <div class="header-buttons">
        <button class="action-button new-chat-button" @click="emit('clearChat')" title="新对话">
          <i class="fas fa-plus"></i>
        </button>
        <button class="action-button clear-button" @click="confirmClear" title="清空历史记录">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    <div class="history-list">
      <div
        v-for="(item, index) in history"
        :key="index"
        class="history-item"
        :class="{ 'selected': index === selectedHistoryIndex }"
        @click="emit('loadHistoryItem', item, index)"
      >
        <div class="history-item-content">
          <div class="question">{{ item.question }}</div>
          <div class="answer-preview">{{ item.answer?.substring(0, 50) }}...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-sidebar {
  width: 280px;
  height: 100vh;
  background-color: #1e1e1e;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
  z-index: 1;
  position: relative;
  overflow: hidden;
}

@media (max-width: 768px) {
  .history-sidebar {
    width: 240px;
  }
}

.sidebar-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
}

.sidebar-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.2rem;
}

.header-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.3s;
  border-radius: 4px;
}

.new-chat-button:hover {
  color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.1);
}

.clear-button:hover {
  color: #ff4444;
  background-color: rgba(255, 68, 68, 0.1);
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.8rem;
  -webkit-overflow-scrolling: touch;
}

.history-item {
  padding: 0.8rem;
  margin-bottom: 0.8rem;
  background-color: #2d2d2d;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  max-width: 100%;
}

.history-item:hover {
  background-color: #363636;
}

.history-item.selected {
  background-color: #404040;
  border-color: #666;
}

.history-item-content .question {
  color: #fff;
  font-weight: 500;
  margin-bottom: 0.5rem;
  word-break: break-word;
  font-size: 0.9rem;
  line-height: 1.4;
}

.history-item-content .answer-preview {
  color: #999;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>