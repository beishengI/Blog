import { useConfig } from '../context/ConfigContext';
import { LAYOUTS, DEFAULT_DIRECTION } from '../layouts/registry';
import { useSEO } from '../hooks/useSEO';
import InkSplash from '../components/InkSplash';

/**
 * 首页分发器：按 config.layout.direction 选择一套独立布局。
 * 新增布局只需在 src/layouts/registry.ts 注册，无需改动本文件。
 */
export default function Home() {
  const { config } = useConfig();
  useSEO({});
  const Layout = LAYOUTS[config.layout.direction] ?? LAYOUTS[DEFAULT_DIRECTION];
  return (
    <>
      <InkSplash />
      <Layout config={config} />
    </>
  );
}
