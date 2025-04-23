import request from "@/utils/request";

// 用户登录
export const login = (username: string, password: string) => {
  return request({
    url: '/users/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

// 用户注册
export const register = (username: string, password: string, email: string) => {
  return request({
    url: '/users/register',
    method: 'post',
    data: {
      username,
      password,
      email
    }
  })
}