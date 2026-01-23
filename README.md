# 安琦购电商小程序

## 项目简介
安琦购是一个基于 uni-app + Vue 3 + TypeScript 开发的跨平台电商小程序，支持微信小程序、支付宝小程序、百度小程序、H5等多端部署。

## 技术栈

### 核心框架
- uni-app 3.0
- Vue 3
- TypeScript

### 状态管理
- Pinia

### 网络请求
- axios

### 样式预处理
- Sass/SCSS

### 代码规范
- ESLint 9
- Prettier

### 其他依赖
- uni-ui (UI组件库)
- crypto-js (加密工具)
- vue-i18n (国际化支持)

## 功能模块

### 首页
- 商品轮播
- 热门商品展示
- 分类导航

### 商品模块
- 商品分类列表
- 商品搜索
- 商品详情
- 商品SKU选择

### 购物车
- 商品添加/移除
- 数量调整
- 结算功能

### 订单模块
- 订单创建
- 订单列表
- 订单详情
- 订单支付

### 支付模块
- 多种支付方式选择
- 支付结果处理

### 物流模块
- 物流信息查询
- 物流评价

### 用户中心
- 个人信息管理
- 地址管理
- 收藏夹管理
- 设备管理
- 反馈系统
- 隐私设置

## 项目结构

```
├── src/                    # 源代码目录
│   ├── api/                # API接口定义
│   ├── components/         # 自定义组件
│   ├── pages/              # 页面文件
│   ├── static/             # 静态资源
│   ├── stores/             # Pinia状态管理
│   ├── styles/             # 样式文件
│   ├── types/              # TypeScript类型定义
│   ├── uni_modules/        # uni-app插件
│   ├── utils/              # 工具函数
│   ├── App.vue             # 应用入口组件
│   ├── main.ts             # 应用入口文件
│   ├── manifest.json       # 应用配置
│   ├── pages.json          # 页面配置
│   └── uni.scss            # 全局样式变量
├── .eslintrc.js            # ESLint配置
├── .prettierrc.js          # Prettier配置
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript配置
└── vite.config.ts          # Vite配置
```

## 快速开始

### 环境要求
- Node.js 16+
- npm 或 pnpm
- HBuilderX (推荐) 或 VS Code

### 安装依赖

```bash
# 使用pnpm安装依赖
pnpm install
```

### 开发运行

```bash
# H5开发
pnpm run dev:h5

# 微信小程序开发
pnpm run dev:mp-weixin

# 支付宝小程序开发
pnpm run dev:mp-alipay

# 百度小程序开发
pnpm run dev:mp-baidu
```

### 构建部署

```bash
# H5构建
pnpm run build:h5

# 微信小程序构建
pnpm run build:mp-weixin

# 支付宝小程序构建
pnpm run build:mp-alipay

# 百度小程序构建
pnpm run build:mp-baidu
```

## 开发指南

### 代码规范

```bash
# 检查代码规范
pnpm run lint

# 自动修复代码规范问题
pnpm run lint:fix

# 格式化代码
pnpm run format

# TypeScript类型检查
pnpm run type-check
```

### 页面开发

1. 在 `src/pages.json` 中配置页面路径
2. 在 `src/pages/` 目录下创建页面文件
3. 使用 Vue 3 Composition API 开发页面逻辑

### API请求

1. 在 `src/api/` 目录下创建API文件
2. 使用axios封装请求
3. 在页面中引入并使用

### 状态管理

1. 在 `src/stores/` 目录下创建store文件
2. 使用Pinia定义状态
3. 在页面中使用 `useStore()` 引入

## 多端支持

| 平台 | 支持情况 |
|------|----------|
| 微信小程序 | ✅ |
| 支付宝小程序 | ✅ |
| 百度小程序 | ✅ |
| 头条小程序 | ✅ |
| QQ小程序 | ✅ |
| H5 | ✅ |
| 快应用 | ✅ |
| 鸿蒙 | ✅ |

## 项目配置

### 全局样式

- 导航栏背景色：`#548163`
- 导航栏文字颜色：`white`
- 底部标签栏颜色：`#2ecaa6`

### 底部标签页

1. 首页 - `pages/index/index`
2. 分类 - `pages/product/list`
3. 购物车 - `pages/order/cart`
4. 我的 - `pages/user/profile`

## 许可证

[MIT License](LICENSE)

## 联系方式

如有问题或建议，欢迎提交Issue或联系项目维护者。