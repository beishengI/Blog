import { BlogConfig } from '../types';
import { site, nav, features } from '../data/site';

/**
 * 站点配置：身份、导航、功能开关。
 * 视觉令牌在 src/styles/design/tokens.css；这里不再承载主题/布局配置。
 */
export const defaultConfig: BlogConfig = {
  site,
  nav,
  features,
};
