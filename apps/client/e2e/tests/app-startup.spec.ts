// 不再需要导出空模块，因为全局类型定义已经移至独立文件

describe('应用启动测试', () => {
  it('应该显示应用Logo', async () => {
    // 验证logo存在并可见
    const appLogo = await $('[data-testid="app-logo"]');

    await appLogo.waitForExist({
      timeout: 1000,
      timeoutMsg: 'Logo元素没有在预期时间内出现，测试失败',
      interval: 100,
    });

    await expect(appLogo).toBeDisplayed({
      message: 'Logo元素存在但未显示',
    });

    await expect(appLogo).toHaveText('硅信');
  });

  it('应该存在全局对象__STORES__和__TAURI_INTERNALS__', async () => {
    // 检查全局对象是否存在
    const hasStores = await browser.execute(() => {
      return typeof window.__STORES__ !== 'undefined';
    });

    const hasTauriInternals = await browser.execute(() => {
      return typeof window.__TAURI_INTERNALS__ !== 'undefined';
    });

    // 输出调试信息
    console.log('全局对象状态:', {
      __STORES__: hasStores,
      __TAURI_INTERNALS__: hasTauriInternals,
    });

    // 断言检查
    await expect(hasStores).toBe(true);
    await expect(hasTauriInternals).toBe(true);
  });
});
