module.exports = {
  root: true, // 标识为根配置文件，不再向上查找
  env: {
    browser: true, // 支持浏览器环境全局变量（window、document等）
    es2021: true, // 支持ES2021语法
    node: true, // 支持Node.js环境全局变量
    "vue/setup-compiler-macros": true, // 支持Vue3的setup语法糖
  },
  extends: [
    "eslint:recommended", // 启用ESLint默认推荐规则
    "plugin:vue/vue3-essential", // Vue3基础语法规则
    "plugin:@typescript-eslint/recommended", // TypeScript推荐规则
    "plugin:prettier/recommended", // 整合Prettier（必须放在最后，覆盖冲突规则）
  ],
  parser: "vue-eslint-parser", // 解析Vue文件的语法
  parserOptions: {
    ecmaVersion: "latest", // 支持最新ECMAScript语法
    parser: "@typescript-eslint/parser", // 解析TypeScript语法
    sourceType: "module", // 支持ES模块（import/export）
  },
  plugins: [
    "vue", // Vue语法插件
    "@typescript-eslint", // TypeScript语法插件
  ],
  rules: {
    // 自定义规则（根据项目需求调整）
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off", // 生产环境警告console
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off", // 生产环境警告debugger
    "vue/multi-word-component-names": "off", // 允许UniApp单字组件名（如index.vue）
    "@typescript-eslint/no-explicit-any": "warn", // 对any类型只警告（不强制报错）
    indent: "off", // 禁用ESLint缩进规则（交给Prettier处理）
    "@typescript-eslint/indent": "off", // 禁用TS缩进规则（交给Prettier处理）
  },
  settings: {
    "import/resolver": {
      typescript: {}, // 支持TS的import路径解析
    },
  },
};
