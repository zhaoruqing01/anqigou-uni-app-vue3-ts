<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style>
/* 全局样式 - 使用CSS变量 */
page {
  background-color: var(--color-background);
  color: #333;
}

/* 主按钮样式 */
.primary-button {
  background-color: var(--color-primary);
  color: var(--color-background);
  border-radius: 4px;
  padding: 10px 20px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(84, 129, 99, 0.3);
  transition: all 0.3s ease;
}

.primary-button:active {
  transform: translateY(1px);
  box-shadow: 0 1px 4px rgba(84, 129, 99, 0.2);
}

/* 次要按钮样式 */
.secondary-button {
  background-color: var(--color-secondary);
  color: var(--color-primary);
  border-radius: 4px;
  padding: 10px 20px;
  border: 1px solid var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-button:active {
  opacity: 0.9;
}

/* 链接样式 */
.link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
}

.link:active {
  opacity: 0.8;
}

/* 卡片样式 */
.card {
  background-color: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 16px;
}
</style>
