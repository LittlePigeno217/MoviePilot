import requests

for name, url in [
    ("home", "https://flzt.club"),
    ("api", "https://flzt.club/api/v1/guest/comm/config"),
    ("login", "https://flzt.club/api/v1/passport/auth/login"),
]:
    try:
        if name == "login":
            response = requests.post(url, json={"email": "test", "password": "test"}, timeout=15)
        else:
            response = requests.get(url, timeout=15)
        print(name, response.status_code)
    except Exception as exc:
        print(name, type(exc).__name__, exc)
