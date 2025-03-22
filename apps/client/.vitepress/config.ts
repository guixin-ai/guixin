import { defineConfig } from 'vitepress';

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '硅信文档中心',
  description: '硅信产品用户手册',
  srcDir: './docs',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '用户手册', link: '/guide/' },
      // 仅在开发环境下显示开发文档导航
      ...(isDev
        ? [
            { text: '开发文档', link: '/development/' },
            {
              text: 'MCP',
              link: '/mcp',
            },
          ]
        : []),
    ],

    sidebar: {
      '/guide/': [
        {
          text: '用户手册',
          items: [
            { text: '下载安装', link: '/guide/getting-started' },
            { text: '添加AI朋友', link: '/guide/add-ai-friend' },
          ],
        }
      ],
      '/development/': [
        {
          text: '开发文档',
          collapsed: false,
          items: [
            { text: '开发指南', link: '/development/' },
          ],
        }
      ],
      '/mcp/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/mcp/introduction' },
            {
              text: '快速入门',
              collapsed: true,
              items: [
                { text: '服务端开发者', link: '/mcp/quickstart/server-developers' },
                { text: '客户端开发者', link: '/mcp/quickstart/client-developers' },
                { text: 'Claude桌面用户', link: '/mcp/quickstart/claude-desktop-users' }
              ]
            },
            { text: '服务端示例', link: '/mcp/example-servers' },
            { text: '客户端示例', link: '/mcp/example-clients' }
          ]
        },
        {
          text: '教程',
          items: [
            { text: '使用LLMs构建MCP', link: '/mcp/tutorials/building-mcp-with-llms' },
            { text: '调试', link: '/mcp/tutorials/debugging' },
            { text: '检查器', link: '/mcp/tutorials/inspector' }
          ]
        },
        {
          text: '概念',
          items: [
            { text: '核心架构', link: '/mcp/concepts/core-architecture' },
            { text: '资源', link: '/mcp/concepts/resources' },
            { text: '提示', link: '/mcp/concepts/prompts' },
            { text: '工具', link: '/mcp/concepts/tools' },
            { text: '采样', link: '/mcp/concepts/sampling' },
            { text: '根', link: '/mcp/concepts/roots' },
            { text: '传输', link: '/mcp/concepts/transports' }
          ]
        },
        {
          text: '开发',
          items: [
            { text: '新功能', link: '/mcp/development/whats-new' },
            { text: '路线图', link: '/mcp/development/roadmap' },
            { text: '贡献', link: '/mcp/development/contributing' }
          ]
        }
      ]
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/硅信项目地址' }],
  },
});
