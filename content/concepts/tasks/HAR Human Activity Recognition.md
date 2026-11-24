---
title: Human Activity Recognition (HAR)
description: 从多变量传感器时间序列中识别人类活动状态的任务
type: concept
tags:
  - concept
  - task
draft: false
---

## 定义

Human Activity Recognition（HAR）是从多变量传感器时间序列中识别人类活动状态的任务。一般形式为：

$$

X\in\mathbb{R}^{T\times C}

$$
其中 $T$ 是时间步数量，$C$ 是传感器通道数量。模型学习：
$$

f_\theta:X\rightarrow y

$$
其中 $y\in\mathcal{Y}$ 是活动类别。

## 备注

传统 HAR 通常是固定标签空间上的分类问题：
$$

X\rightarrow y

$$
主要评价预测类别是否正确，而不关注推理过程、可解释性等问题。但已有些工作开始关心对$f_\theta$的解释性工作。