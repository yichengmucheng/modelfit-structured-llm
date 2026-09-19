import re

with open(r'D:\桌面\TabPFN-main\TabPFN-main\canvases\baiqing-new-flow.canvas.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Remove cursor/canvas import block (multi-line)
code = re.sub(r'import \{[^}]+\} from "cursor/canvas";\s*', '', code, flags=re.DOTALL)

# 2. Remove react import
code = re.sub(r'import \{ useState \} from "react";\s*', '', code)

# 3. Remove export default
code = code.replace('export default function BaiqingNewFlow()', 'function BaiqingNewFlow()')

# 4. Add stubs at top
stubs = '''const { useState } = React;

// ── cursor/canvas stubs ───────────────────────────────────────
const Stack = ({children, ...p}) => React.createElement('div', p, children);
const Row = ({children, ...p}) => React.createElement('div', {...p, style:{display:'flex',...(p.style||{})}}, children);
const Grid = ({children, ...p}) => React.createElement('div', {...p, style:{display:'grid',...(p.style||{})}}, children);
const Card = ({children, ...p}) => React.createElement('div', p, children);
const CardHeader = ({children, ...p}) => React.createElement('div', p, children);
const CardBody = ({children, ...p}) => React.createElement('div', p, children);
const H2 = ({children, ...p}) => React.createElement('h2', p, children);
const H3 = ({children, ...p}) => React.createElement('h3', p, children);
const Text = ({children, ...p}) => React.createElement('span', p, children);
const Button = ({children, ...p}) => React.createElement('button', p, children);
const Divider = () => React.createElement('hr', {style:{border:'none',borderTop:'1px solid #E4E7ED',margin:'12px 0'}});
const Spacer = ({size=8}) => React.createElement('div', {style:{height:size}});
const Pill = ({children, ...p}) => React.createElement('span', {style:{padding:'2px 8px',borderRadius:12,fontSize:12,...(p.style||{})}}, children);
const Callout = ({children, ...p}) => React.createElement('div', {style:{padding:12,borderRadius:6,background:'#EEF1FE',...(p.style||{})}}, children);
const Stat = ({children, ...p}) => React.createElement('div', p, children);
const Table = ({children, ...p}) => React.createElement('table', p, children);
const useHostTheme = () => ({theme:'light'});
// ─────────────────────────────────────────────────────────────

'''

code = stubs + code

# 5. Append mount call
code += '\n\nReactDOM.createRoot(document.getElementById("root")).render(React.createElement(BaiqingNewFlow));\n'

# 6. Escape for embedding in JS string (use backtick template literal)
# We'll put the code in a <script type="text/plain"> block and read it from JS
code_escaped = code.replace('</script>', '<\\/script>')  # prevent premature script close

html = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>百擎 ModelFit — 交互原型</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; background: #F5F6FA; }
    #loading { position:fixed; top:0; left:0; right:0; bottom:0; display:flex; align-items:center; justify-content:center; background:#F5F6FA; z-index:9999; font-size:14px; color:#666; }
    #error-box { display:none; background:#fff3cd; border:1px solid #ffc107; border-radius:6px; padding:16px; margin:20px; font-size:12px; color:#333; white-space:pre-wrap; word-break:break-all; }
  </style>
</head>
<body>
  <div id="loading">⏳ 正在加载交互原型，请稍候…</div>
  <div id="error-box"></div>
  <div id="root"></div>

  <!-- 源码存放区（不会被直接执行） -->
  <script id="app-src" type="text/plain">
''' + code_escaped + '''
  </script>

  <script>
    function showError(msg) {
      document.getElementById('loading').style.display = 'none';
      var box = document.getElementById('error-box');
      box.style.display = 'block';
      box.textContent = '❌ 编译错误（请截图发给开发者）:\\n\\n' + msg;
    }

    window.addEventListener('load', function () {
      if (typeof Babel === 'undefined') {
        showError('Babel 未加载。请确认网络可以访问 unpkg.com（需要联网）。');
        return;
      }
      try {
        var src = document.getElementById('app-src').textContent;
        var result = Babel.transform(src, {
          filename: 'App.tsx',
          presets: [
            ['react', { runtime: 'classic' }],
            'typescript'
          ]
        });
        document.getElementById('loading').style.display = 'none';
        // eslint-disable-next-line no-eval
        eval(result.code);
      } catch (e) {
        showError(e.message + '\\n\\nStack:\\n' + (e.stack || ''));
      }
    });
  </script>
</body>
</html>
'''

out_path = r'D:\桌面\TabPFN-main\TabPFN-main\百擎平台交互原型.html'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'Generated: {out_path}')
print(f'Total size: {len(html)} bytes')
