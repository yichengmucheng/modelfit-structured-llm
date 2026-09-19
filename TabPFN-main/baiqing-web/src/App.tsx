import {
  Stack, Row, Grid, Card, CardHeader, CardBody,
  H2, H3, Text, Button, Divider, Spacer,
  Pill, Callout, Stat, Table, useHostTheme,
} from "cursor/canvas";
import { useState } from "react";

const ACCENT = "#4F6AF5";       // 百擎品牌蓝（原页面截图取色）
const ACCENT_LIGHT = "#EEF1FE"; // 蓝色浅底
const ACCENT_TEXT = "#FFFFFF";
const STEP_DONE = "#22C55E";
const GRAY_BG = "#F5F6FA";
const GRAY_BORDER = "#E4E7ED";
const GRAY_TEXT = "#909399";
const DARK_TEXT = "#1D2129";

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav }: { active: string; onNav: (key: string) => void }) {
  const items = [
    { key: "dash",   label: "工作台",  icon: "⊞" },
    { key: "model",  label: "模型管理", icon: "◈" },
    { key: "sample", label: "样本管理", icon: "⊟" },
  ];
  return (
    <div style={{
      width: 188, minHeight: 640, background: "#fff",
      borderRight: `1px solid ${GRAY_BORDER}`,
      display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${GRAY_BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: ACCENT, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 14 }}>B</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: DARK_TEXT }}>百融百擎</span>
        </div>
      </div>
      <div style={{ flex: 1, padding: "10px 8px" }}>
        {items.map(item => {
          const isActive = item.key === active;
          return (
            <div key={item.key} onClick={() => onNav(item.key)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 10px", borderRadius: 6, marginBottom: 2,
              background: isActive ? ACCENT_LIGHT : "transparent",
              color: isActive ? ACCENT : GRAY_TEXT,
              fontSize: 13, fontWeight: isActive ? 600 : 400, cursor: "pointer",
            }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </div>
      <div style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY_BORDER}`,
        display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 14, background: ACCENT, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 600 }}>文</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: DARK_TEXT }}>文程</div>
          <div style={{ fontSize: 11, color: GRAY_TEXT }}>wencheng</div>
        </div>
      </div>
    </div>
  );
}

// ─── 工作台视图 ───────────────────────────────────────────────────────────────
function Dashboard({ onNav, onNewModel }: { onNav: (k: string) => void; onNewModel: () => void }) {
  const stats = [
    { label: "项目总数",   value: "2",  sub: "本月 +1",   color: ACCENT },
    { label: "模型总数",   value: "4",  sub: "本月 +2",   color: ACCENT },
    { label: "已上线模型", value: "1",  sub: "本月 +1",   color: "#16A34A" },
    { label: "训练中模型", value: "0",  sub: "当前空闲",  color: GRAY_TEXT },
  ];
  const recentModels = [
    { name: "0615-2",  version: "M1.00",    project: "612test",  status: "已训练", creator: "huqi",     time: "2026-06-15 18:30" },
    { name: "612",     version: "M1.00",    project: "612test",  status: "已训练", creator: "wencheng",  time: "2026-06-15 11:13" },
    { name: "615",     version: "M1.0_简单", project: "612test", status: "已上线", creator: "wencheng",  time: "2026-06-15 09:55" },
    { name: "carv1",   version: "M1.00",    project: "车贷Q2基线", status: "已训练", creator: "huqi",   time: "2026-06-10 10:22" },
  ];
  const shortcuts = [
    { icon: "＋", title: "新建模型", desc: "在已有项目下快速新建一个模型", action: onNewModel },
    { icon: "↑", title: "上传样本", desc: "支持 .csv 格式，大规模数据集上传", action: () => onNav("sample") },
    { icon: "◎", title: "查看已上线模型", desc: "快速进入已上线模型的验证推理页", action: () => onNav("model") },
  ];

  return (
    <div>
      <div style={{ marginBottom: 4, fontSize: 18, fontWeight: 700, color: DARK_TEXT }}>工作台概览</div>
      <div style={{ fontSize: 12, color: GRAY_TEXT, marginBottom: 20 }}>
        欢迎回来，以下是您在百擎 ModelFit 平台的最新动态和系统状态。
      </div>

      {/* 统计卡片 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 8,
            border: `1px solid ${GRAY_BORDER}`, padding: "16px 18px" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: DARK_TEXT, marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: GRAY_TEXT, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* 快捷操作 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {shortcuts.map(sc => (
          <div key={sc.title} onClick={sc.action} style={{
            background: "#fff", borderRadius: 8, border: `1px solid ${GRAY_BORDER}`,
            padding: "20px 22px", cursor: "pointer",
            display: "flex", alignItems: "flex-start", gap: 14,
          }}
            onMouseEnter={(e: any) => e.currentTarget.style.borderColor = ACCENT}
            onMouseLeave={(e: any) => e.currentTarget.style.borderColor = GRAY_BORDER}
          >
            <div style={{ width: 36, height: 36, background: ACCENT_LIGHT, borderRadius: 8, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color: ACCENT, fontWeight: 700 }}>{sc.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: DARK_TEXT, marginBottom: 4 }}>
                {sc.title} <span style={{ fontSize: 12, color: ACCENT }}>→</span>
              </div>
              <div style={{ fontSize: 12, color: GRAY_TEXT }}>{sc.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 近期模型动态 */}
      <div style={{ background: "#fff", borderRadius: 8, border: `1px solid ${GRAY_BORDER}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY_BORDER}`,
          fontSize: 14, fontWeight: 600, color: DARK_TEXT }}>近期模型动态</div>
        {/* 表头 */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.2fr 0.8fr 1fr 1.2fr",
          padding: "8px 20px", background: GRAY_BG,
          fontSize: 12, fontWeight: 600, color: GRAY_TEXT,
          borderBottom: `1px solid ${GRAY_BORDER}` }}>
          {["模型名称/版本", "所属项目", "状态", "创建人", "开始时间", "操作"].map(h => (
            <span key={h}>{h}</span>
          ))}
        </div>
        {recentModels.map((m, idx) => (
          <div key={m.name} style={{
            display: "grid", gridTemplateColumns: "1.2fr 1fr 1.2fr 0.8fr 1fr 1.2fr",
            padding: "10px 20px", fontSize: 12,
            background: idx % 2 === 0 ? "#fff" : "#FAFBFC",
            borderBottom: idx < recentModels.length - 1 ? `1px solid ${GRAY_BORDER}` : "none",
            alignItems: "center",
          }}>
            <span style={{ color: DARK_TEXT, fontWeight: 500 }}>{m.name} <span style={{ color: GRAY_TEXT, fontWeight: 400 }}>/ {m.version}</span></span>
            <span style={{ color: GRAY_TEXT }}>{m.project}</span>
            <span><StatusPill status={m.status} /></span>
            <span style={{ color: GRAY_TEXT }}>{m.creator}</span>
            <span style={{ color: GRAY_TEXT }}>{m.time}</span>
            <span style={{ color: ACCENT, cursor: "pointer" }} onClick={onNewModel}>进入训练流程 →</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 步骤指示器 ──────────────────────────────────────────────────────────────
// isNewModel=true: 顺序锁定（新建流程），只能往回点
// isNewModel=false: 自由跳转（已有模型），所有步骤均可点
function Stepper({ current, isNewModel, onStep }: {
  current: number;
  isNewModel: boolean;
  onStep: (n: number) => void;
}) {
  const steps = ["上传样本", "模型训练", "验证推理", "发布"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        // 新建模式：只能点已完成或当前步；已有模式：全部可点
        const clickable = isNewModel ? idx <= current : true;
        return (
          <div key={idx} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                onClick={() => clickable && onStep(idx)}
                title={!clickable ? "请先完成上一步" : undefined}
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  background: done ? STEP_DONE : active ? ACCENT : GRAY_BG,
                  border: `2px solid ${done ? STEP_DONE : active ? ACCENT : GRAY_BORDER}`,
                  color: done || active ? "#fff" : GRAY_TEXT,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700,
                  cursor: clickable ? "pointer" : "not-allowed",
                  transition: "transform 0.1s",
                }}
                onMouseEnter={(e: any) => { if (clickable) e.currentTarget.style.transform = "scale(1.1)"; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                {done ? "✓" : idx}
              </div>
              <span
                onClick={() => clickable && onStep(idx)}
                style={{
                  fontSize: 12, fontWeight: active ? 600 : 400,
                  color: active ? ACCENT : done ? STEP_DONE : GRAY_TEXT,
                  whiteSpace: "nowrap",
                  cursor: clickable ? "pointer" : "default",
                }}
              >{label}</span>
            </div>
            {i < 3 && (
              <div style={{
                flex: 1, height: 2, margin: "-18px 8px 0",
                background: done ? STEP_DONE : GRAY_BORDER,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── 比例选择 ────────────────────────────────────────────────────────────────
function RatioPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const opts = [
    { v: 0, label: "0  全量" },
    { v: 0.1, label: "0.1" },
    { v: 0.2, label: "0.2" },
    { v: 0.3, label: "0.3" },
    { v: 0.4, label: "0.4" },
    { v: 0.5, label: "0.5" },
  ];
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {opts.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)} style={{
          padding: "4px 12px", borderRadius: 4, fontSize: 12, cursor: "pointer",
          border: `1px solid ${value === o.v ? ACCENT : GRAY_BORDER}`,
          background: value === o.v ? ACCENT_LIGHT : "#fff",
          color: value === o.v ? ACCENT : GRAY_TEXT,
          fontWeight: value === o.v ? 600 : 400,
        }}>{o.label}</button>
      ))}
    </div>
  );
}

// ─── 表单字段行 ──────────────────────────────────────────────────────────────
function FieldRow({ label, required, children, hint }: {
  label: string; required?: boolean; children: any; hint?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "10px 0" }}>
      <div style={{ width: 110, paddingTop: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 13, color: DARK_TEXT }}>
          {required && <span style={{ color: "#F56C6C", marginRight: 3 }}>*</span>}
          {label}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        {children}
        {hint && <div style={{ fontSize: 12, color: GRAY_TEXT, marginTop: 4 }}>{hint}</div>}
      </div>
    </div>
  );
}

function FakeSelect({ value }: { value: string }) {
  return (
    <div style={{
      border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, padding: "6px 10px",
      fontSize: 13, color: DARK_TEXT, background: "#fff",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <span>{value}</span>
      <span style={{ color: GRAY_TEXT, fontSize: 11 }}>▼</span>
    </div>
  );
}

function MetaTags({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
      {items.map(item => (
        <span key={item} style={{ fontSize: 12, color: GRAY_TEXT }}>{item}</span>
      ))}
    </div>
  );
}

// ─── Tab 切换 ─────────────────────────────────────────────────────────────────
function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 20px", borderRadius: 0, fontSize: 13, cursor: "pointer",
      background: "transparent", border: "none",
      borderBottom: active ? `2px solid ${ACCENT}` : "2px solid transparent",
      color: active ? ACCENT : GRAY_TEXT, fontWeight: active ? 600 : 400,
    }}>{label}</button>
  );
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────
// ─── 数据 ──────────────────────────────────────────────────────────────────
const PROJECT_LIST = [
  { name: "612test", scene: "信贷风控", status: "已投产", modelCount: 3, owner: "wencheng", updatedAt: "2026-06-12 16:32:09" },
  { name: "车贷Q2基线", scene: "车贷风控", status: "进行中", modelCount: 1, owner: "huqi", updatedAt: "2026-06-10 09:15:44" },
];

const MODEL_LIST: Record<string, {name:string;enName:string;version:string;status:string;owner:string;updater:string;updatedAt:string;}[]> = {
  "612test": [
    { name: "615", enName: "chelianglipei", version: "M1.0_简单", status: "已上线", owner: "wencheng", updater: "wencheng", updatedAt: "2026-06-15 19:55:03" },
    { name: "0615-2", enName: "06152", version: "M1.00", status: "已训练", owner: "huqi", updater: "-", updatedAt: "2026-06-15 18:30:56" },
    { name: "612", enName: "612", version: "M1.00", status: "已训练", owner: "wencheng", updater: "-", updatedAt: "2026-06-15 11:13:29" },
  ],
  "车贷Q2基线": [
    { name: "carv1", enName: "car_risk_v1", version: "M1.00", status: "已训练", owner: "huqi", updater: "-", updatedAt: "2026-06-10 10:22:11" },
  ],
};

// ─── StatusPill ────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, {bg:string;color:string}> = {
    "已上线":  { bg: "#DCFCE7", color: "#16A34A" },
    "已投产":  { bg: "#DCFCE7", color: "#16A34A" },
    "已训练":  { bg: "#E0EDFF", color: "#2563EB" },
    "进行中":  { bg: "#FEF9C3", color: "#B45309" },
  };
  const s = cfg[status] ?? { bg: GRAY_BG, color: GRAY_TEXT };
  return (
    <span style={{
      fontSize: 11, padding: "2px 10px", borderRadius: 10, fontWeight: 500,
      background: s.bg, color: s.color,
    }}>{status}</span>
  );
}

// ─── 面包屑 ────────────────────────────────────────────────────────────────
function Crumb({ items }: { items: {label:string; onClick?:()=>void}[] }) {
  return (
    <div style={{ fontSize: 12, color: GRAY_TEXT, marginBottom: 16, display: "flex", alignItems: "center", gap: 4 }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {i > 0 && <span style={{ color: GRAY_TEXT }}>&rsaquo;</span>}
          <span
            onClick={item.onClick}
            style={{ color: item.onClick ? ACCENT : DARK_TEXT, fontWeight: item.onClick ? 400 : 500,
              cursor: item.onClick ? "pointer" : "default" }}
          >{item.label}</span>
        </span>
      ))}
    </div>
  );
}

// ─── 样本库数据 ───────────────────────────────────────────────────────────────
const SAMPLE_LIBRARY = [
  { id: "MF_0616111108_3866", name: "train_lci_3.xlsx",           type: "训练样本", rows: 974,   cols: 17,  usedBy: 1, label: "无标",   uploadedBy: "素晶晶", uploadedAt: "2026-06-16 11:11" },
  { id: "MF_0616102407_2739", name: "yz0616rs_1_300v_sample.xlsx",type: "训练样本", rows: 11655, cols: 299, usedBy: 0, label: "无标",   uploadedBy: "huqi",  uploadedAt: "2026-06-16 10:24" },
  { id: "MF_0616101845_5810", name: "0618train2_1.xlsx",          type: "训练样本", rows: 697,   cols: 6,   usedBy: 1, label: "无标",   uploadedBy: "huqi",  uploadedAt: "2026-06-16 10:18" },
  { id: "MF_0615193409_0501", name: "baiqing_verify_open_v2.csv", type: "验证样本", rows: 150,   cols: 33,  usedBy: 0, label: "—",      uploadedBy: "文程",  uploadedAt: "2026-06-15 19:34" },
  { id: "MF_0615182501_7719", name: "train2_1.xlsx",              type: "训练样本", rows: 700,   cols: 6,   usedBy: 1, label: "无标",   uploadedBy: "huqi",  uploadedAt: "2026-06-15 18:25" },
  { id: "MF_0615182444_6915", name: "rs_1_300v_sample.csv",       type: "训练样本", rows: 11655, cols: 300, usedBy: 2, label: "无标",   uploadedBy: "huqi",  uploadedAt: "2026-06-15 18:24" },
];

function Step1Sample({ uploaded, uploading, doUpload, onNext }: {
  uploaded: boolean; uploading: boolean;
  doUpload: () => void; onNext: () => void;
}) {
  const [mode, setMode] = useState<"upload" | "library">("upload");
  const [selected, setSelected] = useState<string>("");

  return (
    <div style={{ background: "#fff", borderRadius: 8, border: `1px solid ${GRAY_BORDER}`, padding: "24px 28px" }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: DARK_TEXT, marginBottom: 4 }}>选择训练样本</div>
      <div style={{ fontSize: 13, color: GRAY_TEXT, marginBottom: 20 }}>
        可上传新文件，也可从样本库中选取已有样本。
      </div>

      {/* 模式切换 */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20,
        border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, overflow: "hidden", width: "fit-content" }}>
        {[
          { key: "upload",  label: "上传新文件" },
          { key: "library", label: "从样本库选择" },
        ].map(m => (
          <button key={m.key} onClick={() => setMode(m.key as any)} style={{
            padding: "7px 20px", fontSize: 13, cursor: "pointer", border: "none",
            background: mode === m.key ? ACCENT : "#fff",
            color: mode === m.key ? "#fff" : GRAY_TEXT,
            fontWeight: mode === m.key ? 600 : 400,
          }}>{m.label}</button>
        ))}
      </div>

      {/* ── 上传新文件 ── */}
      {mode === "upload" && (
        <div>
          <FieldRow label="样本名称" required>
            <input placeholder="如 credit_train_0615" style={{
              border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, padding: "6px 10px",
              fontSize: 13, width: "100%", color: DARK_TEXT, outline: "none", boxSizing: "border-box",
            }} />
          </FieldRow>

          <FieldRow label="上传文件" required hint="支持 CSV / XLSX 格式，文件大小不超过 200MB">
            <div style={{
              border: `2px dashed ${GRAY_BORDER}`, borderRadius: 6,
              padding: "28px 0", textAlign: "center", background: GRAY_BG, cursor: "pointer",
            }}>
              {uploaded ? (
                <div>
                  <div style={{ fontSize: 24, color: STEP_DONE }}>✓</div>
                  <div style={{ fontSize: 13, color: DARK_TEXT, marginTop: 6, fontWeight: 500 }}>rs_1_300v_sample.csv</div>
                  <div style={{ fontSize: 12, color: GRAY_TEXT, marginTop: 4 }}>
                    11,655 行 &nbsp;|&nbsp; 301 列（300 特征 + 1 标签）&nbsp;|&nbsp; 4.2MB
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 28, color: GRAY_TEXT }}>↑</div>
                  <div style={{ fontSize: 13, color: GRAY_TEXT, marginTop: 6 }}>点击或拖拽文件到此处上传</div>
                </div>
              )}
            </div>
          </FieldRow>

          <FieldRow label="Y 标签列" required hint="选择样本中作为预测目标的列名">
            <FakeSelect value={uploaded ? "flagy" : "请先上传文件"} />
          </FieldRow>

          <Divider />

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
            <button onClick={doUpload} disabled={uploading} style={{
              padding: "8px 28px", borderRadius: 4, fontSize: 13, fontWeight: 600,
              background: uploading ? GRAY_BORDER : ACCENT, color: uploading ? GRAY_TEXT : "#fff",
              border: "none", cursor: uploading ? "not-allowed" : "pointer",
            }}>
              {uploading ? "上传中…" : uploaded ? "重新上传" : "上传样本"}
            </button>
            {uploading && <span style={{ fontSize: 12, color: GRAY_TEXT }}>正在解析文件…</span>}
            {uploaded && !uploading && <span style={{ fontSize: 12, color: STEP_DONE, fontWeight: 500 }}>✓ 上传成功</span>}
          </div>

          {uploaded && (
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={onNext} style={{
                padding: "8px 28px", borderRadius: 4, fontSize: 13, fontWeight: 600,
                background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
              }}>下一步：模型训练 →</button>
            </div>
          )}
        </div>
      )}

      {/* ── 从样本库选择 ── */}
      {mode === "library" && (
        <div>
          {/* 筛选行 */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8,
              border: `1px solid ${GRAY_BORDER}`, borderRadius: 4,
              padding: "5px 10px", background: "#fff", width: 200, fontSize: 13, color: GRAY_TEXT }}>
              ⌕ 搜索样本名称...
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6,
              border: `1px solid ${GRAY_BORDER}`, borderRadius: 4,
              padding: "5px 12px", background: "#fff", fontSize: 13, color: GRAY_TEXT }}>
              样本类型：全部 <span style={{ fontSize: 10 }}>▼</span>
            </div>
          </div>

          {/* 样本表格 */}
          <div style={{ border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, overflow: "hidden" }}>
            {/* 表头 */}
            <div style={{ display: "grid", gridTemplateColumns: "32px 2fr 0.8fr 0.6fr 0.6fr 0.6fr 1.2fr",
              padding: "8px 14px", background: GRAY_BG, borderBottom: `1px solid ${GRAY_BORDER}`,
              fontSize: 12, fontWeight: 600, color: GRAY_TEXT }}>
              <span></span>
              <span>样本文件名称</span>
              <span>类型</span>
              <span>样本数量</span>
              <span>特征数量</span>
              <span>已使用</span>
              <span>上传人 / 时间</span>
            </div>
            {/* 数据行 */}
            {SAMPLE_LIBRARY.filter(s => s.type === "训练样本").map((s, idx) => (
              <div key={s.id}
                onClick={() => setSelected(s.id)}
                style={{
                  display: "grid", gridTemplateColumns: "32px 2fr 0.8fr 0.6fr 0.6fr 0.6fr 1.2fr",
                  padding: "9px 14px", fontSize: 12, cursor: "pointer",
                  background: selected === s.id ? ACCENT_LIGHT : idx % 2 === 0 ? "#fff" : "#FAFBFC",
                  borderBottom: idx < 4 ? `1px solid ${GRAY_BORDER}` : "none",
                  alignItems: "center",
                  borderLeft: selected === s.id ? `3px solid ${ACCENT}` : "3px solid transparent",
                }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 8,
                  border: `2px solid ${selected === s.id ? ACCENT : GRAY_BORDER}`,
                  background: selected === s.id ? ACCENT : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {selected === s.id && <div style={{ width: 6, height: 6, borderRadius: 3, background: "#fff" }} />}
                </div>
                <span style={{ color: selected === s.id ? ACCENT : DARK_TEXT, fontWeight: selected === s.id ? 500 : 400 }}>{s.name}</span>
                <span style={{ color: GRAY_TEXT }}>{s.type}</span>
                <span style={{ color: DARK_TEXT }}>{s.rows.toLocaleString()}</span>
                <span style={{ color: DARK_TEXT }}>{s.cols}</span>
                <span style={{ color: GRAY_TEXT }}>{s.usedBy} 次</span>
                <span style={{ color: GRAY_TEXT }}>{s.uploadedBy} / {s.uploadedAt}</span>
              </div>
            ))}
          </div>

          {selected && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: ACCENT_LIGHT,
              borderRadius: 6, border: `1px solid ${ACCENT}`, fontSize: 12,
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: ACCENT, fontWeight: 500 }}>
                已选：{SAMPLE_LIBRARY.find(s => s.id === selected)?.name}
              </span>
              <span style={{ color: GRAY_TEXT }}>
                {SAMPLE_LIBRARY.find(s => s.id === selected)?.rows.toLocaleString()} 行 &nbsp;|&nbsp;
                {SAMPLE_LIBRARY.find(s => s.id === selected)?.cols} 特征
              </span>
            </div>
          )}

          <FieldRow label="Y 标签列" required hint="确认样本中的目标列名">
            <FakeSelect value={selected ? "flagy" : "请先选择样本"} />
          </FieldRow>

          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onNext} disabled={!selected} style={{
              padding: "8px 28px", borderRadius: 4, fontSize: 13, fontWeight: 600,
              background: selected ? ACCENT : GRAY_BORDER, color: selected ? "#fff" : GRAY_TEXT,
              border: "none", cursor: selected ? "pointer" : "not-allowed",
            }}>下一步：模型训练 →</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BaiqingNewFlow() {
  const [navItem, setNavItem] = useState<"dash" | "model" | "sample">("dash");
  // view: "projects" | "models" | "create" | "steps"
  const [view, setView] = useState<"projects" | "models" | "create" | "steps">("projects");
  const [currentProject, setCurrentProject] = useState("612test");

  // isNewModel: true=新建流程(顺序锁定) / false=已有模型(自由跳转)
  const [isNewModel, setIsNewModel] = useState(true);

  function goNav(key: string) {
    setNavItem(key as any);
    if (key === "model") setView("projects");
  }
  function goNewModel() {
    setIsNewModel(true);
    setNavItem("model");
    setView("create");
    setStep(1);
  }
  // 点击已有模型，进入自由导航模式
  function enterExistingModel(startStep: number, opts?: { trained?: boolean; uploaded?: boolean; tab?: "val" | "infer" }) {
    setIsNewModel(false);
    setNavItem("model");
    setView("steps");
    setStep(startStep);
    // 已有模型默认样本已上传、训练已完成（模拟历史数据）
    setUploaded(opts?.uploaded ?? true);
    setTrained(opts?.trained ?? true);
    setValidated(false);
    setInferred(false);
    setPublished(false);
    if (opts?.tab) setTab(opts.tab);
  }
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [training, setTraining] = useState(false);
  const [trained, setTrained] = useState(false);
  const [ratio, setRatio] = useState(0.2);
  const [tab, setTab] = useState<"val" | "infer">("val");
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [inferring, setInferring] = useState(false);
  const [inferred, setInferred] = useState(false);
  const [published, setPublished] = useState(false);

  function doUpload() {
    setUploading(true); setUploaded(false);
    setTimeout(() => { setUploading(false); setUploaded(true); }, 1500);
  }
  function doTrain() {
    setTraining(true); setTrained(false);
    setTimeout(() => { setTraining(false); setTrained(true); }, 1800);
  }
  function doValidate() {
    setValidating(true); setValidated(false);
    setTimeout(() => { setValidating(false); setValidated(true); }, 1500);
  }
  function doInfer() {
    setInferring(true); setInferred(false);
    setTimeout(() => { setInferring(false); setInferred(true); }, 1200);
  }
  function doPublish() { setPublished(true); }

  return (
    <div style={{ display: "flex", height: "auto", background: GRAY_BG, fontFamily: "system-ui, sans-serif" }}>
      <Sidebar active={navItem} onNav={goNav} />

      {/* 主内容区 */}
      <div style={{ flex: 1, padding: 24, minWidth: 0 }}>

        {/* 顶部标注 */}
        <div style={{ marginBottom: 16, padding: "8px 14px", background: "#FFF7E6",
          border: "1px solid #FFD591", borderRadius: 6, fontSize: 12, color: "#B7720A" }}>
          改版说明：工作台可快捷跳转各模块；模型管理按项目层级组织；四步引导式训练流程
        </div>

        {/* 工作台 */}
        {navItem === "dash" && (
          <Dashboard onNav={goNav} onNewModel={goNewModel} />
        )}

        {/* 样本管理占位 */}
        {navItem === "sample" && (
          <div style={{ background: "#fff", borderRadius: 8, border: `1px solid ${GRAY_BORDER}`, padding: 32 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: DARK_TEXT, marginBottom: 8 }}>样本管理</div>
            <div style={{ fontSize: 13, color: GRAY_TEXT }}>此模块保持原有功能不变。</div>
          </div>
        )}

        {/* 模型管理各视图 */}
        {/* ══════════════════════════════════════════════════════════════════
            视图零：项目列表（默认落地页）
        ══════════════════════════════════════════════════════════════════ */}
        {navItem === "model" && view === "projects" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: DARK_TEXT }}>项目列表</div>
                <div style={{ fontSize: 12, color: GRAY_TEXT, marginTop: 4 }}>管理并追踪您名下所有模型研发项目。</div>
              </div>
              <button style={{
                padding: "8px 20px", borderRadius: 4, fontSize: 13, fontWeight: 600,
                background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
              }}>+ 新建项目</button>
            </div>

            {/* 搜索 + 筛选 */}
            <div style={{ display: "flex", gap: 10, margin: "16px 0" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                border: `1px solid ${GRAY_BORDER}`, borderRadius: 4,
                padding: "6px 12px", background: "#fff", width: 200,
              }}>
                <span style={{ color: GRAY_TEXT, fontSize: 14 }}>⌕</span>
                <span style={{ fontSize: 13, color: GRAY_TEXT }}>搜索项目名/负责人...</span>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                border: `1px solid ${GRAY_BORDER}`, borderRadius: 4,
                padding: "6px 12px", background: "#fff", fontSize: 13, color: GRAY_TEXT,
              }}>
                业务场景：全部 <span style={{ fontSize: 10 }}>▼</span>
              </div>
            </div>

            {/* 项目卡片 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PROJECT_LIST.map(p => (
                <div key={p.name} onClick={() => { setCurrentProject(p.name); setView("models"); }}
                  style={{ background: "#fff", borderRadius: 8, border: `1px solid ${GRAY_BORDER}`,
                    padding: "18px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 40, height: 40, background: ACCENT_LIGHT, borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, color: ACCENT, flexShrink: 0 }}>P</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: DARK_TEXT }}>{p.name}</span>
                      <StatusPill status={p.status} />
                    </div>
                    <div style={{ display: "flex", gap: 24, fontSize: 12 }}>
                      <span style={{ color: GRAY_TEXT }}>业务场景：<span style={{ color: DARK_TEXT }}>{p.scene}</span></span>
                      <span style={{ color: GRAY_TEXT }}>模型总数：<span style={{ color: DARK_TEXT }}>{p.modelCount} 个</span></span>
                      <span style={{ color: GRAY_TEXT }}>负责人：<span style={{ color: DARK_TEXT }}>{p.owner}</span></span>
                      <span style={{ color: GRAY_TEXT }}>最后更新：<span style={{ color: DARK_TEXT }}>{p.updatedAt}</span></span>
                    </div>
                  </div>
                  <span style={{ color: GRAY_TEXT, fontSize: 18 }}>&rsaquo;</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, textAlign: "right", fontSize: 12, color: GRAY_TEXT }}>
              共 {PROJECT_LIST.length} 条
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            视图一：项目内模型列表
        ══════════════════════════════════════════════════════════════════ */}
        {navItem === "model" && view === "models" && (
          <div>
            <Crumb items={[
              { label: "项目列表", onClick: () => setView("projects") },
              { label: currentProject },
            ]} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: DARK_TEXT }}>模型列表</span>
              <button onClick={() => setView("create")} style={{
                padding: "8px 20px", borderRadius: 4, fontSize: 13, fontWeight: 600,
                background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
              }}>+ 新建模型</button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                border: `1px solid ${GRAY_BORDER}`, borderRadius: 4,
                padding: "6px 12px", background: "#fff", width: 220,
              }}>
                <span style={{ color: GRAY_TEXT, fontSize: 14 }}>⌕</span>
                <span style={{ fontSize: 13, color: GRAY_TEXT }}>搜索模型名称...</span>
              </div>
            </div>

            {/* 模型卡片 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {(MODEL_LIST[currentProject] ?? []).map((m, i) => {
                const hasTrained = m.status === "已训练" || m.status === "已上线";
                return (
                  <div key={m.name}
                    style={{
                      background: "#fff", borderRadius: 8, border: `1px solid ${GRAY_BORDER}`,
                      padding: "16px 18px", transition: "border-color 0.15s",
                    }}
                    onMouseEnter={(e: any) => (e.currentTarget.style.borderColor = ACCENT)}
                    onMouseLeave={(e: any) => (e.currentTarget.style.borderColor = GRAY_BORDER)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, background: ACCENT_LIGHT, borderRadius: 6,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, color: ACCENT }}>M</div>
                      <div style={{ display: "flex", gap: 10 }}>
                        {["◎", i > 0 ? "✎" : "", "⧉", "✕"].filter(Boolean).map((icon, j) => (
                          <span key={j} style={{ fontSize: 14, color: GRAY_TEXT, cursor: "pointer" }}>{icon}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: DARK_TEXT, marginBottom: 6 }}>{m.name}</div>
                    <StatusPill status={m.status} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 0", marginTop: 12 }}>
                      {[["英文名", m.enName], ["版本号", m.version],
                        ["负责人", m.owner], ["更新人", m.updater],
                        ["最后更新", m.updatedAt, "full"]].map(([label, value, full]) => (
                        <div key={label} style={{ gridColumn: full ? "1 / -1" : undefined }}>
                          <div style={{ fontSize: 11, color: GRAY_TEXT }}>{label}</div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: DARK_TEXT }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* 快捷操作按钮区 */}
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${GRAY_BORDER}`,
                      display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {/* 进入流程（从 Step 1 开始，自由跳转模式） */}
                      <button
                        onClick={() => enterExistingModel(1, { uploaded: hasTrained, trained: hasTrained })}
                        style={{
                          flex: 1, padding: "5px 0", borderRadius: 4, fontSize: 11, fontWeight: 600,
                          background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
                        }}>进入流程</button>

                      {/* 查看训练结果（仅已训练/已上线模型） */}
                      {hasTrained && (
                        <button
                          onClick={() => enterExistingModel(2, { uploaded: true, trained: true })}
                          style={{
                            flex: 1, padding: "5px 0", borderRadius: 4, fontSize: 11, fontWeight: 500,
                            background: "#fff", color: ACCENT,
                            border: `1px solid ${ACCENT}`, cursor: "pointer",
                          }}>查看结果</button>
                      )}

                      {/* 直接跳到验证推理 */}
                      {hasTrained && (
                        <button
                          onClick={() => enterExistingModel(3, { uploaded: true, trained: true, tab: "infer" })}
                          style={{
                            width: "100%", padding: "5px 0", borderRadius: 4, fontSize: 11, fontWeight: 500,
                            background: ACCENT_LIGHT, color: ACCENT,
                            border: `1px solid ${ACCENT}`, cursor: "pointer",
                          }}>验证推理 →</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16, textAlign: "right", fontSize: 12, color: GRAY_TEXT }}>
              共 {(MODEL_LIST[currentProject] ?? []).length} 条
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            视图二：新建模型 — 填写基本信息
        ══════════════════════════════════════════════════════════════════ */}
        {navItem === "model" && view === "create" && (
          <div>
            <Crumb items={[
              { label: "项目列表", onClick: () => setView("projects") },
              { label: currentProject, onClick: () => setView("models") },
              { label: "新建模型" },
            ]} />

            <div style={{ background: "#fff", borderRadius: 8, border: `1px solid ${GRAY_BORDER}`, padding: "28px 32px", maxWidth: 580 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: DARK_TEXT, marginBottom: 4 }}>新建模型</div>
              <div style={{ fontSize: 13, color: GRAY_TEXT, marginBottom: 24 }}>填写模型基本信息后，进入训练引导流程</div>

              <Divider />

              <FieldRow label="模型中文名" required hint="用于列表展示，如：车辆理赔模型">
                <input placeholder="请输入模型中文名" style={{
                  border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, padding: "7px 10px",
                  fontSize: 13, width: "100%", color: DARK_TEXT, outline: "none", boxSizing: "border-box",
                }} />
              </FieldRow>

              <FieldRow label="模型英文名" required hint="小写字母+数字+下划线，如 credit_risk_v1">
                <input placeholder="请输入模型英文名" style={{
                  border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, padding: "7px 10px",
                  fontSize: 13, width: "100%", color: DARK_TEXT, outline: "none", boxSizing: "border-box",
                }} />
              </FieldRow>

              <FieldRow label="业务场景" required>
                <FakeSelect value="信贷风控（credit_risk）" />
              </FieldRow>

              <FieldRow label="模型复杂度" required hint="简单（N=1）速度快；复杂（N=4）结果更稳定，后续步骤可修改">
                <div style={{ display: "flex", gap: 8 }}>
                  {["简单（N=1）", "复杂（N=4）"].map((opt, i) => (
                    <div key={opt} style={{
                      padding: "6px 16px", borderRadius: 4, fontSize: 13,
                      border: `1px solid ${i === 1 ? ACCENT : GRAY_BORDER}`,
                      background: i === 1 ? ACCENT_LIGHT : "#fff",
                      color: i === 1 ? ACCENT : GRAY_TEXT,
                      cursor: "pointer", fontWeight: i === 1 ? 600 : 400,
                    }}>{opt}</div>
                  ))}
                </div>
              </FieldRow>

              <FieldRow label="负责人" required>
                <FakeSelect value="wencheng" />
              </FieldRow>

              <FieldRow label="备注说明">
                <textarea placeholder="选填，如：用于Q2信贷场景快速基线验证" rows={3} style={{
                  border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, padding: "7px 10px",
                  fontSize: 13, width: "100%", color: DARK_TEXT, outline: "none",
                  resize: "vertical", boxSizing: "border-box", fontFamily: "system-ui",
                }} />
              </FieldRow>

              <Divider />

              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button onClick={() => setView("models")} style={{
                  padding: "8px 20px", borderRadius: 4, fontSize: 13,
                  background: "#fff", color: GRAY_TEXT,
                  border: `1px solid ${GRAY_BORDER}`, cursor: "pointer",
                }}>取消</button>
                <button onClick={() => { setIsNewModel(true); setView("steps"); setStep(1); }} style={{
                  padding: "8px 28px", borderRadius: 4, fontSize: 13, fontWeight: 600,
                  background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
                }}>确定，进入训练流程 →</button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            视图三：四步引导流程
        ══════════════════════════════════════════════════════════════════ */}
        {navItem === "model" && view === "steps" && (
          <div>
            <Crumb items={[
              { label: "项目列表", onClick: () => setView("projects") },
              { label: currentProject, onClick: () => setView("models") },
              ...(isNewModel ? [{ label: "新建模型", onClick: () => setView("create") }] : []),
              { label: "训练引导" },
            ]} />

            {/* 步骤指示器：isNewModel=true 顺序锁定；false 自由点击 */}
            <Stepper current={step} isNewModel={isNewModel} onStep={setStep} />

        {/* ── Step 1 : 上传样本 ─────────────────────────────────────────── */}
        {step === 1 && (
          <Step1Sample
            uploaded={uploaded} uploading={uploading}
            doUpload={doUpload} onNext={() => setStep(2)}
          />
        )}

        {/* ── Step 2 : 模型训练 ─────────────────────────────────────────── */}
        {step === 2 && (
          <div style={{ background: "#fff", borderRadius: 8, border: `1px solid ${GRAY_BORDER}`, padding: "24px 28px" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: DARK_TEXT, marginBottom: 20 }}>模型训练</div>

            <Divider />

            <FieldRow label="模型复杂度" required hint="简单(N=1)速度快；复杂(N=4)结果更稳定">
              <FakeSelect value="复杂（N=4）" />
            </FieldRow>

            <FieldRow label="训练样本" required>
              <FakeSelect value="rs_1_300v_sample.csv（MF_86666666_20260615162444_6915）" />
              <MetaTags items={["Y 标签字段：flagy", "样本数量：11,655", "特征数量：300"]} />
            </FieldRow>

            <FieldRow label="验证集比例" required hint={
              ratio === 0 ? "全量训练，不输出评估指标（适合最终交付）"
                : `验证集 ${(ratio * 100).toFixed(0)}%，训练集 ${((1 - ratio) * 100).toFixed(0)}%，训练后展示 Test 集指标`
            }>
              <RatioPicker value={ratio} onChange={setRatio} />
            </FieldRow>

            <Divider />

            {/* 操作按钮 */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
              <button onClick={doTrain} disabled={training} style={{
                padding: "8px 28px", borderRadius: 4, fontSize: 13, fontWeight: 600,
                background: training ? GRAY_BORDER : ACCENT, color: training ? GRAY_TEXT : "#fff",
                border: "none", cursor: training ? "not-allowed" : "pointer",
              }}>
                {training ? "训练中…" : "▶ 开始训练"}
              </button>
              {training && <span style={{ fontSize: 12, color: GRAY_TEXT }}>模型训练中，通常需要 30s～2min…</span>}
              {trained && !training && (
                <span style={{ fontSize: 12, color: STEP_DONE, fontWeight: 500 }}>✓ 训练完成</span>
              )}
            </div>

            {/* 训练结果 - 仅 Test 指标 */}
            {trained && ratio > 0 && (
              <div style={{ marginTop: 20, padding: "16px 20px", background: GRAY_BG,
                borderRadius: 6, border: `1px solid ${GRAY_BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 3, height: 16, background: ACCENT, borderRadius: 2 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: DARK_TEXT }}>Test 集评估结果</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10,
                    background: "#DCFCE7", color: "#16A34A", fontWeight: 500 }}>已完成</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[{ label: "AUC", value: "0.847" }, { label: "KS", value: "0.531" }, { label: "F1", value: "0.762" }].map(m => (
                    <div key={m.label} style={{ background: "#fff", borderRadius: 6,
                      padding: "12px 16px", border: `1px solid ${GRAY_BORDER}`, textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: ACCENT }}>{m.value}</div>
                      <div style={{ fontSize: 12, color: GRAY_TEXT, marginTop: 4 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: GRAY_TEXT }}>
                  ℹ Train 集指标不对外展示，避免过拟合误导业务判断。
                </div>
              </div>
            )}

            {trained && ratio === 0 && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "#EFF6FF",
                border: "1px solid #BFDBFE", borderRadius: 6, fontSize: 12, color: "#1D4ED8" }}>
                全量训练完成，不输出评估指标。可继续进行下一步验证推理。
              </div>
            )}

            {/* 下一步 */}
            {trained && (
              <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
                <button onClick={() => setStep(1)} style={{
                  padding: "8px 20px", borderRadius: 4, fontSize: 13,
                  background: "#fff", color: GRAY_TEXT,
                  border: `1px solid ${GRAY_BORDER}`, cursor: "pointer",
                }}>← 上一步</button>
                <button onClick={() => setStep(3)} style={{
                  padding: "8px 28px", borderRadius: 4, fontSize: 13, fontWeight: 600,
                  background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
                }}>下一步：验证推理 →</button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3 : 验证推理 ─────────────────────────────────────────── */}
        {step === 3 && (
          <div style={{ background: "#fff", borderRadius: 8, border: `1px solid ${GRAY_BORDER}` }}>
            {/* Tab 头 */}
            <div style={{ display: "flex", borderBottom: `1px solid ${GRAY_BORDER}`, padding: "0 24px" }}>
              <Tab label="验证（有 Y 标签）" active={tab === "val"} onClick={() => setTab("val")} />
              <Tab label="推理（无 Y 标签）" active={tab === "infer"} onClick={() => setTab("infer")} />
            </div>

            <div style={{ padding: "24px 28px" }}>
              {/* 验证 Tab */}
              {tab === "val" && (
                <Stack gap={0}>
                  <div style={{ fontSize: 13, color: GRAY_TEXT, marginBottom: 16 }}>
                    上传带 Y 标签的样本，系统将输出模型在该样本上的评估指标（AUC / KS / F1）。
                  </div>

                  <FieldRow label="选择模型" required>
                    <FakeSelect value="0615-2（当前训练结果）" />
                  </FieldRow>
                  <FieldRow label="验证样本" required hint="必须包含 Y 标签列">
                    <FakeSelect value="baiqing_verify_open_v2.csv（MF_0615193409_0501）" />
                    <MetaTags items={["Y 标签字段：flagy", "样本数量：150", "特征数量：33"]} />
                  </FieldRow>

                  <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={doValidate} disabled={validating} style={{
                      padding: "8px 28px", borderRadius: 4, fontSize: 13, fontWeight: 600,
                      background: validating ? GRAY_BORDER : ACCENT, color: validating ? GRAY_TEXT : "#fff",
                      border: "none", cursor: validating ? "not-allowed" : "pointer",
                    }}>
                      {validating ? "验证中…" : "▶ 开始验证"}
                    </button>
                    {validated && <span style={{ fontSize: 12, color: STEP_DONE, fontWeight: 500 }}>✓ 验证完成</span>}
                  </div>

                  {validated && (
                    <div style={{ marginTop: 20, padding: "16px 20px", background: GRAY_BG,
                      borderRadius: 6, border: `1px solid ${GRAY_BORDER}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <div style={{ width: 3, height: 16, background: ACCENT, borderRadius: 2 }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: DARK_TEXT }}>验证集评估结果</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        {[{ label: "AUC", value: "0.831" }, { label: "KS", value: "0.514" }, { label: "F1", value: "0.748" }].map(m => (
                          <div key={m.label} style={{ background: "#fff", borderRadius: 6,
                            padding: "12px 16px", border: `1px solid ${GRAY_BORDER}`, textAlign: "center" }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: ACCENT }}>{m.value}</div>
                            <div style={{ fontSize: 12, color: GRAY_TEXT, marginTop: 4 }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Stack>
              )}

              {/* 推理 Tab */}
              {tab === "infer" && (
                <Stack gap={0}>
                  <div style={{ fontSize: 13, color: GRAY_TEXT, marginBottom: 16 }}>
                    输入待推理样本的特征值（无需 Y 标签），系统将输出违约概率与分值。
                  </div>

                  <FieldRow label="选择模型" required>
                    <FakeSelect value="0615-2（当前训练结果）" />
                  </FieldRow>
                  <FieldRow label="推理方式" required>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["单笔推理", "批量推理"].map((opt, i) => (
                        <div key={opt} style={{
                          padding: "6px 16px", borderRadius: 4, fontSize: 13,
                          border: `1px solid ${i === 0 ? ACCENT : GRAY_BORDER}`,
                          background: i === 0 ? ACCENT_LIGHT : "#fff",
                          color: i === 0 ? ACCENT : GRAY_TEXT,
                          cursor: "pointer", fontWeight: i === 0 ? 600 : 400,
                        }}>{opt}</div>
                      ))}
                    </div>
                  </FieldRow>

                  {/* 输入参数表格 */}
                  <FieldRow label="输入参数" required hint="字段自动从训练样本加载，逐行填写后点击开始推理">
                    <div style={{ border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, overflow: "hidden" }}>
                      {/* 表头 */}
                      <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr",
                        background: GRAY_BG, borderBottom: `1px solid ${GRAY_BORDER}`,
                        padding: "8px 12px", fontSize: 12, fontWeight: 600, color: GRAY_TEXT,
                      }}>
                        <span>字段名</span>
                        <span>输入值</span>
                      </div>
                      {/* 数据行：模拟训练样本全量特征字段 */}
                      <div style={{ maxHeight: 320, overflowY: "auto" }}>
                        {[
                          "age", "gender", "marital_status", "education_level", "employment_type",
                          "work_years", "monthly_income", "other_income", "city", "province",
                          "loan_amount", "loan_term", "loan_purpose", "credit_score", "overdue_times_6m",
                          "overdue_times_12m", "overdue_amount", "card_count", "loan_count_active",
                          "loan_count_history", "query_count_1m", "query_count_3m", "query_count_6m",
                          "house_ownership", "car_ownership", "family_members", "children_count",
                          "monthly_repayment", "debt_ratio", "asset_total",
                        ].map((name, idx) => (
                          <div key={name} style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr",
                            padding: "6px 12px", fontSize: 12,
                            background: idx % 2 === 0 ? "#fff" : "#FAFBFC",
                            borderBottom: `1px solid ${GRAY_BORDER}`,
                            alignItems: "center",
                          }}>
                            <span style={{ color: DARK_TEXT, fontFamily: "monospace", fontSize: 12 }}>{name}</span>
                            <input
                              placeholder="请输入"
                              style={{
                                border: `1px solid ${GRAY_BORDER}`, borderRadius: 4,
                                padding: "3px 8px", fontSize: 12, width: "90%",
                                color: DARK_TEXT, outline: "none", boxSizing: "border-box",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 11, color: GRAY_TEXT }}>
                      共 30 个特征字段（实际以训练样本特征列为准），未填字段按缺失值处理
                    </div>
                  </FieldRow>

                  <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={doInfer} disabled={inferring} style={{
                      padding: "8px 28px", borderRadius: 4, fontSize: 13, fontWeight: 600,
                      background: inferring ? GRAY_BORDER : ACCENT, color: inferring ? GRAY_TEXT : "#fff",
                      border: "none", cursor: inferring ? "not-allowed" : "pointer",
                    }}>
                      {inferring ? "推理中…" : "▶ 开始推理"}
                    </button>
                    {inferred && <span style={{ fontSize: 12, color: STEP_DONE, fontWeight: 500 }}>✓ 推理完成</span>}
                  </div>

                  {inferred && (
                    <div style={{ marginTop: 20, padding: "16px 20px", background: GRAY_BG,
                      borderRadius: 6, border: `1px solid ${GRAY_BORDER}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <div style={{ width: 3, height: 16, background: ACCENT, borderRadius: 2 }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: DARK_TEXT }}>推理结果</span>
                      </div>
                      <div style={{ display: "inline-block", background: "#fff", borderRadius: 6,
                        padding: "16px 48px", border: `1px solid ${GRAY_BORDER}`, textAlign: "center" }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: ACCENT }}>0.372</div>
                        <div style={{ fontSize: 13, color: GRAY_TEXT, marginTop: 6 }}>Y 值（违约概率）</div>
                      </div>
                    </div>
                  )}
                </Stack>
              )}

              <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
                <button onClick={() => setStep(2)} style={{
                  padding: "8px 20px", borderRadius: 4, fontSize: 13,
                  background: "#fff", color: GRAY_TEXT,
                  border: `1px solid ${GRAY_BORDER}`, cursor: "pointer",
                }}>← 上一步</button>
                <button onClick={() => setStep(4)} style={{
                  padding: "8px 28px", borderRadius: 4, fontSize: 13, fontWeight: 600,
                  background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
                }}>下一步：发布 →</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4 : 发布 ─────────────────────────────────────────────── */}
        {step === 4 && (
          <div style={{ background: "#fff", borderRadius: 8, border: `1px solid ${GRAY_BORDER}`, padding: "24px 28px" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: DARK_TEXT, marginBottom: 20 }}>确认发布</div>
            <Divider />

            {/* 模型信息汇总 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginTop: 8 }}>
              {[
                ["模型名称", "0615-2"],
                ["中文名称", "0615²"],
                ["版本号", "M1.00"],
                ["复杂度", "复杂（N=4）"],
                ["训练样本", "rs_1_300v_sample.csv"],
                ["特征数量", "300"],
                ["Test AUC", "0.847"],
                ["Test KS", "0.531"],
              ].map(([label, value]) => (
                <div key={label}>
                  <FieldRow label={label}>
                    <span style={{ fontSize: 13, color: DARK_TEXT }}>{value}</span>
                  </FieldRow>
                </div>
              ))}
            </div>

            <Divider />

            {!published ? (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, color: GRAY_TEXT, marginBottom: 16 }}>
                  发布后，模型将进入「已上线」状态，可通过 API 调用。
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setStep(3)} style={{
                    padding: "8px 20px", borderRadius: 4, fontSize: 13,
                    background: "#fff", color: GRAY_TEXT,
                    border: `1px solid ${GRAY_BORDER}`, cursor: "pointer",
                  }}>← 上一步</button>
                  <button onClick={doPublish} style={{
                    padding: "8px 32px", borderRadius: 4, fontSize: 13, fontWeight: 600,
                    background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
                  }}>确认发布</button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 20, textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 40, color: STEP_DONE }}>✓</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: DARK_TEXT, marginTop: 12 }}>发布成功</div>
                <div style={{ fontSize: 13, color: GRAY_TEXT, marginTop: 8 }}>
                  模型 0615-2 已上线，可通过 API 调用。
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 12 }}>
                  <button onClick={() => { setView("models"); setStep(1); setUploaded(false); setTrained(false); setValidated(false); setInferred(false); setPublished(false); }} style={{
                    padding: "8px 20px", borderRadius: 4, fontSize: 13,
                    background: "#fff", color: GRAY_TEXT,
                    border: `1px solid ${GRAY_BORDER}`, cursor: "pointer",
                  }}>新建模型</button>
                  <button style={{
                    padding: "8px 20px", borderRadius: 4, fontSize: 13, fontWeight: 600,
                    background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
                  }}>查看 API 文档</button>
                </div>
              </div>
            )}
          </div>
        )}
          </div>
        )}
      </div>
    </div>
  );
}
