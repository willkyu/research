---
title: Accuracy, Acc
description: ROC 曲线下面积，用于衡量二分类模型在不同判定阈值下区分正负样本的能力
type: concept
tags:
  - concept
  - matrices
draft: false
---

## 定义

ROC 曲线以 False Positive Rate 为横轴、True Positive Rate 为纵轴，改变分类阈值得到一系列点。AUROC 是该曲线下的面积。

  

$$

FPR=\frac{FP}{FP+TN},\qquad TPR=\frac{TP}{TP+FN}

$$

  

AUROC 可解释为随机抽取一个正例和一个负例时，模型给正例更高分数的概率（处理并列分数时按相应规则计分）。

  

## 备注

  

AUROC 衡量排序区分能力，不直接指定某个阈值下的分类表现。类别极不平衡时，也应结合 Precision-Recall 等指标解释。