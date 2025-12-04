# -*- mode: python ; coding: utf-8 -*-
import sys
import os
from PyInstaller.utils.hooks import collect_all, collect_data_files
import glob

block_cipher = None

# Helper to find Python.Runtime.dll
def find_python_runtime_dll():
    try:
        import pythonnet
        runtime_path = os.path.join(os.path.dirname(pythonnet.__file__), 'runtime')
        dlls = glob.glob(os.path.join(runtime_path, 'Python.Runtime.dll'))
        if dlls:
            return (dlls[0], os.path.join('pythonnet', 'runtime'))
    except ImportError:
        pass
    return None

python_runtime_dll = find_python_runtime_dll()

binaries = []
if python_runtime_dll:
    binaries.append(python_runtime_dll)


# Collect hidden imports for complex libraries
hidden_imports = [
    'uvicorn.logging',
    'uvicorn.loops',
    'uvicorn.loops.auto',
    'uvicorn.protocols',
    'uvicorn.protocols.http',
    'uvicorn.protocols.http.auto',
    'uvicorn.protocols.websockets',
    'uvicorn.protocols.websockets.auto',
    'uvicorn.lifespan.on',
    'engineio.async_drivers.asgi',
    'socketio',
    'pythonnet',
    'clr_loader',
    'pydantic',
    'numpy',
    'PIL',
    'mss',
    'pynput',
    'webview',
    'fastapi',
    'starlette',
    'click',
    'h11',
    'websockets',
    'yaml',
    'loguru',
    'requests',
    'chardet',
    'charset_normalizer',
    'idna',
    'urllib3',
    'certifi',
    'soupsieve',
    'bs4',
]

# Collect data files
datas = [
    ('frontend', 'frontend'),
    ('live2d-models', 'live2d-models'),
    ('characters', 'characters'),
    ('prompts', 'prompts'),
    ('config_templates', 'config_templates'),
    ('src', 'src'),
    ('model_dict.json', '.'),
    ('pyproject.toml', '.'),
    ('backgrounds', 'backgrounds'),
    ('avatars', 'avatars'),
    ('web_tool', 'web_tool'),
    ('mcp_servers.json', '.'),
]

# Include user config if present (optional)
if os.path.exists('conf.yaml'):
    datas.append(('conf.yaml', '.'))

# Include models if present (optional)
if os.path.exists('models'):
    datas.append(('models', 'models'))

# Add any dynamic collections
# collect_all returns (datas, binaries, hiddenimports)
try:
    tmp_ret = collect_all('sherpa_onnx')
    datas += tmp_ret[0]; binaries += tmp_ret[1]; hidden_imports += tmp_ret[2]
except Exception as e:
    print(f"Warning: Failed to collect sherpa_onnx: {e}")

# funasr is optional and not installed in this build environment
# tmp_ret = collect_all('funasr')
# datas += tmp_ret[0]; binaries += tmp_ret[1]; hidden_imports += tmp_ret[2]

try:
    tmp_ret = collect_all('edge_tts')
    datas += tmp_ret[0]; binaries += tmp_ret[1]; hidden_imports += tmp_ret[2]
except Exception as e:
    print(f"Warning: Failed to collect edge_tts: {e}")


a = Analysis(
    ['run_desktop_pet.py'],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hidden_imports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='v-mate',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False, # Set to False for GUI only
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='v-mate',
)

if sys.platform == 'darwin':
    app = BUNDLE(
        coll,
        name='v-mate.app',
        icon=None,
        bundle_identifier='com.kimtaeyoon.vmate',
    )
