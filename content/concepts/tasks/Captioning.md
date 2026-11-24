---
title: Captioning
description: 描述，根据输入内容生成简洁自然语言描述的条件文本生成任务
type: concept
tags:
  - concept
  - task
draft: false
---
## 定义
Captioning 是根据输入内容生成自然语言描述的任务。输入可以是图像、视频、音频或传感器时间序列；输出是描述输入中对象、事件、属性或时序模式的文本。
一般形式为：
$$

X\rightarrow Y

$$
其中 $X$ 是待描述的输入，$Y=(y_1,\ldots,y_L)$ 是生成的文本序列。自回归模型通常学习：
$$

P_\theta(Y\mid X)

=

\prod_{t=1}^{L}P_\theta(y_t\mid y_{<t},X)

$$
训练时通常使用参考描述作为目标序列，通过 Token-level cross-entropy 优化。

## 常见形式

- Image Captioning：根据图像生成描述。
- Video Captioning：描述视频中的动作、事件及其时间过程。
- Audio Captioning：描述声音来源、声学特征或事件。
- Sensor Captioning：描述传感器数据中的统计特征、时间模式或语义事件。