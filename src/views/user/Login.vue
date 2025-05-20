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
import socketService from "@/services/socket";
import { ElMessage } from "element-plus";

// 定义API响应接口
interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    status?: string;
    avatar?: string;
    privacySettings?: any;
  };
}

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
  loginFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        const { username, password } = loginForm;
        const response = (await login(username, password)) as LoginResponse;

        if (response.success && response.token && response.user) {
          // 确保用户对象和token存在
          const { token, user } = response;
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          userStore.setToken(token);
          userStore.setUserInfo(user);

          // 设置用户在线状态
          userStore.setStatus("online");

          // 初始化Socket.IO连接
          socketService.init();
          socketService.connect(token);
          console.log("Socket.IO服务初始化并连接 - 登录成功");

          router.replace("/home");
        } else {
          ElMessage.error(response.message || "登录失败，请检查用户名和密码");
        }
      } catch (error: any) {
        console.error("登录失败:", error);
        ElMessage.error(error.message || "登录失败，请稍后重试");
      }
    }
  });
};

// 检测是否登录过，如果是则自动跳转到首页
const handleAutoLogin = async () => {
  try {
    const response = (await getLoginStatus()) as any;
    if (response.success) {
      router.replace("/home");
    }
  } catch (error) {
    console.error("检查登录状态失败:", error);
  }
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
