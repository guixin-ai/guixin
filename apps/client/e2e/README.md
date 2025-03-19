# Tauri 应用 E2E 测试文档

本文档介绍了 Tauri 应用的端到端 (End-to-End, E2E) 测试设置和使用方法。

## 文件结构

```
/e2e
├── README.md           - 当前文档
├── wdio.conf.ts        - WebdriverIO 配置文件
├── tsconfig.json       - TypeScript 配置
└── tests/              - 测试用例目录
    └── test.spec.ts    - 示例测试用例
```

## 技术栈

- **WebdriverIO**: 用于端到端测试的自动化测试框架
- **tauri-driver**: 用于控制 Tauri 应用程序的驱动程序
- **Microsoft Edge WebDriver**: 用于控制 Edge 浏览器的 WebDriver

## 端口使用

- **4444**: 被 tauri-driver 使用，负责与 Tauri 应用通信
- **4445**: 被 Microsoft Edge WebDriver 使用，负责浏览器自动化

## 运行测试

在项目根目录执行以下命令启动端到端测试：

```bash
pnpm test:e2e
```

## 测试用例编写

测试用例位于 `tests` 目录下，使用 TypeScript 编写。示例：

```typescript
describe('Start', () => {
  it('should show the chat layout', async () => {
    const chatLayoutElement = await $('[data-testid="chat-layout"]');

    // 等待元素存在
    await chatLayoutElement.waitForExist({
      timeout: 1000,
      timeoutMsg: '聊天布局元素没有在预期时间内出现，测试失败',
      interval: 100,
    });

    // 验证元素显示
    await expect(chatLayoutElement).toBeDisplayed();
  });
});
```

### 最佳实践

1. **使用 data-testid**: 为了让测试更稳定，在组件中使用 `data-testid` 属性标识元素
2. **显式等待**: 使用显式等待方法如 `waitForExist()` 而不是依赖隐式等待
3. **设置超时**: 为严格测试设置较短的超时时间
4. **清晰错误消息**: 提供有意义的错误消息以便更容易诊断问题

## 多窗口测试

Tauri 应用可以打开多个窗口，我们可以使用 WebDriverIO 的窗口处理功能来测试这些窗口：

### 多窗口测试步骤

1. 获取原始窗口句柄

   ```typescript
   const originalWindowHandle = await browser.getWindowHandle();
   ```

2. 触发打开新窗口的操作（如点击按钮）

   ```typescript
   await $('[data-testid="open-new-window-button"]').click();
   ```

3. 获取所有窗口句柄

   ```typescript
   const windowHandles = await browser.getWindowHandles();
   ```

4. 切换到新窗口

   ```typescript
   const newWindowHandle = windowHandles[windowHandles.length - 1];
   await browser.switchToWindow(newWindowHandle);
   ```

5. 在新窗口中执行测试

6. 返回原始窗口
   ```typescript
   await browser.switchToWindow(originalWindowHandle);
   ```

### 示例

```typescript
it('should be able to open and test a new window', async () => {
  // 记录当前窗口句柄
  const originalWindowHandle = await browser.getWindowHandle();

  // 点击按钮打开新窗口
  await $('[data-testid="open-new-window-button"]').click();

  // 等待新窗口打开
  await browser.pause(1000);

  // 获取所有窗口句柄
  const windowHandles = await browser.getWindowHandles();

  // 切换到新窗口
  const newWindowHandle = windowHandles[windowHandles.length - 1];
  await browser.switchToWindow(newWindowHandle);

  // 在新窗口中进行测试
  await expect($('[data-testid="new-window-element"]')).toBeDisplayed();

  // 返回到原始窗口
  await browser.switchToWindow(originalWindowHandle);
});
```

## 调试测试

测试运行时会生成日志:

- tauri-driver 日志显示与 Tauri 应用的交互
- Edge WebDriver 日志显示与浏览器的交互

如果测试失败，查看这些日志以确定失败原因。

## 注意事项

1. 运行测试前确保没有其他程序占用端口 4444 和 4445
2. 测试执行前会自动构建和启动 Tauri 应用
3. 测试完成后会自动关闭所有相关进程
