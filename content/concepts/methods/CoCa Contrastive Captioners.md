---
title: Contrastive Captioners (CoCa)
description: 联合对比学习与自回归文本生成的图文多模态预训练架构。主要思想就是AB两种模态对比学习+文本模态A自回归生成描述。
type: concept
tags:
  - concept
  - method
draft: false
---
## 定义
![[Pasted image 20261121134245.png]]

Contrastive Captioners (CoCa) 是一种图文多模态 Encoder–Decoder 预训练架构，联合优化对比学习目标和 Captioning 生成目标，使模型同时学习跨模态全局表示对齐和条件文本生成能力。使用图像编码器、文本侧 Transformer 和多模态文本 Decoder。

其关键设计是将 Decoder 分成两个阶段：
1. 前半部分不使用图像 Cross-Attention，形成单模态文本表示，可用于对比学习。
2. 后半部分通过 Cross-Attention 读取图像编码器输出，形成多模态表示，并用于自回归文本生成。
因此，两个目标共享模型计算图，但作用于不同阶段产生的表示。

总体目标为：
$$

\mathcal{L}

=

\lambda_{\mathrm{con}}\mathcal{L}_{\mathrm{con}}

+

\lambda_{\mathrm{cap}}\mathcal{L}_{\mathrm{cap}}

$$
其中：
- $\mathcal{L}_{\mathrm{con}}$：对比损失，使图像与文本的表示接近。
- $\mathcal{L}_{\mathrm{cap}}$：自回归 Captioning 损失，使 Decoder 根据图像特征生成文本。
- $\lambda_{\mathrm{con}}$、$\lambda_{\mathrm{cap}}$：两个目标的权重。

## 相关论文
- Yu et al. (2022), [CoCa: Contrastive Captioners are Image-Text Foundation Models](https://arxiv.org/abs/2205.01917), Transactions on Machine Learning Research, 2022.