# =============================================================================
# demo_baiqing.py  —  模拟"百擎平台"侧
#
# 做了什么：
#   1. 用 sklearn 生成一个模拟信贷风控数据集（1000条，20个特征，二分类）
#   2. 用 TabPFN 训练，保存 pkl
#   3. 调用 5 个生成函数，产出 5 个自描述文件
#
# 产出文件（存放在 ./demo_output/ 目录下）：
#   credit_risk_tab2.5_n1_f20_800/
#   ├── credit_risk_tab2.5_n1_f20_800.pkl
#   ├── io_schema.json
#   ├── source_meta.json
#   ├── test_cases.json
#   ├── score.py          （内含固化系数，可直接被百基加载）
#   └── score_test.json   （打分回归验证用例）
# =============================================================================

import os
import json
import hashlib
import datetime
import platform
import numpy as np
import pandas as pd
import joblib
import torch

from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# ─────────────────────────────────────────────
# TabPFN 登录认证
# 首次运行需要：
#   1. 访问 https://ux.priorlabs.ai 注册/登录
#   2. 在 Licenses 页面接受许可
#   3. 在 https://ux.priorlabs.ai/account 复制 API Key
#   4. 设置环境变量 TABPFN_TOKEN，或复制 .env.example 为 .env
# ─────────────────────────────────────────────
TABPFN_TOKEN = os.environ.get("TABPFN_TOKEN", "").strip()
if not TABPFN_TOKEN:
    raise SystemExit(
        "未检测到 TABPFN_TOKEN。请先设置环境变量后再运行：\n"
        "  Windows PowerShell:  $env:TABPFN_TOKEN = '你的key'\n"
        "  申请地址: https://ux.priorlabs.ai/account"
    )
os.environ["TABPFN_TOKEN"] = TABPFN_TOKEN   # 必须写回环境变量，TabPFN 才能读到

from tabpfn import TabPFNClassifier

# ─────────────────────────────────────────────
# 0. 输出目录
# ─────────────────────────────────────────────
OUTPUT_DIR = "./demo_output/credit_risk_tab2.5_n1_f20_800"
os.makedirs(OUTPUT_DIR, exist_ok=True)
PKL_NAME   = "credit_risk_tab2.5_n1_f20_800.pkl"
PKL_PATH   = os.path.join(OUTPUT_DIR, PKL_NAME)

print("=" * 60)
print("【百擎侧 demo】开始运行")
print("=" * 60)

# ─────────────────────────────────────────────
# 1. 生成模拟数据（替代真实业务数据）
# ─────────────────────────────────────────────
print("\n[Step 1] 生成模拟信贷风控数据集...")
X_all, y_all = make_classification(
    n_samples=1000,
    n_features=20,
    n_informative=10,
    n_redundant=5,
    random_state=42
)

# 给特征起业务感名字
feat_names = [
    "apply_age", "credit_score", "loan_amount", "income_monthly",
    "debt_ratio", "overdue_30d_cnt", "overdue_60d_cnt", "query_cnt_3m",
    "query_cnt_6m", "card_cnt", "loan_cnt", "repay_ratio",
    "util_rate", "max_overdue_days", "job_stability", "edu_level",
    "region_risk", "biz_type", "asset_score", "behavior_score"
]

X_df = pd.DataFrame(X_all, columns=feat_names)
y_series = pd.Series(y_all, name="label")

X_train, X_test, y_train, y_test = train_test_split(
    X_df, y_series, test_size=0.2, random_state=42
)
print(f"  训练集：{X_train.shape[0]} 行，{X_train.shape[1]} 特征")
print(f"  测试集：{X_test.shape[0]} 行")

# ─────────────────────────────────────────────
# 2. 训练 TabPFN，保存 pkl
# ─────────────────────────────────────────────
print("\n[Step 2] 训练 TabPFN（百擎平台核心）...")
clf = TabPFNClassifier(n_estimators=1)
clf.fit(X_train.values, y_train.values)
joblib.dump(clf, PKL_PATH)
print(f"  模型已保存：{PKL_PATH}")

# ─────────────────────────────────────────────
# 工具函数：SHA-256
# ─────────────────────────────────────────────
def file_sha256(filepath):
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b''):
            sha256.update(chunk)
    return sha256.hexdigest()

# ─────────────────────────────────────────────
# 3. 生成 io_schema.json
# ─────────────────────────────────────────────
def generate_io_schema(X, y, feature_dtypes=None):
    if hasattr(X, 'columns'):
        feature_names = X.columns.tolist()
    else:
        feature_names = [f"feat_{i}" for i in range(X.shape[1])]

    if feature_dtypes is None:
        feature_dtypes = {}
        for col in feature_names:
            if hasattr(X, 'dtypes'):
                dtype = str(X[col].dtype)
            else:
                dtype = 'float64'
            feature_dtypes[col] = 'numeric' if dtype in [
                'int64','float64','int32','float32'] else 'categorical'

    inputs = []
    for col in feature_names:
        entry = {
            "name": col,
            "dtype": feature_dtypes.get(col, 'numeric'),
            "required": True,
            "missing_allowed": True
        }
        if entry["dtype"] == "categorical":
            try:
                cats = X[col].dropna().unique().tolist() if hasattr(X,'loc') else []
                entry["categories"] = [str(c) for c in cats]
            except:
                entry["categories"] = []
        inputs.append(entry)

    unique_labels = np.unique(y)
    positive_class = int(max(unique_labels))

    return {
        "schema_version": 1,
        "inputs": inputs,
        "outputs": {
            "classes": unique_labels.tolist(),
            "positive_class": positive_class,
            "positive_class_meaning": "default / bad",
            "n_classes": len(unique_labels)
        }
    }

print("\n[Step 3] 生成 io_schema.json...")
schema = generate_io_schema(X_train, y_train)
with open(os.path.join(OUTPUT_DIR, "io_schema.json"), 'w', encoding='utf-8') as f:
    json.dump(schema, f, indent=2, ensure_ascii=False)
print(f"  特征数：{len(schema['inputs'])}，正类：{schema['outputs']['positive_class']}")

# ─────────────────────────────────────────────
# 4. 生成 source_meta.json
# ─────────────────────────────────────────────
def generate_source_meta(pkl_path, X, business_scene="credit_risk"):
    classifier = joblib.load(pkl_path)
    n_estimators = getattr(classifier, 'n_estimators', 1)

    try:
        import sklearn; sklearn_version = sklearn.__version__
    except: sklearn_version = "unknown"
    try:
        import tabpfn; tabpfn_version = tabpfn.__version__
    except: tabpfn_version = "unknown"

    return {
        "schema_version": 1,
        "pkl_sha256": file_sha256(pkl_path),
        "captured_at": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "env_capture": "single-env workflow: train env == capture env",
        "source": {
            "kind": "LDM-tn",
            "tabpfn_version": tabpfn_version,
            "sklearn_version": sklearn_version,
            "numpy_version": np.__version__,
            "python_version": platform.python_version(),
            "torch_version": torch.__version__
        },
        "shape": {
            "n_estimators": n_estimators,
            "n_features": X.shape[1],
            "n_train_rows": X.shape[0]
        },
        "naming": {
            "business_scene": business_scene,
            "n": n_estimators,
            "f": X.shape[1],
            "rows": X.shape[0]
        }
    }

print("\n[Step 4] 生成 source_meta.json...")
meta = generate_source_meta(PKL_PATH, X_train)
with open(os.path.join(OUTPUT_DIR, "source_meta.json"), 'w', encoding='utf-8') as f:
    json.dump(meta, f, indent=2, ensure_ascii=False)
print(f"  pkl_sha256: {meta['pkl_sha256'][:16]}...")
print(f"  tabpfn版本: {meta['source']['tabpfn_version']}")

# ─────────────────────────────────────────────
# 5. 生成 test_cases.json
# ─────────────────────────────────────────────
def to_python_type(val):
    if isinstance(val, (np.integer,)): return int(val)
    if isinstance(val, (np.floating,)): return float(val)
    if isinstance(val, np.ndarray): return val.tolist()
    return val

def generate_test_cases(pkl_path, X, y, feature_names=None):
    try:
        import tabpfn; tabpfn_version = tabpfn.__version__
    except: tabpfn_version = "unknown"

    classifier = joblib.load(pkl_path)
    if hasattr(classifier, 'eval'):
        classifier.eval()

    if feature_names is None:
        feature_names = X.columns.tolist() if hasattr(X, 'columns') else [
            f"feat_{i}" for i in range(X.shape[1])]

    # 取第 0 行
    row = X.iloc[0] if hasattr(X, 'iloc') else X[0]
    input_dict = {name: to_python_type(row[name] if hasattr(row, '__getitem__') else row[i])
                  for i, name in enumerate(feature_names)}

    x_single = X.iloc[0:1].values if hasattr(X, 'iloc') else X[0:1]
    x_single = x_single.astype(np.float32)
    proba = classifier.predict_proba(x_single)

    device = "cuda" if torch.cuda.is_available() else "cpu"

    return {
        "schema_version": 1,
        "generated_with": {
            "pkl_sha256": file_sha256(pkl_path),
            "tabpfn_version": tabpfn_version,
            "dtype": "float32",
            "device": device
        },
        "tolerance": {
            "proba_abs_fp32": 0.0,
            "proba_abs_bf16": 6e-3,
            "score_exact_fp32": True
        },
        "cases": [{
            "input": input_dict,
            "expected_proba": [round(float(p), 6) for p in proba[0]]
        }]
    }

print("\n[Step 5] 生成 test_cases.json...")
test_cases = generate_test_cases(PKL_PATH, X_train, y_train)
with open(os.path.join(OUTPUT_DIR, "test_cases.json"), 'w', encoding='utf-8') as f:
    json.dump(test_cases, f, indent=2, ensure_ascii=False)
print(f"  金标准概率: {test_cases['cases'][0]['expected_proba']}")
print(f"  推理设备:   {test_cases['generated_with']['device']}")

# ─────────────────────────────────────────────
# 6. 评分拉伸：计算系数，生成 score.py + score_test.json
# ─────────────────────────────────────────────
def train_ls_coeff(prob_series, target_min, target_max, mode='L'):
    probs = prob_series.values if isinstance(prob_series, pd.Series) else np.asarray(prob_series)
    if mode == 'H':
        probs = 1 - probs
    c = target_min
    delta = target_max - target_min
    mean_prob = np.mean(probs)
    mid = (target_min + target_max) / 2.0
    if mean_prob in (0, 1):
        a, b = 0.0, delta
    else:
        denom = mean_prob**2 - mean_prob
        a = (mid - c - delta * mean_prob) / denom if denom != 0 else 0.0
        b = delta - a
    if b < 0 or (2*a + b) < 0:
        a, b = 0.0, delta
    return {'a': round(a,4), 'b': round(b,4), 'c': round(c,4),
            'target_min': target_min, 'target_max': target_max, 'mode': mode}

def apply_ls_score(prob, coeff_dict):
    a, b, c, mode = coeff_dict['a'], coeff_dict['b'], coeff_dict['c'], coeff_dict['mode']
    is_scalar = np.isscalar(prob)
    x = np.asarray([prob]) if is_scalar else np.asarray(prob)
    if mode == 'H':
        x = 1 - x
    scores = np.round(a*(x**2) + b*x + c).astype(int)
    return float(scores[0]) if is_scalar else scores

print("\n[Step 6] 生成 score.py 和 score_test.json...")

# 用训练集第 0 行概率模拟"整列概率"（真实场景是全训练集概率）
clf_loaded = joblib.load(PKL_PATH)
prob_train = clf_loaded.predict_proba(X_train.values.astype(np.float32))[:, 1]
prob_series = pd.Series(prob_train)

TARGET_MIN, TARGET_MAX = 300, 999

coeff_L = train_ls_coeff(prob_series, TARGET_MIN, TARGET_MAX, mode='L')
coeff_H = train_ls_coeff(prob_series, TARGET_MIN, TARGET_MAX, mode='H')
print(f"  L 模式系数: a={coeff_L['a']}, b={coeff_L['b']}, c={coeff_L['c']}")
print(f"  H 模式系数: a={coeff_H['a']}, b={coeff_H['b']}, c={coeff_H['c']}")

# 写 score.py（含固化系数，百基直接 import 使用）
score_py_content = f'''# score.py  —  由百擎平台自动生成，勿手动修改系数
# 用法（百基侧）：
#   from score import apply_ls_score, COEFF_L, COEFF_H
#   score = apply_ls_score(prob, COEFF_L)

import numpy as np

COEFF_L = {coeff_L}
COEFF_H = {coeff_H}

def apply_ls_score(prob, coeff_dict):
    a, b, c, mode = coeff_dict["a"], coeff_dict["b"], coeff_dict["c"], coeff_dict["mode"]
    is_scalar = np.isscalar(prob)
    x = np.asarray([prob]) if is_scalar else np.asarray(prob)
    if mode == "H":
        x = 1 - x
    scores =np.round(a*(x**2) + b*x + c).astype(int)
    return float(scores[0]) if is_scalar else scores
'''
with open(os.path.join(OUTPUT_DIR, "score.py"), 'w', encoding='utf-8') as f:
    f.write(score_py_content)

# 写 score_test.json（回归验证用例）
test_probs = [float(prob_series.iloc[i]) for i in [0, 1, 2]]
score_test_cases = []
for p in test_probs:
    score_test_cases.append({
        "input": {"prob": p},
        "output": {"score": int(apply_ls_score(p, coeff_L))},
        "metadata": {"target_min": TARGET_MIN, "target_max": TARGET_MAX, "mode": "L"}
    })
for p in test_probs:
    score_test_cases.append({
        "input": {"prob": p},
        "output": {"score": int(apply_ls_score(p, coeff_H))},
        "metadata": {"target_min": TARGET_MIN, "target_max": TARGET_MAX, "mode": "H"}
    })
with open(os.path.join(OUTPUT_DIR, "score_test.json"), 'w') as f:
    json.dump(score_test_cases, f, indent=2)

# ─────────────────────────────────────────────
# 汇总
# ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("【百擎侧】全部完成，产出文件：")
for fname in os.listdir(OUTPUT_DIR):
    fpath = os.path.join(OUTPUT_DIR, fname)
    size  = os.path.getsize(fpath)
    print(f"  {fname:<45} {size:>8} bytes")
print("=" * 60)
print("\n下一步：运行 demo_baiji.py 模拟百基侧接入验证")
