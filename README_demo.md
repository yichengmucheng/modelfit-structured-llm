# 结构化大模型本地 Demo 说明

## 这个 demo 模拟了什么

```
分析师调用函数
      ↓
demo_baiqing.py   ←→   百擎平台（训练侧）
      ↓ 产出 6 个文件
demo_output/credit_risk_tab2.5_n1_f20_800/
      ↓ 传给百基
demo_baiji.py     ←→   百基平台（推理侧）
      ↓
合规校验 → 推理 → 一致性验证 → 整数分值
```

---

## 项目背景（一句话）

> 用预训练 Transformer 模型（TabPFN）替代传统风控评分卡，分析师几行代码出基线模型，不需要数据科学家调参。跨平台迁移时，靠 5 个自描述文件保证打分一致性。

---

## 运行步骤

### 第一步：运行百擎侧（训练 + 生成文件）

```bash
python demo_baiqing.py
```

**产出：**
```
demo_output/credit_risk_tab2.5_n1_f20_800/
├── credit_risk_tab2.5_n1_f20_800.pkl   # TabPFN 模型
├── io_schema.json                        # 特征顺序 + 输出契约
├── source_meta.json                      # 环境快照 + SHA-256
├── test_cases.json                       # 金标准 I/O
├── score.py                              # 固化系数（可直接 import）
└── score_test.json                       # 打分回归验证用例
```

### 第二步：运行百基侧（接入验证 + 打分）

```bash
python demo_baiji.py
```

**执行内容：**
1. 合规校验（文件完整性、SHA-256 三方一致、特征数对齐）
2. 按 io_schema 特征顺序加载模型推理
3. 对比 test_cases 金标准验证一致性
4. 调用 score.py 固化系数输出整数分值
5. 回归校验 score_test.json 所有用例

---

## 每个文件的作用

| 文件 | 谁生成 | 谁读取 | 作用 |
|------|--------|--------|------|
| `.pkl` | 百擎训练产出 | 百基加载推理 | TabPFN 模型本体（Transformer权重+训练数据上下文） |
| `io_schema.json` | `generate_io_schema()` | 百基 | 特征顺序、类型、正类定义。**顺序搞错结果就错** |
| `source_meta.json` | `generate_source_meta()` | 百基 | 环境版本快照、SHA-256 锚点，验证文件未被篡改 |
| `test_cases.json` | `generate_test_cases()` | 百基 | 金标准 I/O，迁移后验证打分是否一致 |
| `score.py` | 评分拉伸函数产出 | 百基 | 含固化系数，直接 import 调用 `apply_ls_score` 打分 |
| `score_test.json` | 评分拉伸函数产出 | 百基 | 打分回归用例，验证系数在百基侧结果一致 |

---

## TabPFN 的核心原理（为什么叫结构化大模型）

```
传统机器学习：
  训练数据 → 梯度下降更新权重 → 新数据推理
  每个业务场景要重新训练，耗时几天

TabPFN（In-Context Learning）：
  预训练 Transformer（已在海量数据集上训练好）
      ↓
  fit(X_train, y_train)  ← 不更新权重！只是把训练数据当 prompt 缓存进去
      ↓
  predict_proba(X_test)  ← Transformer 把训练数据作为上下文，直接推理
  
结果：几行代码，几秒出结果，可以作为基线验证业务方向
```

---

## 关键概念速查

| 概念 | 解释 |
|------|------|
| **pkl 文件** | Python 序列化格式，保存了 Transformer 权重引用 + 缓存的训练数据（prompt） |
| **SHA-256** | 文件指纹，64位十六进制。三个地方的值必须相同（source_meta / test_cases / pkl本体） |
| **positive_class** | 业务上"坏"的那一类（如违约=1），score.py 用这一列的概率算分 |
| **mode='L'** | 分值越高风险越高（高分拒绝），概率直接映射 |
| **mode='H'** | 分值越高风险越低（高分通过），内部先做 p=1-p 再映射 |
| **tolerance** | 允许的概率误差，fp32精度要求完全一致，bf16允许±0.006 |
| **In-Context Learning** | TabPFN 的推理机制，训练数据作为 Transformer 的上下文，不需要梯度下降 |
