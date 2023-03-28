// 定义一个 Counter 组件
export default {
  data() {
    return { count: 1}
  },
  template: `{{ count }} <button @click="count++">+</button>`,
}