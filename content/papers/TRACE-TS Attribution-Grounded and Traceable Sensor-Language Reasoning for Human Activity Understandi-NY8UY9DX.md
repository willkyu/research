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

针对的大问题是HAR传统分类模型仅仅为了完成分类任务，而不考虑解释性。从而推出LLM导向的模型。随后指出当前这些模型的解释只是plausible，而不faithful。 1. Grounding limitation：没有具体到具体传感器数据（grounded in sensor evidence）；2. Reasoning limitation：解释并不可追踪（explanations should e traceable）；3. 指出评估应当可诊断（diagnostic），这主要是为了引出他提出的评价指标SNM。

提到传统的HAR模型的label空间有限，但似乎没有怎么关注这个问题。应该只是引出LLM方法的背景。

## 方法与主要贡献

将传统流程从 【数据】-->【结果】变为【数据】-->【锚定的证据】-->【有向无环图（DAG）的推理】-->【结果】

这里DAG的层数是固定的，节点数与连接关系不是。也算是一种把归因展现出来的模板？

## 数据与实验

数据来源、评价指标、比较基线与关键条件。

## 关键结果与证据

记录对应页码、章节、图表或公式编号。

## 局限与适用范围

teacher的推理图的ground truth是LLM生成的，所以上限还是取决于LLM。是否只是学习了一个Attribution（由IG+SHAP组成）+被限定了推理方式为DAG的LLM呢？

## 与已有研究的关系

- 相关论文：
- 相关概念：
- 相关研究方向：

## 我的判断与待核实问题



## 下一步

- [ ] 拓展相关知识点为概念
- [ ] 补充论文与概念之间的双链