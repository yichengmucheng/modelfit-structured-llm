import { useState } from "react";
import {
  Stack, Row, Grid, Card, CardHeader, CardBody,
  H1, H2, H3, Text, Divider, Pill, Table, Code,
  Callout, CollapsibleSection, Spacer, mergeStyle
} from "cursor/canvas";
import { useHostTheme } from "cursor/canvas";

// ─── 数据定义 ────────────────────────────────────────────────────────────────

const SCOPE_TABLE = [
  { module: "LDM 离线模型文件包", type: "规范新增", desc: "制定跨平台统一的文件目录结构、命名约定、sidecar 文件内容规范" },
  { module: "io_schema.json", type: "规范新增", desc: "输入特征契约（名称、顺序、类型、必填、缺失值规则）及输出标签契约" },
  { module: "source_meta.json", type: "规范新增", desc: "模型版本、形状、环境快照、pkl 哈希校验" },
  { module: "test_cases.json", type: "规范新增", desc: "金标准输入输出用例，供合规校验与平台间一致性验证" },
  { module: "Score.py / Score_test.py", type: "软性可选", desc: "概率→整数分值映射函数及其合规自测（仅需分值输出的业务场景使用）" },
  { module: "百擎平台合规校验器", type: "功能优化", desc: "自动校验必备文件完整性、字段三重一致性、形状对齐" },
];

const REQUIREMENT_TABLE = [
  { no: "1", module: "LDM 文件打包", team: "算法/数据科学团队", owner: "待定" },
  { no: "2", module: "io_schema.json 生成", team: "算法/数据科学团队", owner: "待定" },
  { no: "3", module: "source_meta.json 生成", team: "算法/数据科学团队", owner: "待定" },
  { no: "4", module: "test_cases.json 生成", team: "算法/数据科学团队", owner: "待定" },
  { no: "5", module: "Score.py 开发（可选）", team: "算法/数据科学团队", owner: "待定" },
  { no: "6", module: "合规校验器", team: "平台研发团队", owner: "待定" },
  { no: "7", module: "目标平台接入验证", team: "平台研发 + QA", owner: "待定" },
];

const RISK_TABLE = [
  {
    id: "R-01",
    desc: "n_estimators 数值不一致：源平台与目标平台设置不同（1 vs 4），导致推理结果差异",
    level: "高",
    range: "模型输出质量",
    measure: "迁移前确认强哥设置的 n_estimators 值，写入 source_meta.json 并作为合规必检项",
    owner: "算法负责人"
  },
  {
    id: "R-02",
    desc: "dtype 精度差异：源平台 float32 vs 目标平台 bf16，概率值偏差约 6e-3，可能导致分值跨桶",
    level: "中",
    range: "分值准确性",
    measure: "test_cases 记录生成时的 dtype；目标平台复现时同 dtype；Score.py 用 proba_round_decimals 量化消差",
    owner: "算法 + 平台研发"
  },
  {
    id: "R-03",
    desc: "device 未确认：CPU 与 GPU 推理结果存在细微差异",
    level: "低",
    range: "分值准确性",
    measure: "test_cases.generated_with.device 字段明确记录生成设备，目标平台对齐",
    owner: "平台研发"
  },
];

const IOSCHEMA_FIELDS = [
  { field: "name", type: "string", desc: '特征名称，与训练时 DataFrame 列名完全一致。例："age"、"city"' },
  { field: "dtype", type: '"numeric" | "categorical"', desc: "特征类型。numeric=数值型（整数/浮点数）；categorical=类别型（字符串枚举）。默认全为 numeric，需业务方标注类别列" },
  { field: "required", type: "boolean", desc: "该特征在打分时是否为必传字段。true=必须传入，缺失则拒绝请求；false=可不传" },
  { field: "missing_allowed", type: "boolean", desc: "该特征是否允许值为 null/NaN（即已传入但值缺失）。TabPFN 原生支持缺失值，不需要人工填充" },
  { field: "categories", type: "string[]（仅 categorical）", desc: '类别特征的全量枚举值，例：["bj","sh","gz","other"]。防止目标平台编码顺序不一致导致分数逆转' },
];

const SOURCE_META_FIELDS = [
  { field: "pkl_sha256", note: "自动填充", desc: "pkl 文件的 SHA-256 哈希值（64位十六进制）。三重一致性校验锚点，不可手填" },
  { field: "tabpfn_version", note: "自动填充（当前环境读取）", desc: "训练时使用的 TabPFN 包版本，如 6.3.2。单环境工作流下等于捕获环境版本" },
  { field: "sklearn_version", note: "自动填充", desc: "scikit-learn 版本，如 1.6.1" },
  { field: "numpy_version", note: "自动填充（随环境变化）", desc: "NumPy 版本，如 2.x。不同环境版本不同，迁移前需确认目标环境兼容性" },
  { field: "python_version", note: "自动填充（随环境变化）", desc: "Python 版本，如 3.12.7。影响 pkl 序列化兼容性，跨主版本迁移需重新序列化" },
  { field: "torch_version", note: "自动填充（随环境变化）", desc: "PyTorch 版本，如 2.x。TabPFN 底层依赖，版本差异可能影响推理结果" },
  { field: "n_estimators", note: "需向强哥确认", desc: "集成成员数量（1 或 4）。值越大结果越稳定但推理越慢。源/目标平台必须一致，否则结果不可比" },
  { field: "n_features", note: "随入参数据变化", desc: "训练集的特征列数。实际提取特征数（如147）与目录名中的 f150 可能不同，以 meta 为准" },
  { field: "n_train_rows", note: "随入参数据变化", desc: "训练集行数（精确整数）。影响模型上下文容量，超出上限需按官方文档处理" },
  { field: "device", note: "待定（当前 CPU）", desc: "推理设备。CPU 与 GPU 精度存在细微差异，需与 test_cases.generated_with.device 保持一致" },
];

// ─── 主组件 ────────────────────────────────────────────────────────────────

export default function LDMMigrationPRD() {
  const theme = useHostTheme();
  const t = theme.tokens;
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sectionStyle = mergeStyle({ marginBottom: 0 });
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: t.textSubtle,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 600,
  };
  const codeBlockStyle: React.CSSProperties = {
    background: t.backgroundSubtle,
    border: `1px solid ${t.borderSubtle}`,
    borderRadius: 6,
    padding: "10px 14px",
    fontFamily: "monospace",
    fontSize: 12,
    color: t.textDefault,
    lineHeight: 1.6,
    whiteSpace: "pre",
    overflowX: "auto",
  };
  const noteStyle: React.CSSProperties = {
    background: t.backgroundSubtle,
    borderLeft: `3px solid ${t.accentDefault}`,
    padding: "8px 12px",
    borderRadius: "0 4px 4px 0",
    fontSize: 13,
  };

  return (
    <Stack gap={0} style={{ padding: 32, maxWidth: 960, margin: "0 auto", color: t.textDefault }}>

      {/* ── 封面 ─────────────────────────────────── */}
      <Stack gap={8} style={{ marginBottom: 32 }}>
        <Row gap={8} align="center">
          <Pill tone="info">产品需求文档</Pill>
          <Pill tone="warning">草稿</Pill>
          <Pill>LDM-TN（版本号待定）</Pill>
        </Row>
        <H1>百擎平台 · LDM 离线模型文件规范</H1>
        <Text color="subtle">跨平台模型迁移与文件规范统一 · 版本 v1.0</Text>
        <Divider />
        <Grid columns={4} gap={12}>
          <Stack gap={2}><span style={labelStyle}>需求提出方</span><Text>业务方 / 算法团队</Text></Stack>
          <Stack gap={2}><span style={labelStyle}>文档编号</span><Text>LDM-TN-2026-001</Text></Stack>
          <Stack gap={2}><span style={labelStyle}>创建日期</span><Text>2026-05-28</Text></Stack>
          <Stack gap={2}><span style={labelStyle}>文档状态</span><Text>待评审</Text></Stack>
        </Grid>
      </Stack>

      {/* ── 1. 文档目的 ──────────────────────────── */}
      <CollapsibleSection header={<H2>1. 文档目的</H2>} defaultOpen>
        <Stack gap={12} style={sectionStyle}>
          <Text>
            本文档定义百擎平台在模型跨平台迁移场景下，离线模型文件（LDM，Loaded Model）的
            <strong>目录结构、文件命名、附属配置（sidecar）内容</strong>及<strong>合规校验规则</strong>，
            确保模型从源平台迁移至目标平台后，打分行为可复现、可审计、可自验证。
          </Text>
          <Callout tone="info">
            <strong>LDM-TN 编号说明：</strong>本文档在版本记录时使用「LDM-TN」作为固定前缀，
            后接流水号（如 LDM-TN-001）。前缀不随内容变化，是变更单的唯一标识锚点。
          </Callout>
        </Stack>
      </CollapsibleSection>

      <Divider />

      {/* ── 2. 背景与现状 ────────────────────────── */}
      <CollapsibleSection header={<H2>2. 背景与现状</H2>} defaultOpen>
        <Stack gap={20}>
          <Stack gap={8}>
            <H3>2.1 现状描述</H3>
            <Text>
              百擎平台基于 TabPFN 开源项目构建，为业务方提供「几行代码出基线模型」的快速建模能力。
              当前模型交付形态为单个 <strong>.pkl 文件</strong>（Python Pickle 序列化文件），
              存在以下问题：
            </Text>
            <Stack gap={6}>
              {[
                ["P-01", "信息不完整", ".pkl 仅是概率模型本体，不包含特征顺序、正类定义、打分逻辑等部署契约信息，跨平台迁移时依赖人工口头交接，易出错"],
                ["P-02", "可复现性差", "缺乏环境快照记录（Python/TabPFN/PyTorch 版本），不同平台运行结果可能存在精度差异（尤其 float32 vs bf16，误差约 6e-3）"],
                ["P-03", "无自验证手段", "无金标准测试用例，目标平台无法自主验证模型加载是否正确"],
                ["P-04", "打分逻辑散落", "概率到整数分值的映射（Score.py）未随模型文件一起交付，存在逆序风险（正类列错位导致高风险反得高分）"],
              ].map(([id, title, desc]) => (
                <Card key={id} size="sm">
                  <CardBody>
                    <Row gap={8} align="start">
                      <Pill tone="danger" style={{ flexShrink: 0, marginTop: 1 }}>{id}</Pill>
                      <Stack gap={2}>
                        <Text weight="medium">{title as string}</Text>
                        <Text color="subtle">{desc as string}</Text>
                      </Stack>
                    </Row>
                  </CardBody>
                </Card>
              ))}
            </Stack>
          </Stack>

          <Stack gap={8}>
            <H3>2.2 变更动因</H3>
            <Stack gap={6}>
              {[
                ["业务驱动", "业务方需要从 A 平台（源）迁移模型至 B 平台（目标）使用，要求打分结果完全一致"],
                ["合规驱动", "模型输出需要可审计，特征定义、正类定义、版本信息须随模型固化存档"],
                ["工程驱动", "解决当前「一个 pkl 打天下」导致的信息丢失问题，构建可自验证的标准化交付物"],
              ].map(([type, desc]) => (
                <Row key={type as string} gap={10} align="start">
                  <Pill tone="success" style={{ flexShrink: 0 }}>{type as string}</Pill>
                  <Text>{desc as string}</Text>
                </Row>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </CollapsibleSection>

      <Divider />

      {/* ── 3. 目标与范围 ────────────────────────── */}
      <CollapsibleSection header={<H2>3. 目标与范围</H2>} defaultOpen>
        <Stack gap={20}>
          <Stack gap={8}>
            <H3>3.1 业务目标</H3>
            <Stack gap={4}>
              {[
                "模型跨平台迁移后，打分结果与源平台完全一致（float32 精度下零误差）",
                "业务方可通过 test_cases.json 自主验证目标平台模型是否加载正确，无需依赖算法团队在场",
                "特征契约、正类定义随模型文件固化，消除口头交接导致的特征顺序/正类逆序风险",
              ].map((item, i) => (
                <Row key={i} gap={8} align="start">
                  <Text color="subtle" style={{ flexShrink: 0, marginTop: 1 }}>▸</Text>
                  <Text>{item}</Text>
                </Row>
              ))}
            </Stack>
            <div style={noteStyle}>
              <Text><strong>注意：</strong>n_estimators 的设置值（1 或 4）直接影响推理速度与结果质量，
              源平台与目标平台必须保持一致。<strong>迁移前须向强哥确认当前 n_estimators 值</strong>并写入 source_meta.json。
              </Text>
            </div>
          </Stack>

          <Stack gap={8}>
            <H3>3.2 技术目标</H3>
            <Stack gap={4}>
              {[
                "定义 LDM 标准目录结构与 4 类 sidecar 文件（io_schema / source_meta / test_cases / Score.py）",
                "实现 pkl_sha256 三重一致性校验（source_meta ↔ test_cases ↔ pkl 文件本体）",
                "提供合规校验器，自动检测必备件完整性与字段一致性",
              ].map((item, i) => (
                <Row key={i} gap={8} align="start">
                  <Text color="subtle" style={{ flexShrink: 0, marginTop: 1 }}>▸</Text>
                  <Text>{item}</Text>
                </Row>
              ))}
            </Stack>
          </Stack>

          <Stack gap={8}>
            <H3>3.3 变更范围清单</H3>
            <Table
              columns={[
                { key: "module", header: "系统模块", width: 220 },
                { key: "type", header: "变更类型", width: 120 },
                { key: "desc", header: "说明" },
              ]}
              rows={SCOPE_TABLE}
            />
          </Stack>
        </Stack>
      </CollapsibleSection>

      <Divider />

      {/* ── 4. 需求描述 ──────────────────────────── */}
      <CollapsibleSection header={<H2>4. 需求描述</H2>} defaultOpen>
        <Stack gap={28}>

          {/* 4.1 功能需求 */}
          <Stack gap={20}>
            <H3>4.1 功能需求</H3>

            {/* 4.1.1 核心理念 */}
            <Card>
              <CardHeader title="4.1.1 核心理念：一个可用的离线模型 = pkl + 部署契约" />
              <CardBody>
                <Stack gap={12}>
                  <Text>
                    <strong>pkl 是什么？</strong> .pkl（Pickle）是 Python 的二进制序列化文件格式，
                    用于将训练好的机器学习模型对象完整保存到磁盘。加载后可直接调用 <Code>predict()</Code> 进行推理。
                    但 pkl <strong>只包含模型权重与内部参数</strong>，不包含：特征名称与顺序、
                    哪个输出类别是业务"正类"、如何将概率转为整数分值、训练时的环境版本等信息。
                    这些缺失信息必须通过 sidecar 文件额外附带。
                  </Text>
                  <Divider />
                  <Text weight="medium">按「能否从 pkl 自动获取」分三层：</Text>
                  <Grid columns={3} gap={10}>
                    {[
                      ["① 内在（工具自动填）", "info", "pkl 本体、特征名+顺序（feature_names_in_）、输出类别（classes_）、形状（n_features / n_train_rows）、sha256 — 直接从 pkl 读取"],
                      ["② 可推导（带前提）", "success", "环境版本（当前 env 读取，单环境下等于训练值）、特征类型（默认 numeric）— 需要 env + 约定"],
                      ["③ 不存在于 pkl（人工填写）", "warning", "正类定义及业务含义、Score.py 打分逻辑、输出获取策略、test_cases 真实业务样例"],
                    ].map(([title, tone, desc]) => (
                      <Card key={title as string} size="sm">
                        <CardHeader title={title as string} />
                        <CardBody><Text color="subtle">{desc as string}</Text></CardBody>
                      </Card>
                    ))}
                  </Grid>
                </Stack>
              </CardBody>
            </Card>

            {/* 4.1.2 目录结构 */}
            <Card>
              <CardHeader title="4.1.2 目录结构与命名规范" />
              <CardBody>
                <Stack gap={12}>
                  <Text>所有文件统一放置在同一目录下，sidecar 与 pkl 共置：</Text>
                  <div style={codeBlockStyle}>{`raw/<business_scene>_tab<arch>_n<N>_f<F>_<rows>/
├── <同名>.pkl          # 拟合的 TabPFNClassifier（核心产物）
├── io_schema.json      # 输入特征契约 + 输出标签契约
├── source_meta.json    # 版本 + 形状 + sha256 + 环境快照
├── test_cases.json     # 金标准 I/O（可为空数组）
├── Score.py            # 概率→整数分值映射（软性，仅需分值时使用）
└── Score_test.py       # Score.py 合规自测（有 Score.py 则必配）`}</div>
                  <Stack gap={6}>
                    <Text weight="medium">目录命名约定（软性，不匹配只警告）：</Text>
                    <div style={codeBlockStyle}>{`^[a-z][a-z0-9_]*_(tab\\d+\\.\\d+)_n(\\d+)_f(\\d+)_(\\d+)$

示例：credit_risk_tab2.5_n1_f147_6000
      ↑业务场景      ↑架构版  ↑估计器数 ↑特征数 ↑训练行数`}</div>
                    <Callout tone="warning">
                      <strong>软性说明：</strong>目录名仅为「认知编码」，meta 文件是 ground truth。
                      例如目录名写 f150，但实际抽取后模型真实特征数可能是 147，以 source_meta.json 中的值为准。
                      n_features 与 n_train_rows 随每次训练的入参数据变化，须重新记录。
                    </Callout>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>

            {/* 4.1.3 io_schema.json */}
            <Card>
              <CardHeader title="4.1.3 io_schema.json — 输入特征契约 + 输出标签契约" />
              <CardBody>
                <Stack gap={16}>
                  <Text>
                    定义模型推理时的输入特征列表（顺序即特征顺序）及输出类别标签。
                    所有字段均需与训练时保持一致，不可在目标平台自行修改。
                  </Text>

                  <Stack gap={6}>
                    <Text weight="medium">inputs 字段说明（每个特征的定义）：</Text>
                    <Table
                      columns={[
                        { key: "field", header: "字段名", width: 160 },
                        { key: "type", header: "类型", width: 180 },
                        { key: "desc", header: "含义说明" },
                      ]}
                      rows={IOSCHEMA_FIELDS}
                    />
                  </Stack>

                  <Stack gap={6}>
                    <Text weight="medium">完整示例（含类别特征）：</Text>
                    <div style={codeBlockStyle}>{`{
  "schema_version": 1,
  "inputs": [
    {
      "name": "age",
      "dtype": "numeric",
      "required": true,
      "missing_allowed": true     // 允许年龄字段为空值
    },
    {
      "name": "city",
      "dtype": "categorical",
      "required": true,
      "missing_allowed": false,
      "categories": ["bj", "sh", "gz", "other"]  // 类别全集，防止编码顺序不一致
    }
  ],
  "outputs": {
    "classes": [0, 1],
    "positive_class": 1,          // 正类：业务上的"坏客户"或"风险用户"
    "positive_class_meaning": "违约/坏",
    "n_classes": 2
  }
}`}</div>
                    <Callout tone="danger">
                      <strong>positive_class 是关键防护：</strong>
                      指定哪个 class 是业务正类，Score.py 必须使用此值决定取哪一列概率。
                      若正类定义错误，高风险用户将得到低分，产生严重业务事故。
                    </Callout>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>

            {/* 4.1.4 source_meta.json */}
            <Card>
              <CardHeader title="4.1.4 source_meta.json — 版本/形状/环境快照" />
              <CardBody>
                <Stack gap={16}>
                  <Text>
                    记录模型生成时的完整环境快照，用于目标平台环境兼容性验证，
                    以及 pkl_sha256 三重一致性校验。
                  </Text>
                  <Table
                    columns={[
                      { key: "field", header: "字段", width: 160 },
                      { key: "note", header: "填写方式", width: 180 },
                      { key: "desc", header: "说明" },
                    ]}
                    rows={SOURCE_META_FIELDS}
                  />
                  <Stack gap={6}>
                    <Text weight="medium">完整示例：</Text>
                    <div style={codeBlockStyle}>{`{
  "schema_version": 1,
  "pkl_sha256": "<64位十六进制哈希>",     // 工具自动计算
  "captured_at": "2026-05-26T12:00:00Z",
  "env_capture": "单环境工作流：训练环境 == 捕获环境",
  "source": {
    "kind": "tabpfn",
    "tabpfn_version": "6.3.2",           // 随当前环境自动填充
    "sklearn_version": "1.6.1",
    "numpy_version": "2.x",              // 随环境变化
    "python_version": "3.12.7",          // 随环境变化
    "torch_version": "2.x"               // 随环境变化
  },
  "shape": {
    "n_estimators": 1,                   // ⚠️ 需向强哥确认（1 或 4）
    "n_features": 147,                   // 随入参数据变化
    "n_train_rows": 6000                 // 随入参数据变化
  },
  "naming": {
    "business_scene": "credit_risk",
    "arch": "2.5",
    "n": 1,
    "f": 147,
    "rows": 6000
  }
}`}</div>
                    <Callout tone="warning">
                      <strong>n_estimators 确认项：</strong>
                      该值决定集成成员数量，影响推理速度与结果质量。
                      平台可能设置为 1（快速/简单）或 4（稳定/复杂），
                      源平台与目标平台必须一致。<strong>写文档前需向强哥确认实际设置值。</strong>
                    </Callout>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>

            {/* 4.1.5 test_cases.json */}
            <Card>
              <CardHeader title="4.1.5 test_cases.json — 金标准 I/O 验证用例" />
              <CardBody>
                <Stack gap={16}>
                  <Text>
                    记录在源平台生成的真实输入输出样例，供目标平台加载模型后自主验证推理结果是否一致。
                    可为空数组（硬性要求文件存在，但内容可为空）。
                  </Text>

                  <Grid columns={2} gap={12}>
                    <Card size="sm">
                      <CardHeader title="场景 A：只需要概率输出（不需要分值）" />
                      <CardBody>
                        <div style={codeBlockStyle}>{`{
  "schema_version": 1,
  "generated_with": {
    "pkl_sha256": "<64位哈希>",
    "tabpfn_version": "6.3.2",
    "dtype": "float32",
    "device": "cpu"    // ⚠️ 待定，当前先填 cpu
  },
  "tolerance": {
    "proba_abs_fp32": 0.0,
    "proba_abs_bf16": 6e-3   // bf16 精度下允许差
  },
  "cases": [
    {
      "input": {"age": 35, "city": "bj"},
      "expected_proba": [0.31, 0.69]
      // ↑ 无需 expected_score
    }
  ]
}`}</div>
                      </CardBody>
                    </Card>
                    <Card size="sm">
                      <CardHeader title="场景 B：需要概率转分值（需要 Score.py）" />
                      <CardBody>
                        <div style={codeBlockStyle}>{`{
  "schema_version": 1,
  "generated_with": {
    "pkl_sha256": "<64位哈希>",
    "tabpfn_version": "6.3.2",
    "dtype": "float32",
    "device": "cpu"    // ⚠️ 待定
  },
  "tolerance": {
    "proba_abs_fp32": 0.0,
    "proba_abs_bf16": 6e-3,
    "score_exact_fp32": true
  },
  "cases": [
    {
      "input": {"age": 35, "city": "bj"},
      "expected_proba": [0.31, 0.69],
      "expected_score": 642   // 需要分值时才加此字段
    }
  ]
}`}</div>
                      </CardBody>
                    </Card>
                  </Grid>

                  <Callout tone="info">
                    <strong>device 字段待定说明：</strong>
                    CPU 与 GPU 推理结果存在细微精度差异。当前先记录为 "cpu"，
                    目标平台必须使用相同设备类型复现才能通过校验。正式确定后更新此字段。
                  </Callout>
                </Stack>
              </CardBody>
            </Card>

            {/* 4.1.6 Score.py */}
            <Card>
              <CardHeader title="4.1.6 Score.py + Score_test.py — 概率转分值（软性可选）" />
              <CardBody>
                <Stack gap={16}>
                  <Callout tone="success">
                    <strong>按需使用：</strong>仅当业务场景需要将模型概率转换为整数分值
                    （如信用评分卡 300-999 分）时，才需要 Score.py。
                    <strong>如果业务只需要概率输出，可跳过此文件，目录结构中也不需要包含。</strong>
                  </Callout>

                  <Text>
                    Score.py 将概率映射为整数分值，是<strong>纯函数</strong>（同输入同输出，无副作用）。
                    一旦提供，Score_test.py 为必配项。
                  </Text>

                  <Stack gap={6}>
                    <Text weight="medium">契约约束（Score_test.py 会强制验证）：</Text>
                    <Stack gap={4}>
                      {[
                        ["保序", "prob_a < prob_b 时分数方向全程一致，贯穿量化步骤"],
                        ["可复现", "先用 proba_round_decimals 量化掉浮点尾数，同一业务概率在 fp32/bf16/跨平台统一分数"],
                        ["纯函数", "同输入同输出，无外部状态依赖"],
                        ["全域", "闭区间 [0,1]（含 0.0/1.0）有效；NaN/<0/>1 → ValueError"],
                        ["有界", "输出 ∈ [score_range[0], score_range[1]]"],
                      ].map(([name, desc]) => (
                        <Row key={name as string} gap={8} align="start">
                          <Pill tone="info" style={{ flexShrink: 0 }}>{name as string}</Pill>
                          <Text color="subtle">{desc as string}</Text>
                        </Row>
                      ))}
                    </Stack>
                  </Stack>

                  <div style={codeBlockStyle}>{`"""Score conversion. proba_pos ∈ [0,1] → int."""
Score_version: str = "2026-05-26"
Score_range: tuple[int, int] = (300, 999)
Positive_class: int = 1           # 必须与 io_schema.outputs.positive_class 一致
n_classes_expected: int = 2
proba_round_decimals: int = 6     # 必填：映射前先量化的小数位

def stretch(prob_pos: float) -> int:
    """先量化再映射，杜绝浮点尾数导致的分数跳桶"""
    p = round(prob_pos, proba_round_decimals)  # 第一步：量化
    # ... 映射到 [Score_range[0], Score_range[1]]
    # 允许 import: 仅 numpy / 标准库 math`}</div>
                </Stack>
              </CardBody>
            </Card>

            {/* 4.1.7 合规校验 */}
            <Card>
              <CardHeader title="4.1.7 合规校验规则" />
              <CardBody>
                <Stack gap={12}>
                  <Grid columns={2} gap={12}>
                    <Stack gap={8}>
                      <Row gap={6} align="center">
                        <Pill tone="danger">硬性（阻塞合规）</Pill>
                      </Row>
                      <Stack gap={4}>
                        {[
                          "pkl + io_schema.json + source_meta.json + test_cases.json 四文件齐全",
                          "len(io_schema.inputs) == source_meta.shape.n_features（特征数一致）",
                          "source_meta.pkl_sha256 == sha256(pkl 文件) == test_cases.generated_with.pkl_sha256（三重一致）",
                          "每个 case 的 expected_proba 长度 == n_classes",
                        ].map((item, i) => (
                          <Row key={i} gap={6} align="start">
                            <Text color="subtle" style={{ flexShrink: 0 }}>✗→阻塞</Text>
                            <Text color="subtle">{item}</Text>
                          </Row>
                        ))}
                      </Stack>
                    </Stack>
                    <Stack gap={8}>
                      <Row gap={6} align="center">
                        <Pill tone="warning">软性（仅警告，不阻塞）</Pill>
                      </Row>
                      <Stack gap={4}>
                        {[
                          "Score.py 存在（按需配置）",
                          "categorical 类别枚举填写完整",
                          "positive_class_meaning 业务含义说明",
                          "test_cases 中有具体真实业务样例（非空）",
                          "目录名与 meta 中的 naming 字段匹配",
                        ].map((item, i) => (
                          <Row key={i} gap={6} align="start">
                            <Text color="subtle" style={{ flexShrink: 0 }}>⚠️警告</Text>
                            <Text color="subtle">{item}</Text>
                          </Row>
                        ))}
                      </Stack>
                    </Stack>
                  </Grid>
                </Stack>
              </CardBody>
            </Card>
          </Stack>

          {/* 4.2 非功能需求 */}
          <Stack gap={12}>
            <H3>4.2 非功能需求</H3>
            <Card>
              <CardHeader title="4.2.1 文件交付要求" />
              <CardBody>
                <Stack gap={6}>
                  {[
                    "所有 sidecar JSON 文件须包含 schema_version: 1 字段",
                    "pkl 文件名须与所在目录名相同（同名原则）",
                    "JSON 文件使用 UTF-8 编码，禁止 BOM 头",
                    "test_cases.json 可为空数组，但文件本身必须存在",
                  ].map((item, i) => (
                    <Row key={i} gap={6} align="start">
                      <Text color="subtle" style={{ flexShrink: 0 }}>▸</Text>
                      <Text>{item}</Text>
                    </Row>
                  ))}
                </Stack>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="4.2.2 故障处理机制" />
              <CardBody>
                <Stack gap={6}>
                  {[
                    ["sha256 不一致", "立即阻断加载，提示「模型文件已损坏或被替换，请重新从源平台导出」"],
                    ["n_estimators 不一致", "警告提示两端配置差异，要求对齐后重新导出"],
                    ["Score.py 存在但无 Score_test.py", "硬性阻断，必须补充测试文件"],
                    ["positive_class 未填写但 Score.py 存在", "硬性阻断，防止正类逆序风险"],
                    ["dtype 与目标平台不一致", "警告提示精度差异，参考 test_cases tolerance 中的 proba_abs_bf16 容差"],
                  ].map(([scenario, action]) => (
                    <Row key={scenario as string} gap={8} align="start">
                      <Pill tone="danger" style={{ flexShrink: 0 }}>{scenario as string}</Pill>
                      <Text color="subtle">{action as string}</Text>
                    </Row>
                  ))}
                </Stack>
              </CardBody>
            </Card>
          </Stack>

          {/* 4.3 需求与责任分配 */}
          <Stack gap={8}>
            <H3>4.3 需求与责任分配表</H3>
            <Callout tone="warning">以下责任人待定，评审时确认各方负责人后填写。</Callout>
            <Table
              columns={[
                { key: "no", header: "序号", width: 60 },
                { key: "module", header: "所属模块" },
                { key: "team", header: "责任团队", width: 180 },
                { key: "owner", header: "责任人", width: 100 },
              ]}
              rows={REQUIREMENT_TABLE}
            />
          </Stack>
        </Stack>
      </CollapsibleSection>

      <Divider />

      {/* ── 5. 技术方案 ──────────────────────────── */}
      <CollapsibleSection header={<H2>5. 技术方案</H2>}>
        <Callout tone="info">
          由技术团队在评审前完成填写，暂未确定填写「补充」。
          关键待确认项：n_estimators 值、device 类型、各环境 numpy/python/torch 版本约束。
        </Callout>
      </CollapsibleSection>

      <Divider />

      {/* ── 6. 任务拆解与里程碑 ──────────────────── */}
      <CollapsibleSection header={<H2>6. 任务拆解与里程碑</H2>}>
        <Table
          columns={[
            { key: "task", header: "关键任务" },
            { key: "owner", header: "负责方", width: 160 },
            { key: "deadline", header: "交付时间", width: 120 },
          ]}
          rows={[
            { task: "确认 n_estimators 值（向强哥确认）", owner: "算法团队", deadline: "待定" },
            { task: "确认推理 device 类型", owner: "平台研发", deadline: "待定" },
            { task: "开发 sidecar 文件自动生成工具", owner: "算法/平台研发", deadline: "待定" },
            { task: "开发合规校验器（硬性规则）", owner: "平台研发", deadline: "待定" },
            { task: "源平台存量模型补打 sidecar", owner: "算法团队", deadline: "待定" },
            { task: "目标平台验证与上线", owner: "平台研发 + QA", deadline: "待定" },
          ]}
        />
      </CollapsibleSection>

      <Divider />

      {/* ── 7. 资源与预算 ────────────────────────── */}
      <CollapsibleSection header={<H2>7. 资源与预算</H2>}>
        <Text color="subtle">待评审后补充实际人力与计算资源估算。</Text>
      </CollapsibleSection>

      <Divider />

      {/* ── 8. 风险与应对 ────────────────────────── */}
      <CollapsibleSection header={<H2>8. 风险与应对</H2>} defaultOpen>
        <Table
          columns={[
            { key: "id", header: "风险编号", width: 80 },
            { key: "desc", header: "风险描述" },
            { key: "level", header: "等级", width: 70 },
            { key: "range", header: "影响范围", width: 130 },
            { key: "measure", header: "应对措施" },
            { key: "owner", header: "责任方", width: 110 },
          ]}
          rows={RISK_TABLE}
          getRowTone={(row) =>
            row.level === "高" ? "danger" : row.level === "中" ? "warning" : undefined
          }
        />
      </CollapsibleSection>

      <Divider />

      {/* ── 9. 测试方案 ──────────────────────────── */}
      <CollapsibleSection header={<H2>9. 测试方案</H2>}>
        <Stack gap={12}>
          <Callout tone="info">由 QA 补充完整测试方案，以下为验收标准框架。</Callout>
          <Stack gap={6}>
            {[
              "合规校验器：对标准 LDM 包执行硬性校验全部通过，对缺少必备件的包返回明确错误码",
              "sha256 三重一致性：修改 pkl 后合规校验器报错",
              "特征顺序验证：打乱 io_schema inputs 顺序后，score 结果与预期不符，平台给出警告",
              "正类逆序防护：交换 positive_class 定义后，Score_test.py 中保序校验失败",
              "test_cases 回归：在目标平台加载模型后，对 test_cases 中所有 case 执行推理，float32 精度下 proba 完全一致",
              "n_estimators 一致性：源/目标平台 n_estimators 不同时，合规校验器输出警告",
            ].map((item, i) => (
              <Row key={i} gap={8} align="start">
                <Pill style={{ flexShrink: 0 }}>TC-{String(i + 1).padStart(2, "0")}</Pill>
                <Text>{item}</Text>
              </Row>
            ))}
          </Stack>
        </Stack>
      </CollapsibleSection>

      <Divider />

      {/* ── 10. 附件清单 ─────────────────────────── */}
      <CollapsibleSection header={<H2>10. 附件清单</H2>}>
        <Stack gap={6}>
          {[
            "LDM 技术规范文档（本文档依据来源）",
            "TabPFN 开源项目说明文档",
            "Score.py 参考实现模板",
            "sidecar 文件生成工具使用说明（待补充）",
          ].map((item, i) => (
            <Row key={i} gap={6} align="start">
              <Text color="subtle" style={{ flexShrink: 0 }}>▸</Text>
              <Text>{item}</Text>
            </Row>
          ))}
        </Stack>
      </CollapsibleSection>

      <Divider />

      {/* ── 11. 签署页 ───────────────────────────── */}
      <CollapsibleSection header={<H2>11. 签署页</H2>}>
        <Text color="subtle" style={{ marginBottom: 12 }}>
          本文档经以下各方确认后正式生效。
        </Text>
        <Table
          columns={[
            { key: "role", header: "角色", width: 180 },
            { key: "name", header: "姓名", width: 120 },
            { key: "status", header: "签字 / 确认日期", width: 160 },
          ]}
          rows={[
            { role: "需求提出方", name: "待确认", status: "☐ 待确认" },
            { role: "技术负责人", name: "待确认", status: "☐ 待确认" },
            { role: "测试负责人", name: "待确认", status: "☐ 待确认" },
            { role: "运维负责人", name: "待确认", status: "☐ 待确认" },
            { role: "安全负责人", name: "待确认", status: "☐ 待确认" },
          ]}
        />
      </CollapsibleSection>

      <Spacer size={32} />
      <Text color="subtle" style={{ textAlign: "center", fontSize: 12 }}>
        百擎平台 · LDM 离线模型文件规范 PRD · 文档编号 LDM-TN-2026-001 · 草稿版本
      </Text>
    </Stack>
  );
}
