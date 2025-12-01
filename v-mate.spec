# -*- mode: python ; coding: utf-8 -*-
import sys
import os
from PyInstaller.utils.hooks import collect_all

block_cipher = None

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
    ('conf.yaml', '.'),  # Include user config if present
    ('model_dict.json', '.'),
]

# Add any dynamic collections
tmp_ret = collect_all('sherpa_onnx')
datas += tmp_ret[0]; hidden_imports += tmp_ret[1]

tmp_ret = collect_all('funasr')
datas += tmp_ret[0]; hidden_imports += tmp_ret[1]

tmp_ret = collect_all('edge_tts')
datas += tmp_ret[0]; hidden_imports += tmp_ret[1]


a = Analysis(
    ['run_desktop_pet.py'],
    pathex=[],
    binaries=[],
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
    console=True, # Set to False for GUI only, but True is good for debugging first
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

app = BUNDLE(
    coll,
    name='v-mate.app',
    icon=None,
    bundle_identifier='com.kimtaeyoon.vmate',
)
