/** 能力链五章：感知 → 理解 → 决策 → 执行 → 交付。 */
export interface Chapter {
  no: string;
  title: string;
  en: string;
  lede: string;
  slugs: string[];
}

export const chapters: Chapter[] = [
  {
    no: '01',
    title: '感知',
    en: 'PERCEIVE',
    lede: '先把影像变成可计算的对象：轻量模型、16 组对照、三视图与在线推理。',
    slugs: ['lite-mamba'],
  },
  {
    no: '02',
    title: '理解',
    en: 'UNDERSTAND',
    lede: '把多模态输入变成可调用的服务：32B 单卡、流式输出、逐请求遥测。',
    slugs: ['qwen3-inference'],
  },
  {
    no: '03',
    title: '决策',
    en: 'DECIDE',
    lede: '在高风险场景里，让判定可复现：规则引擎、防幻觉护栏、RPA 执行 + Dify 总控。',
    slugs: ['contract-agent', 'scp-rpa'],
  },
  {
    no: '04',
    title: '执行',
    en: 'EXECUTE',
    lede: '把决策落进业务系统：MES 状态机与追溯、若依二开的课程平台与实时弹幕。',
    slugs: ['mes-system', 'unionplore'],
  },
  {
    no: '05',
    title: '交付',
    en: 'DELIVER',
    lede: '最后一公里：92 张表迁移、三重对账、性能治理、三级回滚——上线且零丢失。',
    slugs: ['taxi-platform'],
  },
];
