module.exports = {
  printWidth: 100, // 每行代码最大长度（超过自动换行）
  tabWidth: 2, // 缩进空格数（与VSCode保持一致）
  useTabs: false, // 不使用Tab键缩进（用空格）
  singleQuote: true, // 字符串使用单引号（如 'hello' 而非 "hello"）
  semi: true, // 语句末尾加分号（如 const a = 1;）
  trailingComma: "es5", // 多行结构末尾加逗号（如数组、对象）
  bracketSpacing: true, // 对象括号前后加空格（如 { name: 'xxx' }）
  arrowParens: "always", // 箭头函数参数强制加括号（如 (x) => x 而非 x => x）
  htmlWhitespaceSensitivity: "ignore", // 忽略HTML空格差异（避免不必要格式化）
  vueIndentScriptAndStyle: false, // Vue的<script>和<style>不跟随外部缩进
  endOfLine: "auto", // 自动适配系统换行符（Windows用CRLF，Mac用LF）
};
