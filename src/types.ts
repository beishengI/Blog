export type Density = 'compact' | 'comfortable' | 'spacious';
export type SidebarPosition = 'left' | 'right' | 'none';
export type CardStyle = 'minimal' | 'bordered' | 'elevated' | 'ghost';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  primary: string;
  accent: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  radius: number;
  fontHeading: string;
  fontBody: string;
}

export interface LayoutConfig {
  density: Density;
  sidebar: SidebarPosition;
  maxWidth: number;
  cardStyle: CardStyle;
  showSidebarOnMobile: boolean;
  recentCount: number; // 侧栏「最近更新」条数
  direction:
    | 'grid' | 'terminal' | 'soft' | 'glass' | 'bauhaus' | 'newspaper' | 'reading'
    | 'editorial' | 'spine' | 'depth' | 'timeline' | 'companion' | 'brutalist'
    | 'masonry' | 'split' | 'dashboard' | 'notes' | 'docs' | 'stream' | 'blueprint';
}

export interface SiteConfig {
  title: string;
  author: string;
  bio: string;
  avatar: string;
  url?: string;       // 站点根地址（用于 canonical），空则不生成 canonical
  email?: string;      // 关于页联系方式
  github?: string;     // GitHub 用户名
  intro?: string[];    // 关于页简介段落
  research?: string[]; // 关于页研究方向列表
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
  theme: ThemeConfig;
  layout: LayoutConfig;
  nav: NavItem[];
  features: FeatureFlags;
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
