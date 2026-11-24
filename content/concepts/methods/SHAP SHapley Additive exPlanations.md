---
title: SHapley Additive exPlanations  (SHAP)
description: 基于合作博弈论中的 Shapley Value 分配输入特征对模型预测贡献的特征归因框架，有一种消融实验的感觉。
type: concept
tags:
  - concept
  - method
  - explainability
draft: false
---

## 定义

SHapley Additive exPlanations (SHAP) 是一种基于合作博弈论（Cooperative Game Theory）中 Shapley Value 的特征归因框架。它通过考虑不同特征子集下某个特征加入前后的模型输出变化，为每个特征分配贡献值。

核心思想是：**计算一个特征在不同特征组合中的边际贡献，并对所有可能的组合进行加权平均。**

## 核心思想：Cooperative Game Theory

SHAP 的理论基础是合作博弈论。在合作博弈中，多个参与者共同创造收益，需要确定每个参与者对最终收益的贡献。

Shapley Value 的思想是：

1. 考虑所有可能的参与者组合。
2. 计算某个参与者加入不同组合时带来的边际收益。
3. 对所有可能组合的边际收益进行加权平均。
4. 将平均边际贡献分配给该参与者。

## 数学定义：Shapley Value

设全部输入特征集合为 $F$，总共有 $M$ 个特征。

对于特征 $i$，其 Shapley Value 定义为：

$$  
\boxed{  
\phi_i=  
\sum_{S\subseteq F\setminus{i}}  
\frac{|S|!(M-|S|-1)!}{M!}  
\left[  
v(S\cup{i})-v(S)  
\right]  
}  
$$

其中：

- $F$：全部输入特征的集合。
- $S$：不包含特征 $i$ 的任意特征子集。
- $v(S)$：仅考虑特征子集 $S$ 时定义的模型价值或预测输出。
- $v(S\cup{i})-v(S)$：特征 $i$ 在当前特征组合下的边际贡献。
- $M$：特征总数。
- $|S|$：当前特征子集的大小。

### 1. Marginal Contribution

$$  
MC_i(S)=v(S\cup{i})-v(S)  
$$

它表示在已有特征集合 $S$ 的基础上，加入特征 $i$ 后模型输出发生的变化。

例如：
$$  
v({x_1,x_2})-v({x_2})=0.40  
$$
表示当 $x_2$ 已经存在时，再加入 $x_1$，模型输出增加了 $0.40$。

### 2. Combination Weight

$$  
w(S)=  
\frac{|S|!(M-|S|-1)!}{M!}  
$$

该权重反映不同特征组合对应的加入顺序数量。它等价于：在所有可能的特征加入顺序中，特征 $i$ 前面恰好已经出现集合 $S$ 的概率。

因此，Shapley Value 并不是简单地对所有子集的边际贡献取算术平均，而是进行加权平均。


## Additive Explanation

SHAP 还有一个重要性质：模型预测可以表示为基准值与各特征贡献之和。

$$  
\boxed{  
f(x)=\phi_0+\sum_{i=1}^{M}\phi_i  
}  
$$

其中：
- $f(x)$：当前样本的模型输出。
- $\phi_0$：基准预测值，通常与背景数据上的期望模型输出有关。
- $\phi_i$：第 $i$ 个特征的 SHAP Value。
- $M$：特征数量。

这使得 SHAP 可以将一次模型预测分解为基准值和各输入特征的贡献。

## Background Dataset：如何处理缺失特征？

实际模型通常要求完整输入，但计算 $v(S)$ 时，我们可能只希望保留部分特征。因此需要定义：对于不属于 $S$ 的特征，应该如何处理？

SHAP 通常通过 Background Dataset（背景数据集）或相应的价值函数定义处理缺失特征。

例如：原始输入
$$  
X=(x_1,x_2,x_3)  
$$
当前只考虑：
$$  
S={x_1,x_2}  
$$
那么 $x_3$ 需要通过背景分布或其他缺失特征处理方式进行积分或替换。主要有以下两种：

### Interventional SHAP

使用背景分布中的特征值处理未观察到的特征，通常不保留它们与已观察特征之间的条件依赖。可以理解为：固定已观察特征，并从背景分布中处理其他特征。

### Conditional SHAP

根据已观察特征，对未观察特征的条件分布进行建模：
$$  
P(X_{\mathrm{missing}}\mid X_{\mathrm{observed}})  
$$
因此，未观察特征的取值会受到已观察特征的影响。

两种方式的解释设定不同，可能产生不同的归因结果。

## SHAP 的实际计算方法

精确计算 Shapley Value 需要考虑大量特征子集。对于 $M$ 个特征，每个特征需要考虑其他 $M-1$ 个特征的所有子集：

$$  
2^{M-1}  
$$

因此，精确计算的成本会随着特征数量指数增长。实际中通常使用近似算法。常见实现包括：

|方法|主要适用场景|
|---|---|
|KernelSHAP|模型无关的近似归因|
|TreeSHAP|决策树及树集成模型|
|DeepSHAP|深度学习模型的近似归因|

这些方法都与 Shapley Value 思想相关，但具体计算机制、适用模型和近似假设并不相同。

## 在时间序列中的应用

对于多变量时间序列：

$$  
X\in\mathbb{R}^{T\times C}  
$$

可以将以下内容定义为待归因特征：

- 单个时间步；
- 单个传感器通道；
- 一个时间窗口；
- 时间窗口与传感器通道的组合。

例如，将每个时间点、每个传感器通道作为独立特征，则：

$$  
M=T\times C  
$$

最终可以将归因值组织为时间—通道矩阵：

$$  
A\in\mathbb{R}^{T\times C}  
$$

其中 $A_{t,c}$ 表示对应时间点和传感器通道的 SHAP 归因值。

通过 Attribution Map 可以分析：

- 哪些时间区间对预测贡献较大；
- 哪些传感器通道更重要；
- 不同传感器特征之间是否存在贡献交互。

不过，时间序列中的特征通常存在较强相关性，特征分组、背景分布和缺失处理方式都会影响最终解释。

## 重要性质与局限

### Shapley Value 的理论性质

Shapley Value 满足以下经典性质：

1. **Efficiency**：所有特征的 Shapley Value 之和等于完整联盟价值与空联盟价值之差。
2. **Symmetry**：对于贡献结构完全对称的特征，分配相同的 Shapley Value。
3. **Dummy**：如果某个特征无论加入什么组合都不改变价值，其 Shapley Value 为零。
4. **Additivity**：对于两个价值函数之和，其 Shapley Value 等于各自 Shapley Value 之和。

### 实际应用中的局限

1. **Computational Complexity**：精确计算需要考虑大量特征子集，特征数量增加时计算成本迅速增长。
2. **Background Dependence**：归因结果依赖背景数据及其定义。
3. **Feature Dependence**：对于高度相关的特征，不同缺失特征处理方式可能导致不同的贡献分配。
4. **Approximation Error**：实际近似算法可能产生估计误差。
5. **Not Causality**：SHAP 衡量的是模型输出的特征贡献，不自动证明现实世界中的因果关系。

## 相关论文

- Lundberg, S. M., and Lee, S.-I. (2017). [A Unified Approach to Interpreting Model Predictions](https://proceedings.neurips.cc/paper/2017/hash/8a20a8621978632d76c43dfd28b67767-Abstract.html). NeurIPS 2017.
    

## 计算示例

假设有三个输入特征：

$$  
F={x_1,x_2,x_3}  
$$

它们分别代表：

- $x_1$：Ankle Acceleration
- $x_2$：Wrist Acceleration
- $x_3$：Heart Rate

假设不同特征组合对应的模型输出如下：

|特征集合 $S$|$v(S)$|
|---|---|
|$\varnothing$|0.20|
|${x_1}$|0.40|
|${x_2}$|0.30|
|${x_3}$|0.25|
|${x_1,x_2}$|0.70|
|${x_1,x_3}$|0.50|
|${x_2,x_3}$|0.45|
|${x_1,x_2,x_3}$|0.95|

现在计算 $x_1$ 的 Shapley Value。

不包含 $x_1$ 的特征子集有：

$$  
S\in  
{  
\varnothing,  
{x_2},  
{x_3},  
{x_2,x_3}  
}  
$$

分别计算四种情况下的边际贡献：

|已有特征|边际贡献|权重|
|---|---|---|
|$\varnothing$|$0.40-0.20=0.20$|$1/3$|
|${x_2}$|$0.70-0.30=0.40$|$1/6$|
|${x_3}$|$0.50-0.25=0.25$|$1/6$|
|${x_2,x_3}$|$0.95-0.45=0.50$|$1/3$|

最终：

$$  
\begin{aligned}  
\phi_1  
&=\frac13(0.20)  
+\frac16(0.40)\  
&\quad+\frac16(0.25)  
+\frac13(0.50)\  
&=0.3417  
\end{aligned}  
$$

因此，$x_1$ 的 Shapley Value 约为 $0.3417$。

这表示脚踝加速度在所有可能特征组合中的加权平均边际贡献为 $0.3417$。