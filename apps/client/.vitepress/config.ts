import { defineConfig } from 'vitepress';

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '硅信文档中心',
  description: '硅信产品使用文档',
  srcDir: './docs',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '指南', link: '/guide/' },
      { text: '智能聊天', link: '/chat/' },
      { text: '智能联系人', link: '/contacts/' },
      { text: '个人知识库', link: '/knowledge/' },
      { text: '智能工具', link: '/tools/' },
      { text: '常见问题', link: '/faq' },
      // 仅在开发环境下显示开发文档导航
      ...(isDev ? [{ text: '开发文档', link: '/development/' }] : []),
    ],

    sidebar: [
      {
        text: '入门指南',
        items: [
          { text: '什么是硅信？', link: '/guide/about' },
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '安装指南', link: '/guide/installation' },
          { text: '基本概念', link: '/guide/basic-concepts' },
        ],
      },
      {
        text: '智能聊天',
        collapsed: false,
        items: [
          { text: '即时通讯', link: '/chat/' },
          { text: '一对一聊天', link: '/chat/private' },
          { text: '群组聊天', link: '/chat/group' },
          { text: '消息管理', link: '/chat/messages' },
          { text: '文件共享', link: '/chat/files' },
          { text: '语音通话', link: '/chat/voice' },
          { text: '视频会议', link: '/chat/video' },
        ],
      },
      {
        text: '智能联系人',
        collapsed: false,
        items: [
          { text: '联系人概述', link: '/contacts/' },
          { text: '添加智能联系人', link: '/contacts/create' },
          { text: '创建联系人分组', link: '/contacts/create-group' },
          { text: '编辑联系人', link: '/contacts/edit' },
          { text: '删除联系人', link: '/contacts/delete' },
          { text: '分享联系人', link: '/contacts/share' },
          { text: '联系人对话', link: '/contacts/chat' },
          { text: '联系人助手功能', link: '/contacts/features' },
          { text: '联系人工具调用', link: '/contacts/tools' },
          { text: '多人群聊', link: '/contacts/group-chat' },
        ],
      },
      {
        text: '个人知识库',
        collapsed: false,
        items: [
          { text: '知识库概述', link: '/knowledge/' },
          { text: '创建知识库', link: '/knowledge/create' },
          { text: '添加内容', link: '/knowledge/add-content' },
          { text: '知识检索', link: '/knowledge/search' },
          { text: '知识管理', link: '/knowledge/management' },
          { text: '知识库分享', link: '/knowledge/sharing' },
        ],
      },
      {
        text: '智能工具',
        collapsed: false,
        items: [
          { text: '工具概述', link: '/tools/' },
          { text: '内置工具', link: '/tools/built-in' },
          { text: '自定义工具', link: '/tools/custom' },
          { text: '工作流编排', link: '/tools/workflows/' },
          { text: '创建工作流', link: '/tools/workflows/create' },
          { text: '工作流组件', link: '/tools/workflows/components' },
          { text: '工作流调试', link: '/tools/workflows/debug' },
          { text: '工作流部署', link: '/tools/workflows/deploy' },
          { text: '联系人调用工作流', link: '/tools/workflows/contact-integration' },
          { text: 'API工具配置', link: '/tools/api-config' },
          { text: '工具权限管理', link: '/tools/permissions' },
        ],
      },
      {
        text: 'Ollama 本地模型管理',
        collapsed: false,
        items: [
          { text: 'Ollama 入门', link: '/ollama/' },
          { text: '安装配置', link: '/ollama/setup' },
          { text: '下载模型', link: '/ollama/download' },
          { text: '管理模型', link: '/ollama/manage' },
          { text: '性能优化', link: '/ollama/performance' },
          { text: '常见问题', link: '/ollama/faq' },
        ],
      },
      {
        text: '个性化设置',
        collapsed: false,
        items: [
          { text: '个人资料', link: '/settings/profile' },
          { text: '界面主题', link: '/settings/themes' },
          { text: '通知设置', link: '/settings/notifications' },
          { text: '隐私与安全', link: '/settings/privacy' },
          { text: '备份与同步', link: '/settings/backup' },
        ],
      },
      {
        text: '使用场景',
        collapsed: false,
        items: [
          { text: '日常沟通', link: '/scenarios/daily' },
          { text: '智能助手', link: '/scenarios/assistant' },
          { text: '学习辅助', link: '/scenarios/learning' },
          { text: '工作效率', link: '/scenarios/productivity' },
          { text: '创意写作', link: '/scenarios/writing' },
        ],
      },
      {
        text: '常见问题',
        link: '/faq',
      },
      {
        text: '技术支持',
        items: [
          { text: '联系我们', link: '/support/contact' },
          { text: '问题反馈', link: '/support/feedback' },
          { text: '更新日志', link: '/support/changelog' },
        ],
      },
      // 仅在开发环境下显示开发文档侧边栏
      ...(isDev
        ? [
            {
              text: '开发文档',
              collapsed: false,
              items: [
                { text: '开发指南', link: '/development/' },
                { text: '开发环境搭建', link: '/development/setup' },
                { text: '架构设计', link: '/development/architecture' },
                { text: 'API 文档', link: '/development/api' },
                {
                  text: '开发计划',
                  items: [{ text: 'Ollama 开发计划', link: '/development/ollama-todo' }],
                },
              ],
            },
          ]
        : []),
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/硅信项目地址' }],
  },
});
