---
title: Integrated Gradients (IG)
description: 沿基准输入到目标输入的路径积分模型梯度，以估计输入特征对指定模型输出的贡献
type: concept
tags:
  - concept
  - method
  - explainability
  - attribution
draft: false
---

## 定义

Integrated Gradients（IG）是一种基于梯度的 Feature Attribution 方法，用于估计输入数据中的各个特征对模型指定输出的贡献。

核心思想是：不只观察模型在当前输入位置的局部梯度，而是从一个基准输入（Baseline）出发，沿着通往实际输入的路径，累计模型输出对各个输入特征的梯度变化。

因此，IG 可以理解为：

Integrated Gradients = **Gradient along the path from Baseline to Input**

## 核心思想

IG 的计算包含三个关键步骤。

### 1. Baseline：选择基准输入

设实际输入为 $x$，选择一个参考输入 $x'$ 作为 Baseline。

例如：

- 图像：全黑图像。
- 传感器数据：全零信号或其他有意义的参考序列。
- 时间序列：静息状态或参考样本。

Baseline 是归因计算的参照点，并不一定代表现实中完全不存在信号的状态。

### 2. Interpolation Path：构造插值路径

不直接比较 Baseline 和实际输入，而是构造一条从 $x'$ 到 $x$ 的连续路径：

$$  
x(\alpha)=x'+\alpha(x-x')  
$$

其中：

$$  
\alpha\in[0,1]  
$$

当：
- $\alpha=0$：输入为 Baseline。
- $\alpha=1$：输入为实际输入。
- $0<\alpha<1$：输入位于两者之间。

### 3. Gradient Integration：沿路径积分梯度

在路径上的每个位置，计算模型目标输出对输入特征的梯度：

$$  
\frac{\partial F(x(\alpha))}{\partial x_i}  
$$

IG 不只使用实际输入位置的梯度，而是对整条路径上的梯度进行积分，再乘以实际输入与 Baseline 的差值（整条路径的长度）。这样得到该特征从 Baseline 变化到实际输入时，对模型输出的累计贡献。

## 数学公式

对于模型目标输出 $F(x)$，第 $i$ 个输入特征的 Integrated Gradient 定义为：

$$  
IG_i(x)=  
(x_i-x_i')  
\int_0^1  
\frac{\partial F(x'+\alpha(x-x'))}  
{\partial x_i}  
,d\alpha  
$$

其中：
- $x_i$：实际输入的第 $i$ 个特征。
- $x_i'$：Baseline 的第 $i$ 个特征。
- $\alpha$：插值路径参数。
- $F$：需要解释的模型输出，例如某个类别的 Logit。
- $\frac{\partial F}{\partial x_i}$：模型输出对第 $i$ 个输入特征的梯度。
- $IG_i(x)$：该特征的归因值。

### 数值积分近似

实际计算通常使用有限数量的插值点近似积分：

$$  
IG_i(x)\approx  
(x_i-x_i')  
\frac{1}{m}  
\sum_{k=1}^{m}  
\frac{  
\partial F\left(x'+\frac{k}{m}(x-x')\right)  
}{  
\partial x_i  
}  
$$

其中 $m$ 是积分路径上的采样步数。$m$ 越大，通常越能准确近似积分，但计算成本也会增加。

## 重要性质

### 1. Completeness

IG 满足完整性性质（Completeness）：

$$  
\boxed{  
\sum_i IG_i(x)=F(x)-F(x')  
}  
$$

即所有输入特征的归因值之和，等于实际输入与 Baseline 对应的模型输出之差。这是 IG 的重要性质之一，使归因结果具有整体贡献上的解释。实际数值积分会存在一定近似误差。

### 2. Sensitivity

归因方法应能够识别对模型输出产生实际影响的输入变化，而不应忽略真正具有贡献的特征。

### 3. Implementation Invariance

如果两个模型虽然内部实现不同，但对所有输入都表示相同的函数，那么 IG 应产生相同的归因结果。即归因依赖模型所表示的函数，而不是具体的网络实现形式。

## 在时间序列中的应用

对于多变量时间序列：

$$  
X\in\mathbb{R}^{T\times C}  
$$

其中：
- $T$：时间步数量。
- $C$：传感器通道数量。

可以对每个时间步和传感器通道分别计算 IG：

$$  
A\in\mathbb{R}^{T\times C}  
$$

其中：

$$  
A_{t,c}=IG_{t,c}(X)  
$$

表示第 $t$ 个时间步、第 $c$ 个传感器通道相对于 Baseline 对指定模型输出的归因。

最终可以得到 Attribution Map：

- 时间维度：定位重要的时间区间。
- 通道维度：定位重要的传感器。
- 归因值：表示各输入位置对目标输出的正向或负向贡献。

例如，在 HAR 中，可以通过 IG 分析模型预测 Walking 时，主要依赖哪些时间段的脚踝加速度或陀螺仪信号。

## 注意事项与局限

1. **Baseline Dependence**：归因结果依赖 Baseline 的选择。不同 Baseline 可能产生不同的归因结果。
2. **Target Dependence**：必须明确解释哪个模型输出，例如 Walking 对应的 Logit，而不是笼统地解释整个模型。
3. **Not Causality**：IG 描述输入特征对模型输出的贡献，不自动证明现实世界中的因果关系。
4. **Feature Correlation**：高度相关的输入特征可能使单个特征的贡献难以独立解释。
5. **Intepolation Validity**：对于具有复杂物理约束的输入，Baseline 与实际输入之间的线性插值可能产生不自然的中间输入。
6. **Computational Cost**：需要沿路径进行多次模型梯度计算，积分步数会影响计算成本和近似精度。

## 相关论文

- Sundararajan, M., Taly, A., and Yan, Q. (2017). [Axiomatic Attribution for Deep Networks](https://proceedings.mlr.press/v70/sundararajan17a.html). ICML 2017.
