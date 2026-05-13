import requests

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Content-Type": "application/json",
}
payload = {"email": "840307800@qq.com", "password": "Li.19940207"}

try:
    response = requests.post(
        "https://flzt.club/api/v1/passport/auth/login",
        headers=headers,
        json=payload,
        timeout=15,
    )
    print("status", response.status_code)
    print(response.text[:500])
except Exception as exc:
    print(type(exc).__name__, exc)
