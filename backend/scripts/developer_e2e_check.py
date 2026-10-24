import sys
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def print_result(title, success, details=""):
    mark = "PASS" if success else "FAIL"
    print(f"[{mark}] {title}")
    if details:
        print(f"       -> {details}")

def run_suite():
    print("=" * 60)
    print(">> SENIOR DEVELOPER E2E AUDIT & INTEGRITY CHECK")
    print("=" * 60)
    
    # 1. Health check
    try:
        r = requests.get(f"{BASE_URL}/health")
        print_result("System Health Check", r.status_code == 200, f"Status: {r.status_code}, {r.json()}")
    except Exception as e:
        print_result("System Health Check", False, str(e))
        return

    # 2. Admin Login
    admin_token = None
    try:
        r = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@technova.com", "password": "Admin@123"})
        if r.status_code == 200:
            admin_token = r.json()["access_token"]
            print_result("Admin Authentication", True, "JWT access token issued")
        else:
            print_result("Admin Authentication", False, f"HTTP {r.status_code}: {r.text}")
    except Exception as e:
        print_result("Admin Authentication", False, str(e))

    # 3. Employee Login
    emp_token = None
    try:
        r = requests.post(f"{BASE_URL}/auth/login", json={"email": "employee@technova.com", "password": "Employee@123"})
        if r.status_code == 200:
            emp_token = r.json()["access_token"]
            print_result("Employee Authentication", True, "JWT access token issued")
        else:
            print_result("Employee Authentication", False, f"HTTP {r.status_code}: {r.text}")
    except Exception as e:
        print_result("Employee Authentication", False, str(e))

    if not admin_token or not emp_token:
        print("Cannot continue without valid tokens.")
        return

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    emp_headers = {"Authorization": f"Bearer {emp_token}"}

    # 4. Check Current Organization
    try:
        r = requests.get(f"{BASE_URL}/auth/me", headers=admin_headers)
        user_info = r.json()
        print_result("Organization & User Profile", r.status_code == 200, f"Org ID: {user_info.get('organization_id')}, Email: {user_info.get('email')}, Role: {user_info.get('role')}")
    except Exception as e:
        print_result("Organization & User Profile", False, str(e))

    # 5. List Employees/Users
    emp_user_id = None
    try:
        r = requests.get(f"{BASE_URL}/users", headers=admin_headers)
        if r.status_code == 200:
            users = r.json()
            for u in users:
                if u.get("email") == "employee@technova.com":
                    emp_user_id = u.get("id")
            print_result("Fetch Organization Users", True, f"Found {len(users)} users. Employee ID: {emp_user_id}")
        else:
            print_result("Fetch Organization Users", False, f"HTTP {r.status_code}: {r.text}")
    except Exception as e:
        print_result("Fetch Organization Users", False, str(e))

    # 6. Create a New Project
    import uuid
    slug = f"qa-proj-{uuid.uuid4().hex[:6]}"
    project_id = None
    try:
        payload = {
            "name": f"Quality Engineering {slug[-4:]}",
            "slug": slug,
            "description": "Project created during Senior Dev automated QA test"
        }
        r = requests.post(f"{BASE_URL}/projects", headers=admin_headers, json=payload)
        if r.status_code in (200, 201):
            proj = r.json()
            project_id = proj.get("id")
            print_result("Project Creation", True, f"Created Project ID: {project_id}, Name: {proj.get('name')}")
        else:
            print_result("Project Creation", False, f"HTTP {r.status_code}: {r.text}")
    except Exception as e:
        print_result("Project Creation", False, str(e))

    # 7. Assign Employee to Project
    if project_id and emp_user_id:
        try:
            payload = {
                "user_id": emp_user_id,
                "permission": "PROJECT_MEMBER"
            }
            r = requests.post(f"{BASE_URL}/projects/{project_id}/members", headers=admin_headers, json=payload)
            if r.status_code in (200, 201):
                print_result("Assign Employee to Project", True, f"Assigned User {emp_user_id} to Project {project_id}")
            else:
                print_result("Assign Employee to Project", False, f"HTTP {r.status_code}: {r.text}")
        except Exception as e:
            print_result("Assign Employee to Project", False, str(e))

    # 8. Check Employee My Projects
    try:
        r = requests.get(f"{BASE_URL}/projects/my", headers=emp_headers)
        if r.status_code == 200:
            my_projects = r.json()
            assigned_ids = [p["id"] for p in my_projects]
            has_assigned = (project_id in assigned_ids) if project_id else True
            print_result("Employee Project Access Scoping", has_assigned, f"Employee sees projects: {assigned_ids}")
        else:
            print_result("Employee Project Access Scoping", False, f"HTTP {r.status_code}: {r.text}")
    except Exception as e:
        print_result("Employee Project Access Scoping", False, str(e))

    # 9. Test Retrieval System
    try:
        payload = {
            "query": "system architecture security guidelines",
            "limit": 5
        }
        r = requests.post(f"{BASE_URL}/retrieval", headers=admin_headers, json=payload)
        if r.status_code == 200:
            ret_data = r.json()
            print_result("Hybrid Retrieval Engine", True, f"Query successful. Vector hits: {ret_data.get('vector_result_count')}, Graph hits: {ret_data.get('graph_result_count')}")
        else:
            print_result("Hybrid Retrieval Engine", False, f"HTTP {r.status_code}: {r.text}")
    except Exception as e:
        print_result("Hybrid Retrieval Engine", False, str(e))

    # 10. Test CodeMind Repositories & Search
    try:
        r = requests.get(f"{BASE_URL}/codemind/repositories", headers=admin_headers)
        if r.status_code == 200:
            repos = r.json()
            print_result("CodeMind Repositories", True, f"Found {len(repos)} registered repositories")
            if repos:
                repo0 = repos[0]
                sr = requests.post(f"{BASE_URL}/codemind/projects/{repo0['project_id']}/search", headers=admin_headers, json={
                    "query": "authentication user token",
                    "limit": 5
                })
                print_result("CodeMind Semantic Search", sr.status_code == 200, f"Status: {sr.status_code}")
        else:
            print_result("CodeMind Repositories", False, f"HTTP {r.status_code}: {r.text}")
    except Exception as e:
        print_result("CodeMind Repositories", False, str(e))

    # 11. Test AI Chat
    try:
        r = requests.post(f"{BASE_URL}/ai/chat", headers=admin_headers, json={
            "message": "Hello AI Copilot, explain organization memory architecture."
        })
        if r.status_code == 200:
            ans = r.json()
            print_result("AI Copilot / Chat", True, f"Received response from Gemini/AI engine. Conversation ID: {ans.get('conversation_id')}")
        else:
            print_result("AI Copilot / Chat", False, f"HTTP {r.status_code}: {r.text}")
    except Exception as e:
        print_result("AI Copilot / Chat", False, str(e))

    print("=" * 60)
    print(">> AUDIT COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    run_suite()
