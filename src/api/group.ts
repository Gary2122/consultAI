import axios from "axios";

// API基础URL
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// 创建新群组
export const createGroup = async (groupData: {
  name: string;
  description?: string;
  isPrivate?: boolean;
}) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_URL}/api/groups`, groupData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 获取用户的所有群组
export const getUserGroups = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/api/groups/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 获取指定ID的群组
export const getGroupById = async (groupId: string) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/api/groups/${groupId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 更新群组信息
export const updateGroup = async (
  groupId: string,
  updateData: {
    name?: string;
    description?: string;
    avatar?: string;
    isPrivate?: boolean;
  }
) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${API_URL}/api/groups/${groupId}`,
    updateData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// 删除群组
export const deleteGroup = async (groupId: string) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${API_URL}/api/groups/${groupId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 添加群组成员
export const addGroupMember = async (
  groupId: string,
  userId: string,
  role = "member"
) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/api/groups/${groupId}/members`,
    { userId, role },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// 移除群组成员
export const removeGroupMember = async (groupId: string, userId: string) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(
    `${API_URL}/api/groups/${groupId}/members/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// 获取群组成员
export const getGroupMembers = async (groupId: string) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/api/groups/${groupId}/members`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 获取群组消息
export const getGroupMessages = async (groupId: string) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/api/groups/${groupId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export default {
  createGroup,
  getUserGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  getGroupMembers,
  getGroupMessages,
};
