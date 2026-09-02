export interface Post {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  date: string;
  readingTime: number;
  aiSummary: string;
  terms: string[];
  content: string;
  cover?: string; // 可内嵌封面图；为空则按主题色自动生成
}

export const posts: Post[] = [
  {
    id: 'cnn-ct-segmentation',
    title: '用 U-Net 做肺部 CT 图像分割：从数据到部署',
    excerpt: '梳理医学影像分割的标注规范、数据增强策略，以及如何在有限算力下训练一个可用的 U-Net。',
    category: '医学影像',
    tags: ['深度学习', '分割', 'PyTorch', '医学影像'],
    date: '2026-08-21',
    readingTime: 9,
    aiSummary: '本文给出在 LIDC 子集上训练轻量 U-Net 的端到端流程，核心结论：小数据集下，规范标注 + 强数据增强 + 轻量结构优于堆参数。',
    terms: ['U-Net', 'Dice', '数据增强', 'HU 窗宽'],
    content: `## 背景

肺部 CT 分割是计算机辅助诊断的重要环节。本文记录一个**轻量 U-Net** 从标注到推理的完整流程。

## 数据准备

- 使用 LIDC-IDRI 子集，约 1200 张切片
- 标注遵循 ITK-SNAP 的半自动轮廓校正
- 像素值裁剪到 [-1000, 400] HU 区间

\`\`\`python
import torch
from monai.networks.nets import UNet

model = UNet(
    spatial_dims=2,
    in_channels=1,
    out_channels=2,
    channels=(16, 32, 64, 128),
    strides=(2, 2, 2),
).to("cuda")
\`\`\`

## 训练策略

> 医学数据少，数据增强比模型复杂度更重要。

采用随机旋转、弹性形变、亮度抖动，验证集 Dice 达到 **0.91**。

## 小结

小数据集下，规范标注 + 强增强 + 轻量结构，往往优于堆参数。`,
  },
  {
    id: 'gradcam-interpretability',
    title: '可解释性实战：用 Grad-CAM 让模型「说清」它在看哪',
    excerpt: '临床医生不信任黑盒。Grad-CAM 是建立信任的最低成本一步。',
    category: '可解释性',
    tags: ['可解释性', 'Grad-CAM', '可视化'],
    date: '2026-08-14',
    readingTime: 7,
    aiSummary: 'Grad-CAM 通过反向传播得到类别相关热力图，是建立临床信任的最低成本一步，但热力图≠因果，仅说明模型使用了哪片区域。',
    terms: ['Grad-CAM', '可解释性', '反向传播'],
    content: `## 为什么需要可解释性

医学场景里，**模型不仅要准，还要可信**。Grad-CAM 通过反向传播得到类别相关热力图。

## 实现要点

\`\`\`python
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

cam = GradCAM(model=model, target_layers=[model.layer4[-1]])
grayscale = cam(input_tensor, targets=[ClassifierOutputTarget(1)])
\`\`\`

## 注意

热力图≠因果。它只能说明「模型用了哪片区域」，不能证明「那是正确的依据」。`,
  },
  {
    id: 'rag-clinical-qa',
    title: '构建临床知识库问答：RAG 而非微调',
    excerpt: '为什么在医学问答上，检索增强比直接微调更稳妥、更易更新。',
    category: 'NLP',
    tags: ['RAG', 'LLM', '检索增强'],
    date: '2026-08-03',
    readingTime: 8,
    aiSummary: '对比微调与 RAG：医学问答中 RAG 更新成本低、幻觉可控、天然保留引用，更适合知识频繁更新场景。',
    terms: ['RAG', '检索增强', '向量库'],
    content: `## 微调 vs RAG

| 方式 | 更新成本 | 幻觉可控 | 适合场景 |
| --- | --- | --- | --- |
| 微调 | 高 | 低 | 风格定制 |
| RAG | 低 | 高 | 知识频繁更新 |

## 流程

1. 文档切分 + 向量化（BGE-M3）
2. 检索 Top-K
3. 拼接上下文送 LLM 生成

> 医学内容必须可溯源，RAG 天然保留引用片段。`,
  },
  {
    id: 'deploy-fastapi',
    title: '把模型做成 API：FastAPI + ONNX 推理服务',
    excerpt: '从 \`.pth\` 到可调用接口，记录一次生产化改造。',
    category: '工程',
    tags: ['部署', 'FastAPI', 'ONNX'],
    date: '2026-07-22',
    readingTime: 6,
    aiSummary: '将 PyTorch 模型转为 ONNX 后用 ONNX Runtime 提供服务，可减少依赖并提速；注意请求限制与模型常驻加载。',
    terms: ['ONNX', 'FastAPI', '推理服务'],
    content: `## 为什么转 ONNX

PyTorch 直接推理依赖运行时较重，转 ONNX 后可用 ONNX Runtime 提速并减少依赖。

\`\`\`python
@app.post("/predict")
async def predict(img: UploadFile):
    arr = preprocess(await img.read())
    out = session.run(None, {"input": arr})
    return {"mask": out[0].tolist()}
\`\`\`

## 部署注意

- 加请求大小限制与超时
- 模型加载放在启动时，避免每请求重载`,
  },
  {
    id: 'study-notes-ml',
    title: '大四实习笔记：医院影像科的 AI 落地观察',
    excerpt: '一线视角看 AI 工具如何真正进入 workflow，以及阻力来自哪里。',
    category: '随笔',
    tags: ['实习', '行业观察'],
    date: '2026-07-10',
    readingTime: 5,
    aiSummary: '一线观察：医生接受度取决于 AI 是否减少其工作而非增加；落地三前提是集成进 PACS、可一键复核、责任边界清晰。',
    terms: ['临床工作流', '落地', '责任边界'],
    content: `## 观察

医生对 AI 的接受度，取决于**它是否少干活而不是多干活**。

## 三个落地前提

1. 集成进 PACS，不增加额外点击
2. 结果可一键复核
3. 误诊责任边界清晰

技术只是门槛，工程与流程才是护城河。`,
  },
];
