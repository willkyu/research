---
title: F1 Score
description: Precision 与 Recall 的调和平均数
type: concept
tags:
  - concept
  - matrices
draft: false
---

## 定义

$$
\begin{aligned}
F1&=2\cdot\frac{Precision\cdot Recall}{Precision+Recall}\\\\
&=\frac{2TP}{2TP+FP+FN}
\end{aligned}
$$



## 备注

  

F1 综合 Precision 和 Recall，不包含 TN。适合需要同时关注误报和漏报的场景。

## 备注

nan