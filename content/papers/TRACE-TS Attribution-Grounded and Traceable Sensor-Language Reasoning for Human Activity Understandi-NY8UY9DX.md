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

训练expert HAR模型（$C=\text{Attend-and-Discriminate}$），应当是正常训练的一个分类模型，论文没有给出明确设置。

### Stage 1

提取expert HAR模型训练正确的样本继续（错误的直接舍去），利用 **IG** 与**SHAP**归因，然后送入teacher LLM生成DAG，用于Stage 2的训练。这一阶段没有参数被训练

### Stage 2

原始sensor数据通过预训练时序小模型（MantisV2，冻结）后，通过projector（训练）映射到语言模型空间，作为Sensor Memory。将其插入语言模型（冻结）的每个decoder layer：

$$
H^{(l)}=H^{(l-1)}+\alpha_l\operatorname{CrossAttn}(Q,K,V)
$$
其中 $K$，$V$来自Sensor Memory，$Q$来自$H^{(l-1)}$.
输出DAG后与Stage 1中的DAG计算loss。

## 局限与适用范围

Stage1（即teacher那一条路）将expert HAR分类错误的舍弃了，那么应当也不会进入到Stage2的student的学习（但是原文似乎没有提到）。也就是说，模型完全只从分类正确的模型中学到了DAG，那么是否某些特定的模式就被忽视了呢？文章并没有指出丢弃了多少样本，以及丢弃了的样本的处理。

teacher的推理图的ground truth是LLM生成的，所以上限还是取决于LLM。

是否只是学习了在**特定样本上**的（expert HAR分类正确的），由**Attribution**（由IG+SHAP组成）+被**限定了推理方式为DAG的LLM**的知识？

## 与已有研究的关系

- 相关论文：
- 相关概念：
- 相关研究方向：

## 我的判断与待核实问题



## 下一步

- [ ] 拓展相关知识点为概念
- [ ] 补充论文与概念之间的双链