import requests

base_url = "http://127.0.0.1:8000/api"
session = requests.Session()

# 1. Login as Candidate
print("Logging in as candidate@interviewhub.com...")
login_response = session.post(f"{base_url}/auth/login/", json={
    "email": "candidate@interviewhub.com",
    "password": "Password123"
})
print(f"Login Response: {login_response.text}")

# 2. Fetch interviews list
print("\nFetching interviews...")
response = session.get(f"{base_url}/interviews/")
print(f"Status Code: {response.status_code}")
data = response.json()

interviews = data.get("results", []) if isinstance(data, dict) else data
print(f"Total interviews returned for Candidate: {len(interviews)}")
for i, interview in enumerate(interviews):
    candidate_email = interview.get("candidate", {}).get("email")
    print(f"Interview {i+1}: Candidate Email: {candidate_email} | Role: {interview.get('role')} | Type: {interview.get('type')}")
