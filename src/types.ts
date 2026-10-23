export type ThemeMode = 'light' | 'dark' | 'system';

export interface SiteConfig {
  title: string;
  name: string;
  author: string;
  handle: string;
  role: string;
  tagline: string;
  kicker: string;
  bio: string;
  targetRole: string;
  graduation: string;
  availability: string;
  avatar: string;
  url?: string;
  resumePdf: string;
  intro: string[];
  research: string[];
  principles: { title: string; body: string }[];
  contact: {
    email: string;
    github: string;
    location: string;
    phoneMasked: string;
    phonePublic: boolean;
    wechatQr?: string;
  };
  /** 兼容旧组件 */
  email: string;
  github: string;
  location: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface FeatureFlags {
  search: boolean;
  toc: boolean;
  readingTime: boolean;
  comments: boolean;
}

export interface BlogConfig {
  site: SiteConfig;
  nav: NavItem[];
  features: FeatureFlags;
}
