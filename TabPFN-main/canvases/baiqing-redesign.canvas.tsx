import {
  Stack, Row, Grid, Card, CardHeader, CardBody,
  H1, H2, H3, Text, Button, Divider, Spacer,
  Pill, Callout, Stat, Table,
  useHostTheme,
} from "cursor/canvas";
import { useState } from "react";

// ─── 颜色 token 助手 ───────────────────────────────────────────────────────────
function useT() {
  return useHostTheme().tokens;
}

// ─── 步骤气泡 ─────────────────────────────────────────────────────────────────
function Step({ n, label, active }: { n: number; label: string; active?: boolean }) {
  const t = useT();
  return (
    <Row gap={10} align="center">
      <div style={{
        width: 28, height: 28, borderRadius: 14, flexShrink: 0,
        background: active ? t.buttonPrimaryBackground : t.surfaceTertiary,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Text size="small" weight="semibold"
          style={{ color: active ? t.buttonPrimaryLabel : t.textSecondary }}>
          {n}
        </Text>
      </div>
      <Text size="small" tone={active ? "primary" : "secondary"} weight={active ? "medium" : "normal"}>
        {label}
      </Text>
    </Row>
  );
}

// ─── 比例滑块 ─────────────────────────────────────────────────────────────────
function RatioSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const t = useT();
  const steps = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
  return (
    <Stack gap={8}>
      <Row gap={0} justify="space-between">
        {steps.map((s) => (
          <button key={s} onClick={() => onChange(s)} style={{
            background: value === s ? t.buttonPrimaryBackground : t.surfaceTertiary,
            color: value === s ? t.buttonPrimaryLabel : t.textSecondary,
            border: "none", borderRadius: 6, padding: "4px 10px",
            cursor: "pointer", fontSize: 13, fontWeight: value === s ? 600 : 400,
          }}>
            {s === 0 ? "全量" : s}
          </button>
        ))}
      </Row>
      <Text size="small" tone="tertiary">
        {value === 0
          ? "全量训练，不输出评估指标（适合最终交付模型）"
          : `验证集占比 ${(value * 100).toFixed(0)}%，训练集 ${((1 - value) * 100).toFixed(0)}%`}
      </Text>
    </Stack>
  );
}

// ─── 字段说明行 ───────────────────────────────────────────────────────────────
function MetaRow({ items }: { items: Array<{ label: string; value: string }> }) {
  const t = useT();
  return (
    <Row gap={24} wrap>
      {items.map(({ label, value }) => (
        <Row key={label} gap={6} align="center">
          <Text size="small" tone="tertiary">{label}：</Text>
          <Text size="small" weight="medium">{value}</Text>
        </Row>
      ))}
    </Row>
  );
}

// ─── 验证指标卡片 ─────────────────────────────────────────────────────────────
function ValidationResult() {
  const t = useT();
  return (
    <Stack gap={12}>
      <Row gap={8} align="center">
        <div style={{ width: 3, height: 16, background: t.buttonPrimaryBackground, borderRadius: 2 }} />
        <Text weight="semibold">Validation 集评估结果</Text>
        <Pill tone="positive">已完成</Pill>
        <Spacer />
        <Text size="small" tone="tertiary">2026-06-17 10:32:41</Text>
      </Row>
      <Grid columns={3} gap={12}>
        <Stat label="AUC" value="0.847" tone="positive" />
        <Stat label="KS" value="0.531" tone="positive" />
        <Stat label="F1" value="0.762" />
      </Grid>
      <Callout tone="info" title="仅展示 Validation 指标">
        Train 集指标不对外展示，避免过拟合导致业务方对模型效果产生误判。
      </Callout>
    </Stack>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function BaiqingRedesign() {
  const t = useT();
  const [ratio, setRatio] = useState(0.2);
  const [trained, setTrained] = useState(false);
  const [training, setTraining] = useState(false);

  function handleTrain() {
    setTraining(true);
    setTrained(false);
    setTimeout(() => { setTraining(false); setTrained(true); }, 1800);
  }

  return (
    <Stack gap={24} style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>

      {/* 顶部标题 */}
      <Row gap={12} align="center">
        <H1 style={{ fontSize: 20 }}>百擎平台 UI 改版方案</H1>
        <Pill tone="warning">基于 2026-06-17 会议决议</Pill>
      </Row>

      {/* ── 一、流程变更对比 ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader title="一、流程变更对比" />
        <CardBody>
          <Grid columns={2} gap={24}>
            {/* 改版前 */}
            <Stack gap={10}>
              <Row gap={8} align="center">
                <Text weight="semibold" tone="secondary">改版前</Text>
                <Pill tone="danger">问题</Pill>
              </Row>
              <Stack gap={6}>
                <Step n={1} label="模型训练页：填写复杂度 + 选样本" />
                <Step n={2} label="跳转到「模型验证」页：再选模型 + 样本" />
                <Step n={3} label="查看结果：Train + Validation 指标混排" />
              </Stack>
              <Callout tone="danger" title="核心痛点">
                操作路径分散 3 个页面；Train 指标误导业务判断；用户反馈「太杂了」。
              </Callout>
            </Stack>

            {/* 改版后 */}
            <Stack gap={10}>
              <Row gap={8} align="center">
                <Text weight="semibold">改版后</Text>
                <Pill tone="positive">目标</Pill>
              </Row>
              <Stack gap={6}>
                <Step n={1} label="模型训练页：复杂度 + 样本 + 验证集比例" active />
                <Step n={2} label="点击「开始训练」，在当前页等待完成" active />
                <Step n={3} label="原地展示 Validation 指标（无需跳转）" active />
              </Stack>
              <Callout tone="positive" title="改进效果">
                合并训练 + 验证为一页；移除 Train 指标；用户一步完成配置并看到结果。
              </Callout>
            </Stack>
          </Grid>
        </CardBody>
      </Card>

      {/* ── 二、模型训练页改版原型 ───────────────────────────────────────────── */}
      <Stack gap={12}>
        <Row gap={10} align="center">
          <H2 style={{ fontSize: 16 }}>二、模型训练页（改版后原型）</H2>
          <Text size="small" tone="tertiary">可点击交互</Text>
        </Row>

        {/* 面包屑 */}
        <Row gap={6} align="center">
          <Text size="small" tone="tertiary">项目管理</Text>
          <Text size="small" tone="tertiary">›</Text>
          <Text size="small" tone="tertiary">612测试</Text>
          <Text size="small" tone="tertiary">›</Text>
          <Text size="small" tone="tertiary">模型管理</Text>
          <Text size="small" tone="tertiary">›</Text>
          <Text size="small" tone="tertiary">0615-2</Text>
          <Text size="small" tone="tertiary">›</Text>
          <Text size="small" weight="medium">模型训练</Text>
        </Row>

        <Card>
          <CardHeader title="模型训练" />
          <CardBody>
            <Stack gap={20}>

              {/* 表单区 */}
              <Grid columns="1fr 1fr" gap={20}>
                {/* 模型复杂度 */}
                <Stack gap={6}>
                  <Text size="small" weight="medium">模型复杂度</Text>
                  <div style={{
                    border: `1px solid ${t.strokeSecondary}`, borderRadius: 6,
                    padding: "7px 12px", fontSize: 13, color: t.textPrimary,
                    background: t.surfaceSecondary,
                  }}>
                    复杂（N=4）
                  </div>
                  <Text size="small" tone="tertiary">N=1 简单 · N=4 复杂，值越大结果越稳定</Text>
                </Stack>

                {/* 选择样本 */}
                <Stack gap={6}>
                  <Text size="small" weight="medium">选择样本</Text>
                  <div style={{
                    border: `1px solid ${t.strokeSecondary}`, borderRadius: 6,
                    padding: "7px 12px", fontSize: 13, color: t.textPrimary,
                    background: t.surfaceSecondary,
                  }}>
                    rs_1_300v_sample.csv（MF_86666666…）
                  </div>
                  <MetaRow items={[
                    { label: "Y标签字段", value: "flagy" },
                    { label: "样本数量", value: "11,655" },
                    { label: "特征数量", value: "300" },
                  ]} />
                </Stack>
              </Grid>

              <Divider />

              {/* 验证集比例 —— 新增 */}
              <Stack gap={10}>
                <Row gap={8} align="center">
                  <Text weight="medium">验证集比例</Text>
                  <Pill tone="positive" size="sm">新增</Pill>
                </Row>
                <RatioSlider value={ratio} onChange={setRatio} />
              </Stack>

              <Divider />

              {/* 操作按钮 */}
              <Row gap={12} align="center">
                <Button variant="primary" onClick={handleTrain}>
                  {training ? "训练中…" : "▶  开始训练"}
                </Button>
                {trained && !training && (
                  <Pill tone="positive">训练完成</Pill>
                )}
                {training && (
                  <Text size="small" tone="tertiary">模型训练中，通常需要 30s～2min…</Text>
                )}
              </Row>

              {/* 训练结果 —— 训练完成后原地展示 */}
              {trained && ratio > 0 && (
                <>
                  <Divider />
                  <ValidationResult />
                </>
              )}

              {trained && ratio === 0 && (
                <>
                  <Divider />
                  <Callout tone="info" title="全量训练完成">
                    验证集比例为 0，不输出评估指标。模型已保存，可前往「在线推理」使用。
                  </Callout>
                </>
              )}
            </Stack>
          </CardBody>
        </Card>
      </Stack>

      {/* ── 三、关键改动汇总 ─────────────────────────────────────────────────── */}
      <Stack gap={10}>
        <H2 style={{ fontSize: 16 }}>三、关键改动汇总</H2>
        <Table
          headers={["改动点", "改版前", "改版后", "优先级"]}
          rows={[
            ["Train 指标展示", "展示 Train + Validation 混排", "仅展示 Validation 指标", "P0"],
            ["验证集比例配置", "无", "新增滑块，范围 0～0.5，默认 0.2", "P0"],
            ["页面跳转路径", "训练页 → 验证页 → 结果页（3步）", "训练配置 + 结果在同一页", "P1"],
            ["比例=0 时行为", "—", "全量训练，不输出指标，文案明确说明", "P1"],
            ["模型验证页", "独立页面", "保留，用于事后追加验证集评估", "P2"],
          ]}
          rowTone={["danger", "danger", "warning", "warning", "neutral"]}
          columnAlign={["left", "left", "left", "center"]}
        />
      </Stack>

      {/* ── 四、待对齐事项 ───────────────────────────────────────────────────── */}
      <Callout tone="warning" title="待与研发对齐的点">
        1. 验证集比例默认值定为 0.2，还是由用户上次使用值记忆？
        2. 比例=0 的「全量训练」是否需要二次确认弹窗（防误操作）？
        3. 「模型验证」独立页是否保留，还是完全合并到训练页的结果区？
      </Callout>

    </Stack>
  );
}
