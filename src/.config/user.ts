import type { UserConfig } from '~/types'

export const userConfig: Partial<UserConfig> = {
  site: {
    title: 'Xiechimon',
    subtitle: '记录学习',
    author: 'xiechimon',
    description: 'Xie Chi Mon 的个人博客，记录前端、技术与生活。',
    website: 'https://xiechimon.github.io/blog',
    pageSize: 10,
    socialLinks: [
      {
        name: 'github',
        href: 'https://github.com/xiechimon',
      },
      {
        name: 'rss',
        href: '/atom.xml',
      },
    ],
    navLinks: [
      {
        name: 'Posts',
        href: '/',
      },
      {
        name: 'Archive',
        href: '/archive',
      },
      {
        name: 'Categories',
        href: '/categories',
      },
      {
        name: 'About',
        href: '/about',
      },
    ],
    categoryMap: [],
    footer: [
      '© %year <a target="_blank" href="%website">%author</a>',
      'Theme <a target="_blank" href="https://github.com/Moeyua/astro-theme-typography">Typography</a> by <a target="_blank" href="https://moeyua.com">Moeyua</a>',
    ],
  },
  appearance: {
    theme: 'system',
    locale: 'zh-cn',
  },
}
