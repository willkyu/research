---
title: Contrastive Language–Image Pretraining (CLIP)
description: 通过图像编码器与文本编码器的对比学习，主要思想就是将两种不同模态映射到共享语义空间，正样本接近，负样本远离。
type: concept
tags:
  - concept
  - method
draft: false
---
## 定义
CLIP（Contrastive Language–Image Pre-training）是一种双编码器视觉语言预训练方法。它分别使用图像编码器和文本编码器，将图像与文本映射到同一个向量空间，并通过对比学习提高匹配图文对的相似度、降低不匹配图文对的相似度。

给定一个 batch 的图文对 $(I_i,T_i)$：
$$

z_i^I=f_I(I_i),\qquad z_i^T=f_T(T_i)

$$
通常对两个向量进行投影和归一化，再计算相似度：
$$

s_{ij}=\frac{(z_i^I)^\top z_j^T}{\tau}

$$
其中 $\tau$ 是温度参数。训练时，batch 中配对的 $(I_i,T_i)$ 是正样本，其他图文组合通常作为负样本。损失同时考虑 image-to-text 和 text-to-image 两个方向。

## 备注
- CLIP 的核心是全局跨模态表示对齐。
- 它可以支持跨模态检索和基于文本类别描述的零样本分类。
- CLIP 原始工作针对图像—文本；将其迁移到传感器—文本需要相应的 Sensor Encoder、数据配对和训练设计。