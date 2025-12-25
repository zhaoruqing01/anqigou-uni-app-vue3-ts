// 页面间数据传递工具类

/**
 * 设置页面数据
 * @param key 键名
 * @param data 数据
 */
export const setPageData = (key: string, data: any) => {
  const pages = getCurrentPages();
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1] as any;
    if (!currentPage.pageData) {
      currentPage.pageData = {};
    }
    currentPage.pageData[key] = data;
  }
};

/**
 * 获取页面数据
 * @param key 键名
 * @returns 数据
 */
export const getPageData = (key: string) => {
  const pages = getCurrentPages();
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1] as any;
    return currentPage.pageData?.[key];
  }
  return null;
};

/**
 * 清除页面数据
 * @param key 键名，不传则清除所有
 */
export const clearPageData = (key?: string) => {
  const pages = getCurrentPages();
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1] as any;
    if (key) {
      if (currentPage.pageData) {
        delete currentPage.pageData[key];
      }
    } else {
      currentPage.pageData = {};
    }
  }
};

/**
 * 从上一页获取传递的数据
 * @param key 键名
 * @returns 数据
 */
export const getPrevPageData = (key: string) => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    const prevPage = pages[pages.length - 2] as any;
    return prevPage.pageData?.[key];
  }
  return null;
};
