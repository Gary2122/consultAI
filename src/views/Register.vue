<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2 class="register-title">weiLIng微聆</h2>
      <el-form
        :model="registerForm"
        :rules="registerRules"
        ref="registerFormRef"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            prefix-icon="el-icon-message"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
          ></el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            prefix-icon="el-icon-lock"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            v-loading.fullscreen.lock="fullscreenLoading"
            @click="handleRegister"
            class="register-button"
            >注册</el-button
          >
        </el-form-item>
      </el-form>
      <div class="login-link">
        <router-link to="/login">已有账号？立即登录</router-link>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { register, login } from "@/api/user";
import { FormInstance, FormRules, ElMessage } from "element-plus";

const router = useRouter();
const registerFormRef = ref<FormInstance | null>(null);
const fullscreenLoading = ref(false);
interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
const registerForm = reactive<RegisterForm>({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const validateConfirmPassword = (
  rule: FormRule,
  value: string,
  callback: (error?: Error) => void
) => {
  if (value !== registerForm.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const registerRules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    {
      type: "email",
      message: "请输入正确的邮箱格式",
      trigger: ["blur", "change"],
    },
  ],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  confirmPassword: [
    { required: true, message: "请确认密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" },
  ],
};

const handleRegister = () => {
  fullscreenLoading.value = true;
  registerFormRef.value?.validate((valid) => {
    if (valid) {
      const { username, password, email, confirmPassword } = registerForm;
      if (confirmPassword !== password) {
        return;
      }
      register(username, password, email)
        .then((res) => {
          ElMessage({
            message: "注册成功，正在自动登录...",
            grouping: true,
            type: "success",
          });
          setTimeout(() => {
            login(username, password)
              .then((res) => {
                fullscreenLoading.value = false;
                localStorage.setItem("token", res.data.token);
                router.push("/home");
              })
              .catch((error) => {
                ElMessage.error("登录失败，请到登录页登录");
                fullscreenLoading.value = false;
                router.push("/login");
              });
          }, 500);
        })
        .catch(() => {
          ElMessage.error("注册失败，请稍后再试");
          fullscreenLoading.value = false;
        });
    }
  });
};
</script>

<style lang="scss" scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url("@/assets/img/user/loginBg.jpg") no-repeat center/cover;
}

.register-card {
  width: 400px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.register-title {
  text-align: center;
  margin-bottom: 20px;
  color: #303133;
}

.register-button {
  width: 100%;
}

.login-link {
  text-align: center;
  margin-top: 10px;
  color: #409eff;
  font-size: 14px;
}
</style>
