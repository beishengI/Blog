import { BlogConfig } from '../types';

import GridHome from './GridHome';
import TerminalHome from './TerminalHome';
import SoftHome from './SoftHome';
import GlassHome from './GlassHome';
import BauhausHome from './BauhausHome';
import NewspaperHome from './NewspaperHome';
import ReadingHome from './ReadingHome';
import EditorialHome from './EditorialHome';
import SpineHome from './SpineHome';
import DepthHome from './DepthHome';
import TimelineHome from './TimelineHome';
import CompanionHome from './CompanionHome';
import BrutalistHome from './BrutalistHome';
import MasonryHome from './MasonryHome';
import SplitHome from './SplitHome';
import DashboardHome from './DashboardHome';
import NotesHome from './NotesHome';
import DocsHome from './DocsHome';
import StreamHome from './StreamHome';
import BlueprintHome from './BlueprintHome';

export type LayoutDirection = BlogConfig['layout']['direction'];
export type LayoutComponent = (props: { config: BlogConfig }) => JSX.Element | null;

/**
 * 布局注册表（唯一数据源）。
 * 用 Record<LayoutDirection, ...> 约束：新增 direction 却忘记注册/命名时，TypeScript 直接报错。
 * 对象字面量的书写顺序即下拉框展示顺序。
 */
export const LAYOUTS: Record<LayoutDirection, LayoutComponent> = {
  grid: GridHome,
  terminal: TerminalHome,
  soft: SoftHome,
  glass: GlassHome,
  bauhaus: BauhausHome,
  newspaper: NewspaperHome,
  reading: ReadingHome,
  editorial: EditorialHome,
  spine: SpineHome,
  depth: DepthHome,
  timeline: TimelineHome,
  companion: CompanionHome,
  brutalist: BrutalistHome,
  masonry: MasonryHome,
  split: SplitHome,
  dashboard: DashboardHome,
  notes: NotesHome,
  docs: DocsHome,
  stream: StreamHome,
  blueprint: BlueprintHome,
};

/** 每个布局的中文名，同样被 Record 强制穷举。 */
export const DIRECTION_LABELS: Record<LayoutDirection, string> = {
  grid: '经典网格 · 卡片墙',
  terminal: '终端命令行',
  soft: '新拟态软卡',
  glass: '玻璃层叠',
  bauhaus: '包豪斯几何',
  newspaper: '复古报纸多栏',
  reading: '沉浸阅读单栏',
  editorial: '杂志编辑风',
  spine: '中轴折叠',
  depth: '深度分层舞台',
  timeline: '时间轴',
  companion: 'AI 伴读对照',
  brutalist: '粗野主义',
  masonry: '封面瀑布流',
  split: '分屏名片',
  dashboard: '数据仪表盘',
  notes: '便签墙',
  docs: '文档手册',
  stream: '动态流',
  blueprint: '工程蓝图',
};

/** 布局总数，由注册表自动推导，永远不会写错。 */
export const LAYOUT_COUNT = Object.keys(LAYOUTS).length;

export const DEFAULT_DIRECTION: LayoutDirection = 'grid';

/**
 * 宽版布局的最小画布宽度（px）。
 * 这些布局信息密度高（多列卡片 / 仪表盘 / 拼贴），
 * 当用户把「最大宽度」调得很小（如 820px）时会被压扁，
 * 这里给它们一个宽度下限，shell 取 max(maxWidth, minWidth)。
 */
export const LAYOUT_MIN_WIDTH: Partial<Record<LayoutDirection, number>> = {
  blueprint: 1100,
  dashboard: 1100,
  masonry: 1080,
  editorial: 1100,
  grid: 960,
};
