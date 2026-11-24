---
title: Recall@K
description: topK召回率，前k个预测结果中命中的比例
type: concept
tags:
  - concept
  - matrices
draft: false
---

## 定义

在检索任务中，Recall@K 衡量相关项目是否出现在排名前 $K$ 的结果中。单查询场景常用：
  

$$

Recall@K=\frac{|\text{Relevant}\cap\text{TopK}|}{|\text{Relevant}|}

$$

若每个查询只有一个正确目标，该值退化为Hit@K：正确目标是否位于 Top-K。

## 备注

nan