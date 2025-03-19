describe('Start', () => {
  it('should show the chat layout', async () => {
    const chatLayoutElement = await $('[data-testid="chat-layout"]');

    await chatLayoutElement.waitForExist({
      timeout: 1000,
      timeoutMsg: '聊天布局元素没有在预期时间内出现，测试失败',
      interval: 100,
    });

    await expect(chatLayoutElement).toBeDisplayed({
      message: '聊天布局元素存在但未显示',
    });

    await expect(chatLayoutElement).toBeDisplayedInViewport({
      message: '聊天布局元素不在视口内',
    });
  });

  it('should open and verify the "创建新联系人" window', async () => {
    // 1. 导航到联系人页面
    const contactsLink = await $('[data-testid="contacts-link"]');
    await contactsLink.waitForClickable({
      timeout: 2000,
      timeoutMsg: '联系人链接按钮在预期时间内不可点击',
    });
    await contactsLink.click();

    // 等待联系人页面加载
    await browser.pause(500);

    // 2. 点击添加联系人按钮
    const addContactButton = await $('[data-testid="add-contact-button"]');
    await addContactButton.waitForClickable({
      timeout: 2000,
      timeoutMsg: '添加联系人按钮在预期时间内不可点击',
    });

    // 保存当前窗口句柄
    const originalWindowHandle = await browser.getWindowHandle();

    // 点击按钮打开新窗口
    await addContactButton.click();

    // 3. 等待新窗口打开
    await browser.pause(1000);

    // 4. 获取所有窗口句柄
    const windowHandles = await browser.getWindowHandles();

    // 5. 确认打开了新窗口
    expect(windowHandles.length).toBeGreaterThan(1);

    // 6. 切换到新窗口
    const newWindowHandle = windowHandles[windowHandles.length - 1];
    await browser.switchToWindow(newWindowHandle);

    // 7. 验证新窗口内容
    // 等待表单加载完成
    const contactForm = await $('[data-testid="ai-contact-form"]');
    await contactForm.waitForExist({
      timeout: 2000,
      timeoutMsg: 'AI联系人表单没有在预期时间内出现',
    });

    // 检查Ollama服务不可用警告
    const ollamaWarning = await $('[data-testid="ollama-warning-alert"]');
    await expect(ollamaWarning).toBeDisplayed({
      message: 'Ollama服务不可用警告没有显示',
    });

    // 验证基本信息部分存在
    const basicInfoSection = await $('[data-testid="basic-info-section"]');
    await expect(basicInfoSection).toBeDisplayed({
      message: '基本信息部分没有显示',
    });

    // 验证头像容器存在
    const avatarContainer = await $('[data-testid="avatar-container"]');
    await expect(avatarContainer).toBeDisplayed();

    // 检查机器人名称输入框
    const nameInput = await $('[data-testid="robot-name-input"]');
    await expect(nameInput).toBeDisplayed();
    await expect(nameInput).toHaveAttr('placeholder', '请输入机器人名称');

    // 检查所属分组选择器
    const groupSelector = await $('[data-testid="group-selector"]');
    await expect(groupSelector).toBeDisplayed();

    // 检查描述输入框
    const descriptionInput = await $('[data-testid="robot-description-input"]');
    await expect(descriptionInput).toBeDisplayed();
    await expect(descriptionInput).toHaveAttr('placeholder', '请输入机器人描述（可选）');

    // 检查模型配置部分
    const modelConfigSection = await $('[data-testid="model-config-section"]');
    await expect(modelConfigSection).toBeDisplayed();

    // 检查高级参数部分
    const advancedParamsSection = await $('[data-testid="advanced-params-section"]');
    await expect(advancedParamsSection).toBeDisplayed();

    // 检查创建机器人按钮
    const createButton = await $('[data-testid="create-robot-button"]');
    await expect(createButton).toBeDisplayed();
    await expect(createButton).toHaveText('创建机器人');

    // 9. 返回到原始窗口
    await browser.switchToWindow(originalWindowHandle);

    // 10. 验证我们确实回到了原始窗口
    const mainWindowElement = await $('[data-testid="chat-layout"]');
    await expect(mainWindowElement).toBeDisplayed();
  });
});
