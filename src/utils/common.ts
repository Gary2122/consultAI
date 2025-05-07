// 判断空值
export const isEmpty = (value: any): boolean => {
  // 处理 null 和 undefined
  if (value == null) return true; // [6](@ref)

  // 处理基本类型（数字、布尔值等）
  if (typeof value !== "object" && typeof value !== "function") {
    return value === ""; // 仅空字符串视为空（参考Java的isEmpty逻辑）[2](@ref)
  }

  // 处理数组和类数组对象
  if (Array.isArray(value) || value instanceof String) {
    return value.length === 0;
  }

  // 处理Map/Set
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }

  // 处理空对象（包括通过Object.create(null)创建的无原型对象）
  if (value.constructor === Object) {
    return Object.keys(value).length === 0; // [1,2](@ref)
  }

  // 处理Promise等特殊对象（无法判断内容状态，默认非空）
  return false;
};
