# =============================================================================
# demo_baiji.py  —  模拟"百基平台"侧
#
# 做了什么：
#   1. 读取百擎产出的 6 个文件
#   2. 执行合规校验（sha256、特征数、文件完整性）
#   3. 按 io_schema 特征顺序加载模型推理，输出概率
#   4. 对比 test_cases.json 中的金标准概率，验证一致性
#   5. 加载 score.py 的固化系数，输出整数分值
# =============================================================================

import os
import json
import hashlib
import numpy as np
import joblib
import torch

# ─────────────────────────────────────────────
# 0. 文件目录
# ─────────────────────────────────────────────
MODEL_DIR = "./demo_output/credit_risk_tab2.5_n1_f20_800"
PKL_NAME  = "credit_risk_tab2.5_n1_f20_800.pkl"
PKL_PATH  = os.path.join(MODEL_DIR, PKL_NAME)

print("=" * 60)
print("【百基侧 demo】开始运行")
print("=" * 60)

# ─────────────────────────────────────────────
# 工具函数
# ─────────────────────────────────────────────
def file_sha256(filepath):
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b''):
            sha256.update(chunk)
    return sha256.hexdigest()

def check(condition, msg_ok, msg_fail):
    if condition:
        print(f"  ✓  {msg_ok}")
    else:
        print(f"  ✗  {msg_fail}")
        raise SystemExit(f"\n合规校验失败：{msg_fail}，终止接入。")

# ─────────────────────────────────────────────
# 1. 读取文件
# ─────────────────────────────────────────────
print("\n[Step 1] 读取文件包...")
with open(os.path.join(MODEL_DIR, "io_schema.json"),    encoding='utf-8') as f: io_schema  = json.load(f)
with open(os.path.join(MODEL_DIR, "source_meta.json"),  encoding='utf-8') as f: source_meta = json.load(f)
with open(os.path.join(MODEL_DIR, "test_cases.json"),   encoding='utf-8') as f: test_cases  = json.load(f)
print("  io_schema.json    ✓")
print("  source_meta.json  ✓")
print("  test_cases.json   ✓")

has_score = os.path.exists(os.path.join(MODEL_DIR, "score.py"))
print(f"  score.py          {'✓' if has_score else '—（无评分需求）'}")

# ─────────────────────────────────────────────
# 2. 合规校验（硬性）
# ─────────────────────────────────────────────
print("\n[Step 2] 合规校验...")

# 2.1 必备文件
for fname in ["io_schema.json", "source_meta.json", "test_cases.json", PKL_NAME]:
    check(os.path.exists(os.path.join(MODEL_DIR, fname)),
          f"文件存在：{fname}", f"缺少必备文件：{fname}")

# 2.2 SHA-256 三方一致
actual_sha = file_sha256(PKL_PATH)
meta_sha   = source_meta["pkl_sha256"]
cases_sha  = test_cases["generated_with"]["pkl_sha256"]
check(actual_sha == meta_sha,
      f"sha256 一致（pkl vs source_meta）",
      f"sha256 不一致！\n  pkl实际值:    {actual_sha}\n  source_meta值:{meta_sha}")
check(actual_sha == cases_sha,
      f"sha256 一致（pkl vs test_cases）",
      f"sha256 不一致！\n  pkl实际值:    {actual_sha}\n  test_cases值: {cases_sha}")

# 2.3 特征数对齐
n_schema   = len(io_schema["inputs"])
n_meta     = source_meta["shape"]["n_features"]
check(n_schema == n_meta,
      f"特征数一致：io_schema={n_schema}, source_meta={n_meta}",
      f"特征数不一致：io_schema={n_schema}, source_meta={n_meta}")

print("\n  所有合规校验通过，允许接入 ✓")

# ─────────────────────────────────────────────
# 3. 加载模型，按 io_schema 顺序推理
# ─────────────────────────────────────────────
print("\n[Step 3] 加载模型，执行推理...")
clf = joblib.load(PKL_PATH)
if hasattr(clf, 'eval'):
    clf.eval()  # 关闭 dropout，确保结果确定性

# 从 test_cases 取第一条用例作为输入
case = test_cases["cases"][0]

# 按 io_schema.inputs 的顺序组装特征（核心！顺序不对结果会变）
feature_order = [inp["name"] for inp in io_schema["inputs"]]
input_values  = [case["input"].get(name, np.nan) for name in feature_order]
x_input       = np.array(input_values, dtype=np.float32).reshape(1, -1)

proba = clf.predict_proba(x_input)
proba_result = [round(float(p), 6) for p in proba[0]]
print(f"  特征顺序：严格按 io_schema.inputs（共 {len(feature_order)} 个）")
print(f"  推理结果概率：{proba_result}")

# ─────────────────────────────────────────────
# 4. 一致性验证：对比金标准概率
# ─────────────────────────────────────────────
print("\n[Step 4] 一致性验证（对比 test_cases 金标准）...")
expected = case["expected_proba"]
tol_fp32 = test_cases["tolerance"]["proba_abs_fp32"]
tol_bf16 = test_cases["tolerance"]["proba_abs_bf16"]

max_diff = max(abs(proba_result[i] - expected[i]) for i in range(len(expected)))
print(f"  金标准概率：{expected}")
print(f"  实际推理概率：{proba_result}")
print(f"  最大误差：{max_diff:.8f}  （fp32容忍：{tol_fp32}，bf16容忍：{tol_bf16}）")

if max_diff <= tol_fp32:
    print("  ✓  fp32 精度完全一致，验证通过！")
elif max_diff <= tol_bf16:
    print("  ✓  在 bf16 容忍范围内，验证通过（存在精度差异，请确认推理设备）")
else:
    print("  ✗  误差超出容忍范围！打分可能不一致，请排查环境差异。")

# ─────────────────────────────────────────────
# 5. 评分拉伸（如有 score.py）
# ─────────────────────────────────────────────
print("\n[Step 5] 评分拉伸...")
if has_score:
    import importlib.util, sys
    spec = importlib.util.spec_from_file_location(
        "score", os.path.join(MODEL_DIR, "score.py"))
    score_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(score_module)

    # 正类列索引（positive_class 对应的列）
    classes       = io_schema["outputs"]["classes"]
    positive_class = io_schema["outputs"]["positive_class"]
    pos_idx       = classes.index(positive_class) if positive_class in classes else 1

    prob_pos = proba_result[pos_idx]
    print(f"  正类（positive_class={positive_class}）概率：{prob_pos}")

    score_L = score_module.apply_ls_score(prob_pos, score_module.COEFF_L)
    score_H = score_module.apply_ls_score(prob_pos, score_module.COEFF_H)
    print(f"  分值（mode=L，高分=高风险）：{int(score_L)}")
    print(f"  分值（mode=H，高分=低风险）：{int(score_H)}")

    # 回归校验：对比 score_test.json
    score_test_path = os.path.join(MODEL_DIR, "score_test.json")
    if os.path.exists(score_test_path):
        print("\n  回归校验（对比 score_test.json）...")
        with open(score_test_path) as f:
            score_test_cases = json.load(f)
        all_pass = True
        for tc in score_test_cases:
            p      = tc["input"]["prob"]
            mode   = tc["metadata"]["mode"]
            coeff  = score_module.COEFF_L if mode == "L" else score_module.COEFF_H
            actual = int(score_module.apply_ls_score(p, coeff))
            expect = tc["output"]["score"]
            ok     = actual == expect
            if not ok: all_pass = False
            status = "✓" if ok else "✗"
            print(f"    {status}  mode={mode}, prob={p:.4f} → 期望:{expect}, 实际:{actual}")
        if all_pass:
            print("  所有回归用例通过 ✓")
        else:
            print("  存在回归用例失败，请排查系数是否一致 ✗")
else:
    print("  无 score.py，跳过评分拉伸，直接输出概率。")

# ─────────────────────────────────────────────
# 汇总
# ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("【百基侧】接入验证完成")
print(f"  模型文件目录：{MODEL_DIR}")
print(f"  合规校验：通过")
print(f"  一致性验证：{'通过' if max_diff <= tol_bf16 else '失败'}")
if has_score:
    print(f"  评分拉伸：已完成（L={int(score_L)}, H={int(score_H)}）")
print("=" * 60)
