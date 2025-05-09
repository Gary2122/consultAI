<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">weiLIng微聆</h2>
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" class="login-button"
            >登录</el-button
          >
        </el-form-item>
      </el-form>
      <div class="register-link">
        <router-link to="/register">还没有账号？立即注册</router-link>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { login, getLoginStatus } from "@/api/user";
import type { FormInstance } from "element-plus";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const loginFormRef = ref<FormInstance | null>(null);
const userStore = useUserStore();

interface LoginForm {
  username: string;
  password: string;
}
const loginForm = reactive<LoginForm>({
  username: "",
  password: "",
});

const loginRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const handleLogin = () => {
  loginFormRef.value?.validate((valid) => {
    if (valid) {
      const { username, password } = loginForm;
      login(username, password).then((res) => {
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        userStore.setToken(token);
        userStore.setUserInfo(user);
        router.replace("/home");
      });
    }
  });
};
// 检测是否登录过，如果是则自动跳转到首页
const handleAutoLogin = async () => {
  const res = await getLoginStatus();
  const { success: userLoginStatus } = res.data;
  if (!userLoginStatus) {
    return;
  }
  router.replace("/home");
};

onMounted(() => {
  handleAutoLogin();
});
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  // background-color: #f5f7fa;
  background: url("@/assets/img/user/loginBg.jpg") no-repeat center/cover;
}

.login-card {
  width: 400px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
  color: #303133;
}

.login-button {
  width: 100%;
}

.register-link {
  text-align: center;
  margin-top: 10px;
  color: #409eff;
  font-size: 14px;
}
</style>
