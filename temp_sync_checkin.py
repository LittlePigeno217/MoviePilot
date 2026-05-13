import shutil
import subprocess
from pathlib import Path

import requests

src = Path(r"d:/Users/Administrator/Documents/github/MoviePilot-Plugins/plugins/checkin")
dst = Path(r"d:/Users/Administrator/Documents/github/MoviePilot/app/plugins/checkin")

dst.mkdir(parents=True, exist_ok=True)
shutil.copytree(
    src,
    dst,
    dirs_exist_ok=True,
    ignore=shutil.ignore_patterns('__pycache__', '*.pyc', '.DS_Store', 'node_modules', '.vscode'),
)
print('synced')

try:
    response = requests.get("http://127.0.0.1:3001/api/v1/plugin/reload/Checkin", timeout=10)
    print(f"reload_status={response.status_code}")
    print(response.text)
except Exception as exc:
    print(f"reload_failed={exc}")

try:
    if 'response' in locals() and response.status_code == 401:
        print('reload_unauthorized_restart_backend=true')
        subprocess.run(
            [
                'powershell',
                '-Command',
                "Start-Process powershell -ArgumentList '-Command', '.\\venv\\Scripts\\python.exe -m app.main' -WorkingDirectory 'd:\\Users\\Administrator\\Documents\\github\\MoviePilot'"
            ],
            check=False,
        )
        print('backend_restart_triggered')
except Exception as exc:
    print(f"backend_restart_failed={exc}")
