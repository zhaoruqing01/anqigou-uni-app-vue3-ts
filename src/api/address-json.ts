import { externalService } from '@/utils/request';

/**
 * 请求省市区三级联动数据
 */
export const fetchAreaData = async (): Promise<any[]> => {
  try {
    // 调用CDN接口（无需Key，直接请求）
    const res = await externalService.get(
      'https://cdn.jsdelivr.net/npm/china-area-data@5.0.0/data.json'
    );
    const areaList: any[] = [];

    // 遍历省份数据
    // 第一层：{省份代码: 省份名称}
    Object.keys(res).forEach((provinceId) => {
      // @ts-ignore
      const provinceName = res[86][provinceId]; // 省份名称在res[86]中

      // 确保provinceName是字符串
      if (typeof provinceName !== 'string') return;

      const cityList: any[] = [];

      // 第二层：{城市代码: 城市名称}
      // @ts-ignore
      const cityData = res[provinceId];
      if (typeof cityData === 'object' && cityData !== null) {
        Object.keys(cityData).forEach((cityId) => {
          // 跳过非数字键（如可能存在的name属性等）
          if (!/^\d+$/.test(cityId)) return;

          // @ts-ignore
          const cityName = cityData[cityId];

          // 确保cityName是字符串
          if (typeof cityName !== 'string') return;

          const districtList: any[] = [];

          // 第三层：{区县代码: 区县名称}
          // @ts-ignore
          const districtData = res[cityId];
          if (typeof districtData === 'object' && districtData !== null) {
            Object.keys(districtData).forEach((districtId) => {
              // 跳过非数字键
              if (!/^\d+$/.test(districtId)) return;

              // @ts-ignore
              const districtName = districtData[districtId];

              // 确保districtName是字符串
              if (typeof districtName === 'string') {
                districtList.push({
                  id: districtId,
                  name: districtName,
                });
              }
            });
          }

          cityList.push({
            id: cityId,
            name: cityName,
            children: districtList,
          });
        });
      }

      areaList.push({
        id: provinceId,
        name: provinceName,
        children: cityList,
      });
    });
    return areaList;
  } catch (error) {
    console.error('获取省市区数据失败：', error);
    uni.showToast({ title: '加载地区数据失败', icon: 'none' });
    return [];
  }
};
