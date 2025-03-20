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
});
