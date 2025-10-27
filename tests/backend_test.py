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

    def test_learner_registration_and_login(self):
        """Test CRITICAL: Learner registration with class_type field"""
        print("\n" + "="*60)
        print("TESTING: CRITICAL - Learner Registration & Login")
        print("="*60)
        
        # Test learner registration with all fields including class_type
        timestamp = datetime.now().strftime("%H%M%S")
        learner_data = {
            "name": f"Test Learner {timestamp}",
            "email": f"testlearner{timestamp}@test.com",
            "cohort": "VET",
            "phone": "+61 400 000 000",
            "class_type": "Both"  # CRITICAL FIELD
        }
        
        success, response = self.run_test(
            "POST /learners/register (With class_type)",
            "POST",
            "learners/register",
            200,
            data=learner_data,
            description="CRITICAL: Register learner with class_type field"
        )
        
        if success and response:
            try:
                data = response.json()
                if data.get("success") and data.get("learner_id"):
                    self.learner_id = data["learner_id"]
                    self.learner_session_token = data.get("session_token")
                    print(f"   ✅ Learner registered successfully with ID: {self.learner_id}")
                    print(f"   ✅ class_type field accepted: {learner_data['class_type']}")
                else:
                    print(f"   ⚠️  Registration response missing expected fields")
            except Exception as e:
                print(f"   ⚠️  Error parsing response: {e}")
        
        # Test learner login
        if self.learner_id:
            success, response = self.run_test(
                "POST /learners/login",
                "POST",
                f"learners/login?email={learner_data['email']}",
                200,
                description="Login with registered learner email"
            )
            
            if success and response:
                try:
                    data = response.json()
                    if data.get("success"):
                        print(f"   ✅ Learner login successful")
                except:
                    pass
    
    def test_learner_dashboard(self):
        """Test learner dashboard endpoint"""
        print("\n" + "="*60)
        print("TESTING: Learner Dashboard")
        print("="*60)
        
        if not self.learner_id:
            print("⚠️  Skipping - No learner_id available (registration may have failed)")
            return
        
        success, response = self.run_test(
            f"GET /learners/dashboard/{self.learner_id}",
            "GET",
            f"learners/dashboard/{self.learner_id}",
            200,
            description="Get learner dashboard data"
        )
        
        if success and response:
            try:
                data = response.json()
                # Verify class_type is in the response
                if data.get("learner") and "class_type" in data["learner"]:
                    print(f"   ✅ class_type field present in dashboard: {data['learner']['class_type']}")
                else:
                    print(f"   ⚠️  class_type field missing from dashboard response")
                    
                # Verify modules data
                if data.get("modules"):
                    print(f"   ✅ Modules data present: {len(data['modules'])} modules")
                else:
                    print(f"   ⚠️  Modules data missing")
            except Exception as e:
                print(f"   ⚠️  Error parsing dashboard response: {e}")
    
    def test_pmo_manual_auth(self):
        """Test PMO manual registration and login"""
        print("\n" + "="*60)
        print("TESTING: PMO Manual Authentication")
        print("="*60)
        
        # Test PMO registration
        timestamp = datetime.now().strftime("%H%M%S")
        pmo_data = {
            "username": f"testpmo{timestamp}",
            "password": "TestPass123!",
            "name": f"Test PMO User {timestamp}"
        }
        
        success, response = self.run_test(
            "POST /auth/register (PMO)",
            "POST",
            "auth/register",
            200,
            data=pmo_data,
            description="Register PMO user with username/password"
        )
        
        # Test PMO login
        if success:
            login_data = {
                "username": pmo_data["username"],
                "password": pmo_data["password"]
            }
            
            success, response = self.run_test(
                "POST /auth/login (PMO)",
                "POST",
                "auth/login",
                200,
                data=login_data,
                description="Login PMO user with credentials"
            )
            
            if success and response:
                try:
                    # Check if session cookie is set
                    if response.cookies.get("session_token"):
                        self.pmo_session_token = response.cookies.get("session_token")
                        print(f"   ✅ Session token received")
                except:
                    pass
    
    def test_pmo_dashboard_endpoints(self):
        """Test CRITICAL: PMO dashboard endpoints (cohort analytics)"""
        print("\n" + "="*60)
        print("TESTING: CRITICAL - PMO Dashboard Endpoints")
        print("="*60)
        
        if not self.pmo_session_token:
            print("⚠️  No PMO session token - testing with testuser credentials")
            # Try to login with testuser
            login_data = {
                "username": "testuser",
                "password": "test123"
            }
            success, response = self.run_test(
                "POST /auth/login (testuser)",
                "POST",
                "auth/login",
                200,
                data=login_data,
                description="Login with testuser credentials"
            )
            
            if success and response:
                try:
                    if response.cookies.get("session_token"):
                        self.pmo_session_token = response.cookies.get("session_token")
                        print(f"   ✅ Session token received from testuser login")
                except:
                    pass
        
        if self.pmo_session_token:
            cookies = {"session_token": self.pmo_session_token}
            
            # Test overview endpoint
            self.run_test(
                "GET /dashboard/overview",
                "GET",
                "dashboard/overview",
                200,
                cookies=cookies,
                description="Get PMO overview dashboard"
            )
            
            # Test CRITICAL: Cohort analytics endpoints
            for cohort_id in [1, 2, 3]:
                success, response = self.run_test(
                    f"GET /dashboard/cohort/{cohort_id}",
                    "GET",
                    f"dashboard/cohort/{cohort_id}",
                    200,
                    cookies=cookies,
                    description=f"CRITICAL: Get Cohort {cohort_id} analytics data"
                )
                
                if success and response:
                    try:
                        data = response.json()
                        # Verify cohort data structure
                        if data.get("cohort_name") and data.get("learner_journey"):
                            print(f"   ✅ Cohort {cohort_id} data structure valid")
                            print(f"   ✅ Cohort name: {data['cohort_name']}")
                            print(f"   ✅ Learner journey stages: {len(data['learner_journey'])}")
                        else:
                            print(f"   ⚠️  Cohort {cohort_id} data structure incomplete")
                    except Exception as e:
                        print(f"   ⚠️  Error parsing cohort {cohort_id} response: {e}")
            
            # Test weekly huddle endpoint
            self.run_test(
                "GET /dashboard/weekly-huddle",
                "GET",
                "dashboard/weekly-huddle",
                200,
                cookies=cookies,
                description="Get weekly huddle data"
            )
        else:
            print("⚠️  Skipping authenticated dashboard tests - no session token available")
    
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
    print("FSO PROJECT HUB - COMPREHENSIVE BACKEND API TESTING")
    print("="*60)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Base URL: https://projectnexus-3.preview.emergentagent.com/api")
    
    tester = FSO_API_Tester()
    
    # Run test suites in order
    tester.test_api_health()
    tester.test_auth_endpoints_without_session()
    
    # CRITICAL TESTS
    tester.test_learner_registration_and_login()  # CRITICAL: class_type field
    tester.test_learner_dashboard()
    
    tester.test_pmo_manual_auth()
    tester.test_pmo_dashboard_endpoints()  # CRITICAL: cohort analytics
    
    # Print summary
    all_passed = tester.print_summary()
    
    print("\n📝 CRITICAL ISSUES TESTED:")
    print("1. ✓ Learner registration with class_type field")
    print("2. ✓ Cohort analytics pages (1, 2, 3) data loading")
    print("\n📝 NOTES:")
    print("1. All dashboard endpoints require authentication")
    print("2. Learner portal uses simple email-based authentication")
    print("3. PMO portal supports both manual login and Emergent OAuth")
    print("4. All endpoints use /api prefix as required by Kubernetes ingress")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
