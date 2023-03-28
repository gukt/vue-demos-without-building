## 概述

使用 [Vue](https://vuejs.org/) 不一定要引入构建工具，它能以单独的 JS 形式被应用，就像我们早期在网页中链接脚本那样。

如果我们只需要对页面中的某些局部小范围做局部增强，可以考虑使用这种方式。就像我们使用 jQuery 一样，但 Vue 是声明式的，比 jQuery 更方便好用。

Vue 也提供了另一个更适用于此类无构建步骤场景的版本 [petite-vue](https://github.com/vuejs/petite-vue)。它为渐进式增强已有的 HTML 作了特别的优化，功能更加精简，十分轻量。

## 引言

本文主要内容来自于对官网教程的实践和思路整理，演示了无需构建步骤的情况下，如何使用 Vue 对 HTML 的局部或多个局部进行增强。

因为我们不用任何包管理器，而是通过 `script` 标签引入 `Vue` 框架，这种方式的优缺点是：

- 优点：适合快速上手 Vue 框架，不用引入包管理器、也不用进行各种配置，修改后也不用重新打包等繁琐的事，直接开干。

- 缺点：该方式无法使用[单文件组件](https://cn.vuejs.org/guide/scaling-up/sfc.html#single-file-components)（SFC）语法。

Vue 官方提供了多种 Vue 版本，可当做独立 JS 使用：

1. 使用全局构建版本
2. 使用 ES 模块构建版本
3. 使用 [petite-vue](https://github.com/vuejs/petite-vue)

## 使用全局构建版本

该版本的所有顶层 API 都以属性的形式暴露在了全局的 `Vue` 对象上。

例如，我们要创建一个 Vue 应用实例，我们可以直接调用 `Vue.createApp(...)`

### 1. 引入 Vue

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
```

### 2. 创建一个 Vue 应用

新建一个 `index.html` 文件:

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

<div id="app"></div>

<script>
  Vue.createApp({
    data() {
      return {
        count: 0,
      };
    },
    template: `
        {{ count }} <button @click="count++">+</button>
      `,
  }).mount("#app");
</script>
```

通过 [createApp](https://cn.vuejs.org/api/application.html#createapp) 函数创建了一个 Vue 应用实例，然后将其挂载到了 `#app` 元素上，该元素被称为挂载点。Vue 实例的内容将会被渲染到这个元素中。

`createApp` 函数的第一个参数是指定 Vue 实例的根组件，可以传入一个外部导入的组件，也可以通过通过选项来定义组件

> NOTE：Vue 3 新提供了 [Composition API](https://cn.vuejs.org/guide/introduction.html#composition-api) 风格定义组件。

template 属性用以指定组件模板，我们这里采用的是一个内联模板。组件模板即最终组件被渲染成什么样子。

> 如果你正在使用 VSCode，你可以安装 [es6-string-html](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html) 扩展，然后在字符串前加上一个前缀注释 `/*html*/` 以高亮语法。- vuejs.org

也可以指定一个外部的模板文件、或使用挂载点内部的 innerHTML，作为根组件模板，后面会说明。

### 3. 运行

使用全局版本的 Vue，直接文件系统打开 `index.html` 即可预览效果。

[示例源码]()

### 4. 补充：其他方式指定组件模板

前面我们使用的是内联模板，但实际上还有其他方式指定 Vue 实例的根组件模板。

1. 使用挂载点内部的 `innerHTML` 作为根组件模板。

```html
<div id="app">{{ count }} <button @click="count++">+</button></div>
```

```js
Vue.createApp({
  data() {
    return { count: 1 };
  },
  // template: '...' <- 当没有指定时，默认使用挂载点的 innerHTML 作为模板
}).mount("#app");
```

**值得注意的是**：如果你同时也指定了 template 选项，那么挂载点内部的 `innerHTML` 将会被忽略。

2. 使用外部内容作为模板

```html
<div id="app"></div>

<template id="template">
  {{ count }} <button @click="count++">+</button>
</template>

<script>
  Vue.createApp({
    data() {
      return {
        count: 0,
      };
    },
    template: "#template",
  }).mount("#app");
</script>
```

[示例源码]()

## 使用 ES 模块构建版本

现代浏览器大多数已原生支持 [ES 模块](https://caniuse.com/es6-module)。所以我们可以像使用模块语法 `import` 使用 `Vue` 模块。

### 1. 引入 Vue

```html
<div id="app">{{ count }} <button @click="count++">+</button></div>

<script type="module">
  import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

  createApp({
    data() {
      return { count: 0 };
    },
  }).mount("#app");
</script>
```

与使用全局构建版本 Vue 不同的是：

- 这里需要使用 `<script type="module">` 来声明这个脚本是一个[模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)

- 引入的是 ESM 构建版本的 Vue。

[示例源码]()

上面导入的 `vue.esm-browser.js` 地址相当长，如果很多地方都这么写的话，维护起来很不方便容易出错。

我们可以使用导入映射表（[Import maps](https://caniuse.com/import-maps)）来[简化导入路径](https://cn.vuejs.org/guide/quick-start.html#enabling-import-maps)。

多数浏览器已经支持 Import maps 了，但仍有少数浏览器不支持，可以使用 [es-module-shims](https://github.com/guybedford/es-module-shims) 来进行 Polyfill。

## 使用 Petite Vue

[petite-vue](https://github.com/vuejs/petite-vue) 也是官方推出的，是为渐进增强优化的 Vue 的替代发行版，有以下特点：

- 只有 ~6kb。
- Vue 兼容的模板语法。
- 基于 DOM，就地改变。
- 通过驱动 @vue/reactivity

具体用法请参考[官方文档](https://github.com/vuejs/petite-vue#usage)

## 拆分模块，引入组件

随着项目规模的增长，我们可能需要将某些公共模块拆分，保存到单独的文件中。当需要时，使用 `import` 语句引入。

### 1. 定义组件

仍然以前面的例子为例，将 Counter 的逻辑拆分到单独的文件中。

```js
// Path: ./components/counter.js
export default {
  data() {
    return { count: 1 };
  },
  template: `{{ count }} <button @click="count++">+</button>`,
};
```

这里导出一个默认对象，该对象就是一个组件，和 [定义单文件组件语法 ](https://cn.vuejs.org/guide/essentials/component-basics.html#defining-a-component)相同。

### 2. 引入组件

```html
// Path: ./index.html
<div id="app"></div>

<!-- 
  使用 Import Maps 来告诉浏览器如何定位导入的 vue。
  https://cn.vuejs.org/guide/quick-start.html#enabling-import-maps
-->
<script type="importmap">
  {
    "imports": {
      "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
    }
  }
</script>

<script type="module">
  import { createApp } from "vue";
  // 在浏览器中的 ESM 模块中，指定导入的文件一定要带后缀名。
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
  import Counter from "./components/counter.js";

  // 通过 createApp 创建一个 Vue 应用实例。
  // 并指定根组件为 Counter 组件，然后挂载到 #app 元素上
  createApp(Counter).mount("#app");
</script>
```

说明：

- 我们使用了 `Import maps`，以告诉浏览器如何定位导入的 `vue`。
- 导入的组件一定要带文件后缀名，否则浏览器会报错（NOTE：有构建流程的项目中，我们往往会不写后缀名，因为构建工具会最终补全它们）。
- 通过 `createApp` 创建一个 `Vue 应用实例`，并将 `Counter` 组件作为根组件挂载到 #app 元素上。

[示例源码]()

### 3. 运行

前面的例子中，我们直接打开文件系统中的 `index.html` 就可以看到效果，但本例不行，会报如下错误：

```js
Access to script at 'file:///<your-project-dir>/components/counter.js' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: http, data, isolated-app, chrome-extension, chrome, https, chrome-untrusted.
```

这是由于浏览器的 CROS 策略限制导致的。我们需要启动一个本地服务器来运行。

有很多种方式运行本地 HTTP 服务，这里提供两种：

1. `(推荐）` 如果我们使用的是 VSCode， 可以安装微软官方的 [Live Preview](https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server) 插件。

   启用插件后，打开 `index.html`，点击右上角的 `Show Preview` 即可启动一个本地 HTTP 服务器进行预览。

2. 如果本地安装了 `Node.js`，还可以在终端运行 `npx serve` 以启动一个本地 HTTP 服务器。

```bash
# 进入 index.html 所在目录
cd demo01

# 启动本地预览服务器
# NOTE：该命令首次执行时，会提示你要不要安装 serve 模块。
npx serve
```

推荐第一种方式，简单方便。

以上两种方式启动的 HTTP 服务器的默认访问地址均为：http://localhost:3000

### 3. 注册组件的补充说明

```
<div id="app"></div>

<script type="module">
  import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
  import Counter from "./components/counter.js";

  createApp({
    // 通过 components 选项来注册局部组件。
    components: {
      Counter3: {
        data() {
          return { count: 3 };
        },
        template: `{{ count }} <button @click="count++">+</button>`,
      },
    },
    // 这里使用的组件都要是注册过的，否则找不到会被忽略
    // Counter4 就是一个未注册的组件，所以不会被渲染，但控制台会提示警告。
    // [Vue warn]: Failed to resolve component: Counter4
    template: `<Counter /> <Counter2 /> <Counter3 /> <Counter4 />`,
  })
    // 通过 app.component 注册的是全局组件
    // https://cn.vuejs.org/api/application.html#app-component
    .component("Counter", Counter)
    // 也可以通过第二个参数传入一个组件配置对象来定义并注册组件。
    .component("Counter2", {
      data() {
        return { count: 2 };
      },
      template: `{{ count }} <button @click="count++">+</button>`,
    })
    .mount("#app");
</script>
```

[示例源码]()

## 总结

通过 CDN 引入 VUE 框架的好处是，不涉及到构建步骤。

可用于增强静态的 HTML 或与后端框架集成。

适合快速上手 Vue 框架。但这种方式无法使用单文件组件 (SFC) 语法。
