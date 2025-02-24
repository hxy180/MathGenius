<template>
  <div class="auth-container">
    <div class="auth-box">
      <div class="auth-header">
        <h2>{{ isLogin ? '登录' : '注册' }}</h2>
        <p class="switch-mode" @click="toggleMode">
          {{ isLogin ? '没有账号？点击注册' : '已有账号？点击登录' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <input
            type="text"
            v-model="form.username"
            placeholder="用户名"
            required
          />
        </div>

        <div class="form-group">
          <input
            type="password"
            v-model="form.password"
            placeholder="密码"
            required
          />
        </div>

        <div class="form-group" v-if="!isLogin">
          <input
            type="password"
            v-model="form.confirmPassword"
            placeholder="确认密码"
            required
          />
        </div>

        <button type="submit" class="auth-button" :disabled="loading">
          {{ loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
// 确保先安装vue-router依赖: npm install vue-router@4
// 需要先安装vue-router: npm install vue-router@4
import { useRouter } from 'vue-router';

const router = useRouter();
const isLogin = ref(true);
const loading = ref(false);
const error = ref('');

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
});

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  error.value = '';
  form.username = '';
  form.password = '';
  form.confirmPassword = '';
};

const handleSubmit = async () => {
  error.value = '';
  loading.value = true;

  try {
    if (!isLogin.value && form.password !== form.confirmPassword) {
      throw new Error('两次输入的密码不一致');
    }

    const response = await fetch(`http://localhost:3001/api/auth/${isLogin.value ? 'login' : 'register'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: form.username,
        password: form.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '操作失败');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/');
  } catch (err) {
    error.value = err instanceof Error ? err.message : '操作失败';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-color);
}

.auth-box {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 8px;
  background-color: var(--card-bg-color);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h2 {
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.switch-mode {
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.9rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--input-bg-color);
  color: var(--text-color);
  font-size: 1rem;
}

.auth-button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: var(--primary-color);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.auth-button:disabled {
  background-color: var(--disabled-color);
  cursor: not-allowed;
}

.error-message {
  color: var(--error-color);
  text-align: center;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
</style>