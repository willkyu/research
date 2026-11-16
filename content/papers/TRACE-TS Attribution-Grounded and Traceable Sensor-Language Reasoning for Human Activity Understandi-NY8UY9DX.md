---
title: "TRACE-TS: Attribution-Grounded and Traceable Sensor-Language Reasoning for Human Activity Understanding"
authors: ["Sparsh Rastogi","Tanmay Kumar","Baiyu Chen","Jatin Bedi","Zechen Li","Flora D. Salim"]
description: ""
type: paper
citekey: ""
year: "2026"
tags: ["Computer-Science-Artificial-Intelligence","Computer-Science-Computation-and-Language","Computer-Science-Emerging-Technologies","Computer-Science-Machine-Learning"]
source_url: ""
status: unread
date: "2026-11-13"
draft: false
citation-key: ""
zotero-key: "EPQWN555"
parent: 'TRACE-TS: Attribution-Grounded and Traceable Sensor-Language Reasoning for Human Activity Understanding'
collections:
    - 'wearable sensors'
$version: 0
$libraryID: 1
$itemKey: NY8UY9DX

---
# TRACE-TS: Attribution-Grounded and Traceable Sensor-Language Reasoning for Human Activity Understanding
## 一句话概括

> TRACE-TS proposes an attribution-guided teacher–student framework that distills sensor-grounded, DAG-structured reasoning from a complex offline pipeline into a student model that directly generates activity predictions and traceable explanations from raw sensor time series.

TRACE-TS 提出了一种归因引导的 Teacher–Student 框架，通过复杂的离线归因与推理流程构造结构化 DAG 监督，再将其蒸馏到 Student，使其能够直接从原始传感器时序数据生成活动预测和可追溯解释。

## 研究问题

针对的大问题是HAR传统分类模型仅仅为了完成分类任务，而不考虑解释性。从而推出LLM导向的模型。随后指出当前这些模型的解释只是plausible，而不faithful。

1. **Grounding limitation**：没有具体到具体传感器数据（grounded in sensor evidence）；
2. **Reasoning limitation**：解释并不可追踪（explanations should be traceable）；
3. 指出评估应当可诊断（**diagnostic**），这主要是为了引出他提出的评价指标SNM。

> 提到传统的HAR模型的label空间有限，但似乎没有怎么关注这个问题。应该只是引出LLM方法的背景。

## 方法与主要贡献

将传统流程从 【数据】-->【结果】变为【数据】-->【锚定的证据】-->【有向无环图（DAG）的推理】-->【结果】

这里DAG的层数是固定的，节点数与连接关系不是。也算是一种把归因展现出来的模板？

![[Pasted image 20261116183148.png]]
### Stage 0

> 论文中将其算在Stage1中

训练expert HAR模型（$C=\text{Attend-and-Discriminate}$），应当是正常训练的一个分类模型，论文没有给出明确设置。是一个可替换的上游组件。

### Stage 1

提取expert HAR模型预测正确的样本继续（错误的直接舍去），利用 **IG** 与**SHAP**归因，然后送入teacher LLM（Qwen 3.5 122B-A10B，$冻结$）生成DAG，用于Stage 2的训练。这一阶段没有参数被训练

$$X\rightarrow C(X)\rightarrow \begin{cases} IG(X,C)\\ SHAP(X,C) \end{cases}$$

$$A=\sqrt{\widetilde A^{IG}\cdot\widetilde A^{SHAP}}$$

然后：

$$(A,\hat y,\text{Prompt}) \rightarrow Teacher\ LLM \rightarrow G_T$$
Teacher LLM的Prompt包括：
- Predicted Activity；
- Confidence；
- High-Importance Regions；
- Attribution Threshold；
- Temporal Phase Analysis；
- 预先规定的 DAG 输出规范。

### Stage 2

原始sensor数据通过预训练时序小模型（MantisV2，$冻结$）后，通过projector（$训练$）映射到语言模型空间$Z=g_\phi(z)\in\mathbb R^{8\times d}$，作为Sensor Memory。将其插入语言模型（Gemma 4 4B，$冻结$）的每个decoder layer：

$$
H^{(l)}=H^{(l-1)}+\alpha_l\operatorname{CrossAttn}(Q,K,V)
$$
其中 $K$，$V$来自Sensor Memory，$Q$来自$H^{(l-1)}$, $\alpha_l$是可学习的 Gate，初始化为 0.01，使模型逐步学习传感器数据.
输出DAG后与Stage 1中的DAG计算loss。（没有分类loss）

## 可解释性指标

提出的SNM（Semantic Node Match），用于比较 Student DAG 与 Teacher Reference DAG。

| Metric  | Evaluation Target |
| ------- | ----------------- |
| SNM-OF1 | Observation 节点匹配  |
| SNM-IF1 | Inference 节点匹配    |
| SNM-SA  | Synthesis 整体语义一致性 |
 $$w(o_i^*,\hat o_j)= \begin{cases} \mathcal J\left( \phi(o_i^*),\phi(\hat o_j) \right), & \sigma(o_i^*)=\sigma(\hat o_j) \\[6pt] 0,&\text{otherwise} \end{cases}$$
- $o_i^*$：Reference DAG 中的第 $i$ 个节点。
- $\hat o_j$：Student DAG 中的第 $j$ 个节点。
- $w$：这两个节点之间的匹配权重。
- $\sigma(o)=\text{Sensor Channel}$
- $\phi(o)=\text{Node Description}$
- $\mathcal J(a,b)=\text{Semantic Similarity / Equivalence}$，文章使用Qwen 3.5 35B-A3B 作为 Judge
## 局限与适用范围

Stage1（即teacher那一条路）将expert HAR分类错误的舍弃了，那么应当也不会进入到Stage2的student的学习（但是原文似乎没有提到）。也就是说，模型完全只从分类正确的模型中学到了DAG，那么是否某些特定的模式就被忽视了呢？文章并没有指出丢弃了多少样本，以及丢弃了的样本的处理。

teacher的推理图的ground truth是LLM生成的，整个模型的上限还是取决于Expert HAR Classifier, 归因方法, teacher LLM, 和预定义的 DAG schema。

是否只是学习了在**特定样本上**的（expert HAR分类正确的），由**Attribution**（由IG+SHAP组成）+被**限定了推理方式为DAG的LLM**的知识？

## 与已有研究的关系

- 相关论文：
- 相关概念：
- 相关研究方向：

## 我的判断与待核实问题



## 下一步

- [ ] 拓展相关知识点为概念
- [ ] 补充论文与概念之间的双链