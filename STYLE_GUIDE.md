# 安琦购电商平台 - 前端样式优化指南

> 生成时间：2025-11-28  
> 优化范围：全局样式系统重构

---

## 📊 优化概览

本次样式优化建立了完整的设计系统,统一了全站的视觉风格和用户体验。

### 优化成果

| 优化项目      | 状态    | 说明                             |
| ------------- | ------- | -------------------------------- |
| 全局样式变量  | ✅ 完成 | 统一颜色、字体、间距等设计 token |
| Mixins 工具库 | ✅ 完成 | 可复用的样式片段和工具函数       |
| 通用样式类    | ✅ 完成 | 全局可用的 utility 类            |
| 首页样式      | ✅ 完成 | 现代化卡片设计,流畅动画          |
| 登录页样式    | ✅ 完成 | 渐变背景,优雅表单                |
| 用户中心样式  | ✅ 完成 | 卡片式布局,信息层次清晰          |
| 购物车样式    | ✅ 完成 | 商家分组,交互友好                |

---

## 🎨 设计系统

### 1. 主题颜色

```scss
// 主色调 - 绿色系
$primary-color: #548163; // 主色
$primary-light: #6a9f7d; // 浅色
$primary-dark: #456a52; // 深色

// 辅助色
$secondary-color: #45a465; // 次要色
$accent-color: #ff6b6b; // 强调色
$success-color: #52c41a; // 成功
$warning-color: #faad14; // 警告
$error-color: #f5222d; // 错误
$info-color: #1890ff; // 信息
```

### 2. 文字颜色

```scss
$text-primary: #333333; // 主要文字
$text-secondary: #666666; // 次要文字
$text-tertiary: #999999; // 辅助文字
$text-disabled: #cccccc; // 禁用文字
```

### 3. 背景颜色

```scss
$bg-color: #f8f9ff; // 页面背景
$bg-secondary: #f5f7fa; // 次要背景
$bg-hover: #f0f2f5; // 悬停背景
```

### 4. 字体大小

```scss
$font-xs: 10px;
$font-sm: 12px;
$font-base: 14px; // 基准字号
$font-md: 16px;
$font-lg: 18px;
$font-xl: 20px;
$font-xxl: 24px;
$font-xxxl: 28px;
```

### 5. 间距系统

```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 12px; // 基准间距
$spacing-lg: 16px;
$spacing-xl: 20px;
$spacing-xxl: 24px;
$spacing-xxxl: 32px;
```

### 6. 圆角

```scss
$radius-sm: 8px;
$radius-md: 12px; // 基准圆角
$radius-lg: 16px;
$radius-xl: 24px;
$radius-round: 50%; // 圆形
```

### 7. 阴影

```scss
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
```

---

## 🔧 Mixins 工具库

### 文本省略

```scss
// 单行省略
@include ellipsis;

// 多行省略
@include multi-ellipsis(2); // 2行省略
```

### Flex 布局

```scss
@include flex-center; // 水平垂直居中
@include flex-align-center; // 垂直居中
@include flex-between; // 两端对齐
```

### 卡片样式

```scss
@include card; // 基础卡片
@include card-hover; // 悬浮效果
```

### 按钮样式

```scss
@include btn-primary; // 主按钮
@include btn-secondary; // 次按钮
```

### 输入框样式

```scss
@include input; // 标准输入框
```

### 动画效果

```scss
@include fade-in; // 淡入
@include slide-up; // 滑入
@include scale-in; // 缩放
```

---

## 💡 通用样式类

### 文本类

```html
<!-- 文字颜色 -->
<view class="text-primary">主要文字</view>
<view class="text-secondary">次要文字</view>
<view class="text-error">错误文字</view>

<!-- 文字大小 -->
<view class="text-sm">小号文字</view>
<view class="text-base">标准文字</view>
<view class="text-lg">大号文字</view>

<!-- 文字对齐 -->
<view class="text-center">居中</view>
<view class="text-right">右对齐</view>

<!-- 文字粗细 -->
<view class="text-bold">粗体</view>
<view class="text-medium">中等</view>
```

### 布局类

```html
<!-- Flex布局 -->
<view class="flex">弹性布局</view>
<view class="flex-center">居中</view>
<view class="flex-between">两端对齐</view>
<view class="flex-column">垂直排列</view>
```

### 间距类

```html
<!-- 外边距 -->
<view class="mt-md">上边距</view>
<view class="mb-lg">下边距</view>
<view class="ml-sm">左边距</view>
<view class="mr-sm">右边距</view>

<!-- 内边距 -->
<view class="p-md">内边距</view>
<view class="p-lg">大内边距</view>
```

### 标签类

```html
<view class="tag">默认标签</view>
<view class="tag-success">成功标签</view>
<view class="tag-warning">警告标签</view>
<view class="tag-error">错误标签</view>
```

---

## 📱 页面样式规范

### 页面结构

```vue
<template>
  <view class="container">
    <!-- 页面内容 -->
  </view>
</template>

<style scoped lang="scss">
@import "@/styles/variables.scss";
@import "@/styles/mixins.scss";

.container {
  min-height: 100vh;
  background: $bg-color;
  padding-bottom: 60px; // 为底部导航预留空间
}
</style>
```

### 卡片组件

```vue
<view class="card">
  <view class="card-header">标题</view>
  <view class="card-body">内容</view>
</view>

<style scoped lang="scss">
.card {
  @include card;
  @include card-hover;
}
</style>
```

### 列表项

```vue
<view class="list-item" @click="handleClick">
  <view class="item-left">
    <text class="icon">📦</text>
    <text class="label">标题</text>
  </view>
  <text class="arrow">›</text>
</view>

<style scoped lang="scss">
.list-item {
  @include flex-between;
  padding: $spacing-lg;
  background: $white;
  border-bottom: 1px solid $border-light;

  &:active {
    background: $bg-hover;
  }
}
</style>
```

---

## 🎯 最佳实践

### 1. 使用设计 token

❌ **不推荐**:

```scss
.title {
  color: #333;
  font-size: 16px;
  margin-bottom: 12px;
}
```

✅ **推荐**:

```scss
.title {
  color: $text-primary;
  font-size: $font-md;
  margin-bottom: $spacing-md;
}
```

### 2. 使用 Mixins

❌ **不推荐**:

```scss
.product-name {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
```

✅ **推荐**:

```scss
.product-name {
  @include multi-ellipsis(2);
}
```

### 3. 使用通用类

❌ **不推荐**:

```vue
<view style="display: flex; align-items: center; gap: 8px;">
  <!-- 内容 -->
</view>
```

✅ **推荐**:

```vue
<view class="flex-align-center">
  <!-- 内容 -->
</view>
```

### 4. 组件样式隔离

```vue
<style scoped lang="scss">
// 始终使用scoped防止样式污染
@import "@/styles/variables.scss";
@import "@/styles/mixins.scss";

.my-component {
  // 组件样式
}
</style>
```

### 5. 响应式设计

```scss
.container {
  padding: $spacing-md;

  @include responsive("tablet") {
    padding: $spacing-lg;
  }

  @include responsive("desktop") {
    padding: $spacing-xl;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## 🔄 迁移指南

### 将旧页面迁移到新设计系统

1. **引入样式文件**

```vue
<style scoped lang="scss">
@import "@/styles/variables.scss";
@import "@/styles/mixins.scss";
</style>
```

2. **替换硬编码颜色**

```scss
// 旧代码
color: #333;

// 新代码
color: $text-primary;
```

3. **使用 Mixins 简化代码**

```scss
// 旧代码
display: flex;
align-items: center;
justify-content: center;

// 新代码
@include flex-center;
```

4. **应用通用类**

```html
<!-- 旧代码 -->
<view style="font-size: 14px; color: #666;">文本</view>

<!-- 新代码 -->
<view class="text-base text-secondary">文本</view>
```

---

## 📋 组件库规划

### 待开发组件

- [ ] **Button 组件** - 统一的按钮样式
- [ ] **Card 组件** - 可配置的卡片容器
- [ ] **Tag 组件** - 标签组件
- [ ] **Badge 组件** - 徽章组件
- [ ] **Empty 组件** - 空状态组件
- [ ] **Loading 组件** - 加载状态组件
- [ ] **Modal 组件** - 模态框组件
- [ ] **Toast 组件** - 提示组件

---

## 🎨 设计原则

### 1. 一致性

- 统一的颜色系统
- 统一的字体规范
- 统一的间距系统
- 统一的交互反馈

### 2. 可访问性

- 足够的颜色对比度
- 合适的字号大小
- 清晰的视觉层次
- 友好的交互反馈

### 3. 性能

- 使用 CSS 而非 JS 动画
- 避免过度使用阴影
- 优化渐变效果
- 合理使用过渡动画

### 4. 可维护性

- 使用语义化的命名
- 避免深层嵌套
- 复用公共样式
- 保持代码整洁

---

## 🚀 下一步计划

### 短期目标 (1-2 周)

- [ ] 完善所有页面样式
- [ ] 创建可复用组件库
- [ ] 编写组件使用文档
- [ ] 添加暗黑模式支持

### 中期目标 (1 个月)

- [ ] 优化动画性能
- [ ] 添加主题切换功能
- [ ] 完善响应式设计
- [ ] 添加骨架屏效果

### 长期目标 (3 个月)

- [ ] 建立完整的组件库
- [ ] 实现多主题系统
- [ ] 添加国际化支持
- [ ] 性能优化和测试

---

## 📞 联系方式

如有任何关于样式系统的问题或建议,请联系前端团队。

---

**文档版本**: v1.0.0  
**最后更新**: 2025-11-28  
**维护团队**: 安琦购前端团队
