import requests
import sys
from datetime import datetime

class FSO_API_Tester:
    def __init__(self, base_url="https://projectnexus-3.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.pmo_session_token = None
        self.learner_session_token = None
        self.learner_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, cookies=None, description=""):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: {name}")
        if description:
            print(f"   Description: {description}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, cookies=cookies, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, cookies=cookies, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response preview: {str(response_data)[:200]}...")
                except:
                    pass
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.text[:300]}")
                except:
                    pass
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "endpoint": endpoint
                })

            return success, response

        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e),
                "endpoint": endpoint
            })
            return False, None

    def test_auth_endpoints_without_session(self):
        """Test authentication endpoints without valid session"""
        print("\n" + "="*60)
        print("TESTING: Authentication Endpoints (Unauthenticated)")
        print("="*60)
        
        # Test /auth/me without session - should return 401
        self.run_test(
            "GET /auth/me (No Session)",
            "GET",
            "auth/me",
            401,
            description="Should return 401 when no session token provided"
        )
        
        # Test logout without session - should still work
        self.run_test(
            "POST /auth/logout (No Session)",
            "POST",
            "auth/logout",
            200,
            description="Should return 200 even without session"
        )

    def test_dashboard_endpoints_without_auth(self):
        """Test dashboard endpoints without authentication"""
        print("\n" + "="*60)
        print("TESTING: Dashboard Endpoints (Unauthenticated)")
        print("="*60)
        
        # Test overview without auth
        self.run_test(
            "GET /dashboard/overview (No Auth)",
            "GET",
            "dashboard/overview",
            401,
            description="Should return 401 when not authenticated"
        )
        
        # Test cohort analytics without auth
        self.run_test(
            "GET /dashboard/cohort/3 (No Auth)",
            "GET",
            "dashboard/cohort/3",
            401,
            description="Should return 401 when not authenticated"
        )
        
        # Test weekly huddle without auth
        self.run_test(
            "GET /dashboard/weekly-huddle (No Auth)",
            "GET",
            "dashboard/weekly-huddle",
            401,
            description="Should return 401 when not authenticated"
        )

    def test_dashboard_endpoints_structure(self):
        """Test that dashboard endpoints return expected data structure"""
        print("\n" + "="*60)
        print("TESTING: Dashboard Data Structure (Mocked Data)")
        print("="*60)
        
        # Note: These tests would require a valid session token
        # Since we're using Emergent OAuth, we can't easily create a session in tests
        # We'll document this limitation
        
        print("\n⚠️  NOTE: Dashboard endpoint structure tests require valid Emergent OAuth session")
        print("   These endpoints are protected and need authentication via Emergent OAuth flow")
        print("   Manual testing or Playwright automation is required for authenticated endpoints")

    def test_api_health(self):
        """Test basic API connectivity"""
        print("\n" + "="*60)
        print("TESTING: API Health & Connectivity")
        print("="*60)
        
        try:
            # Test if API is reachable
            response = requests.get(f"{self.base_url.replace('/api', '')}/docs", timeout=5)
            if response.status_code == 200:
                print("✅ API is reachable - FastAPI docs accessible")
                self.tests_passed += 1
            else:
                print(f"⚠️  API docs returned status: {response.status_code}")
            self.tests_run += 1
        except Exception as e:
            print(f"❌ API connectivity issue: {str(e)}")
            self.tests_run += 1

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"\n{i}. {test['test']}")
                print(f"   Endpoint: {test['endpoint']}")
                if 'expected' in test:
                    print(f"   Expected: {test['expected']}, Got: {test['actual']}")
                if 'error' in test:
                    print(f"   Error: {test['error']}")
        
        print("\n" + "="*60)
        return self.tests_passed == self.tests_run

def main():
    print("="*60)
    print("FSO PROJECT HUB - BACKEND API TESTING")
    print("="*60)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Base URL: https://projectnexus-3.preview.emergentagent.com/api")
    
    tester = FSO_API_Tester()
    
    # Run test suites
    tester.test_api_health()
    tester.test_auth_endpoints_without_session()
    tester.test_dashboard_endpoints_without_auth()
    tester.test_dashboard_endpoints_structure()
    
    # Print summary
    all_passed = tester.print_summary()
    
    print("\n📝 NOTES:")
    print("1. All dashboard endpoints require Emergent OAuth authentication")
    print("2. Session creation requires valid Emergent session_id from OAuth flow")
    print("3. Authenticated endpoint testing will be done via Playwright automation")
    print("4. All endpoints use /api prefix as required by Kubernetes ingress")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
