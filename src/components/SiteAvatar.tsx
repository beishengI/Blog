import type { CSSProperties } from 'react';
import { useConfig } from '../context/ConfigContext';

/**
 * 站点头像：全部预设布局的身份区统一用它消费 config.site.avatar
 * （ConfigContext 已按 Vite base 归一），在「定制」面板改头像 URL 即全站联动。
 */
export default function SiteAvatar({
  size = 'md',
  square = false,
  className = '',
  style,
}: {
  size?: 'sm' | 'md' | 'lg';
  square?: boolean;
  className?: string;
  /** 追加内联样式；传 { width: undefined } 等可清除默认尺寸令牌,改用类名控制响应式尺寸。 */
  style?: CSSProperties;
}) {
  const { config } = useConfig();
  return (
    <img
      src={config.site.avatar}
      alt={config.site.author}
      className={`shrink-0 object-cover bg-bg ${
        square ? 'rounded-none border-2 border-border' : 'rounded-full'
      } ${className}`}
      style={{ width: `var(--avatar-${size})`, height: `var(--avatar-${size})`, ...style }}
    />
  );
}
