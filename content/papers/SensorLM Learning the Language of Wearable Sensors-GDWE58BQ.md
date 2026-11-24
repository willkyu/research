---
tags: []
parent: "SensorLM: Learning the Language of Wearable Sensors"
collections: []
title: "SensorLM: Learning the Language of Wearable Sensors"
authors:
  - Yuwei Zhang
  - Kumar Ayush
  - Siyuan Qiao
  - A. Ali Heydari
  - Girish Narayanswamy
  - Maxwell A. Xu
  - Ahmed A. Metwally
  - Shawn Xu
  - Jake Garrison
  - Xuhai Xu
  - Tim Althoff
  - Yun Liu
  - Pushmeet Kohli
  - Jiening Zhan
  - Mark Malhotra
  - Shwetak Patel
  - Cecilia Mascolo
  - Xin Liu
  - Daniel McDuff
  - Yuzhe Yang
description: ""
type: paper
citekey: ""
year: "2025"
source_url: ""
status: unread
date: 2026-11-04
draft: false
citation-key: ""
zotero-key: B8MHDLAM
$version: 0
$libraryID: 1
$itemKey: P7XGL47Y
---
# SensorLM: Learning the Language of Wearable Sensors
## 一句话概括

最大的贡献是数据集：从大量sensor数据中对齐的文本描述标签，包括statistical、structural与semantic

## 研究问题与贡献

1. 现有工作主要只关注分类，而没有语言理解。
2. 直接用LLM处理传感器数据存在困难：数据高维、连续、量大，缺乏相应表示与对齐能力。
3. 缺少大规模sensor-text paired数据集

贡献：

1. 该工作提出了一个自动文本描述生成方法管线来处理传感器数据，生成Statistical、Structural、Semantic 三个层次。
2. 用1的管线构建了大型数据集：包含 103,643 人、2,489,570 person-days、约 59.7 million hours。
3. 在该数据集基础上，提出了统一的多模态预训练框架，将 [[CLIP Contrastive Language–Image Pretraining|CLIP]]、[[Captioning]] 和 [[CoCa Contrastive Captioners|CoCa]] 等范式整合到同一架构中。
## 方法

### 自动文本描述生成方法管线

![[Pasted image 20261117132443.png]]

三个层次的数据生成的都是文本，且都未使用大模型：

#### Statistical

针对每种传感器，计算其统计特征，例如一天的最大值、最小值、均值、方差等，并用预先设计好的句式模板生成文本。

#### Structural

对每个时间序列使用滑动窗口，主要检测一些预定义好的趋势，例如：

|Pattern|含义|
|---|---|
|Increasing Trend|持续上升趋势|
|Decreasing Trend|持续下降趋势|
|Stable Trend|相对稳定|
|Spike|突然出现的峰值|
|Drop|突然下降|

并使用预先设计好的句式模板生成文本。

#### Semantic

利用已有的高层语义记录（activities）与语言模板生成文本，例如“Observed Outdoor Bike activity from minute 550 to 561.”

### SensorLM：从sensor-text pairs中学习

![[Pasted image 20261117141516.png]]

采用 [[CoCa Contrastive Captioners|CoCa]]，结合 [[CLIP Contrastive Language–Image Pretraining|CLIP]] 与 [[Captioning]] 。同时进行对比学习与生成学习。主要包含三个模块：Sensor Encoder；Text Encoder；Multimodal Text Decoder

captionning loss的Ground-truth Caption就是sensor-text pair中的text。

输入：$(X_\text{24h},Y_\text{captions})$ ，模型内部将sensor data切为二位patch，例如$patch\_size=(2,10)$就是两个传感器，十分钟（在这里时间尺度为一分钟）的矩阵数据。
## 数据与实验

数据来源、评价指标、比较基线与关键条件。

## 关键结果与证据

记录对应页码、章节、图表或公式编号。

## 局限

- 文章说使用多种模板是为了增加语言多样性，但并没有相关实验。
- 切分的每个patch的多个传感器组并没有实际意义。
- 我认为粒度太粗了，24h的传感器数据，而Structural文本数据却是随机选取的，那么可能会淡化学到的知识？也难以对齐，如果让局部sensor与text对齐可能会更好？
- 接着上一条，**没有明确说明所有生成的 Caption 是否都永久保存在数据集中，以及随机子集是在数据预处理时抽取一次，还是训练过程中动态抽取。** 感觉还是有些不清楚，如果数据集的caption也是随机选取的话，数据集的质量有待商榷。



