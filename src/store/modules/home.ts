import { ref } from "vue";
import { defineStore } from "pinia";

export const useMainStore = defineStore("home", () => {
  const count = ref(0);
  const add = () => {
    count.value++;
  };
  const minus = () => {
    count.value--;
  };
  return { count, add, minus };
});
