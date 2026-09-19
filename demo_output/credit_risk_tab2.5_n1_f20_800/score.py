# score.py  —  由百擎平台自动生成，勿手动修改系数
# 用法（百基侧）：
#   from score import apply_ls_score, COEFF_L, COEFF_H
#   score = apply_ls_score(prob, COEFF_L)

import numpy as np

COEFF_L = {'a': 17.69, 'b': 681.31, 'c': 300, 'target_min': 300, 'target_max': 999, 'mode': 'L'}
COEFF_H = {'a': -17.69, 'b': 716.69, 'c': 300, 'target_min': 300, 'target_max': 999, 'mode': 'H'}

def apply_ls_score(prob, coeff_dict):
    a, b, c, mode = coeff_dict["a"], coeff_dict["b"], coeff_dict["c"], coeff_dict["mode"]
    is_scalar = np.isscalar(prob)
    x = np.asarray([prob]) if is_scalar else np.asarray(prob)
    if mode == "H":
        x = 1 - x
    scores =np.round(a*(x**2) + b*x + c).astype(int)
    return float(scores[0]) if is_scalar else scores
