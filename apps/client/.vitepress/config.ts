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
      ...(isDev ? [{ text: '开发文档', link: '/development/' }] : []),
    ],

    sidebar: [
      {
        text: '用户手册',
        items: [
          { text: '下载安装', link: '/guide/getting-started' },
          { text: '添加AI朋友', link: '/guide/add-ai-friend' },
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
              ],
            },
          ]
        : []),
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/硅信项目地址' }],
  },
});

