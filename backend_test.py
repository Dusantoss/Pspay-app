import requests
import sys
import json
from datetime import datetime

class PayCoinAPITester:
    def __init__(self, base_url="https://crypto-payments-10.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.client_token = None
        self.merchant_token = None
        self.client_user_id = None
        self.merchant_user_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_register_client(self):
        """Test client registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        client_data = {
            "email": f"client_{timestamp}@test.com",
            "name": f"Test Client {timestamp}",
            "phone": "+5511999999999",
            "user_type": "client",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "Register Client",
            "POST",
            "auth/register",
            200,
            data=client_data
        )
        
        if success and 'access_token' in response:
            self.client_token = response['access_token']
            self.client_user_id = response['user_id']
            print(f"   Client Token: {self.client_token[:20]}...")
            return True
        return False

    def test_register_merchant(self):
        """Test merchant registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        merchant_data = {
            "email": f"merchant_{timestamp}@test.com",
            "name": f"Test Merchant {timestamp}",
            "phone": "+5511888888888",
            "user_type": "merchant",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "Register Merchant",
            "POST",
            "auth/register",
            200,
            data=merchant_data
        )
        
        if success and 'access_token' in response:
            self.merchant_token = response['access_token']
            self.merchant_user_id = response['user_id']
            print(f"   Merchant Token: {self.merchant_token[:20]}...")
            return True
        return False

    def test_login_client(self):
        """Test client login"""
        timestamp = datetime.now().strftime('%H%M%S')
        login_data = {
            "email": f"client_{timestamp}@test.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "Login Client",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        return success

    def test_get_profile(self, user_type="client"):
        """Test get user profile"""
        token = self.client_token if user_type == "client" else self.merchant_token
        success, response = self.run_test(
            f"Get {user_type.title()} Profile",
            "GET",
            "user/profile",
            200,
            token=token
        )
        return success

    def test_update_profile(self, user_type="client"):
        """Test update user profile"""
        token = self.client_token if user_type == "client" else self.merchant_token
        
        profile_data = {
            "name": f"Updated {user_type.title()} Name",
            "phone": "+5511777777777",
            "address": {
                "street": "Rua Teste",
                "number": "123",
                "city": "São Paulo",
                "state": "SP",
                "zip_code": "01234-567",
                "country": "Brasil"
            }
        }
        
        if user_type == "merchant":
            profile_data.update({
                "business_name": "Test Business",
                "business_description": "A test business",
                "business_category": "Technology"
            })
        
        success, response = self.run_test(
            f"Update {user_type.title()} Profile",
            "PUT",
            "user/profile",
            200,
            data=profile_data,
            token=token
        )
        return success

    def test_create_store(self):
        """Test create store (merchant only)"""
        store_data = {
            "name": "Test Store",
            "description": "A test store for PayCoin",
            "address": {
                "street": "Rua da Loja",
                "number": "456",
                "city": "São Paulo",
                "state": "SP",
                "zip_code": "01234-567",
                "country": "Brasil",
                "latitude": -23.5505,
                "longitude": -46.6333
            },
            "category": "Technology",
            "phone": "+5511666666666"
        }
        
        success, response = self.run_test(
            "Create Store",
            "POST",
            "stores",
            200,
            data=store_data,
            token=self.merchant_token
        )
        return success

    def test_get_stores(self):
        """Test get all stores"""
        success, response = self.run_test(
            "Get All Stores",
            "GET",
            "stores",
            200
        )
        return success

    def test_get_my_stores(self):
        """Test get merchant's stores"""
        success, response = self.run_test(
            "Get My Stores",
            "GET",
            "my-stores",
            200,
            token=self.merchant_token
        )
        return success

    def test_create_product(self):
        """Test create product (merchant only)"""
        product_data = {
            "name": "Test Product",
            "description": "A test product for PayCoin",
            "price": 99.99,
            "currency": "BRL",
            "category": "Electronics"
        }
        
        success, response = self.run_test(
            "Create Product",
            "POST",
            "products",
            200,
            data=product_data,
            token=self.merchant_token
        )
        return success

    def test_get_products(self):
        """Test get all products"""
        success, response = self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )
        return success

    def test_get_my_products(self):
        """Test get merchant's products"""
        success, response = self.run_test(
            "Get My Products",
            "GET",
            "my-products",
            200,
            token=self.merchant_token
        )
        return success

    def test_create_transaction(self):
        """Test create transaction"""
        transaction_data = {
            "to_user_id": self.merchant_user_id,
            "amount": 50.0,
            "token_type": "PSPAY",
            "description": "Test payment"
        }
        
        success, response = self.run_test(
            "Create Transaction",
            "POST",
            "transactions",
            200,
            data=transaction_data,
            token=self.client_token
        )
        return success

    def test_get_transactions(self, user_type="client"):
        """Test get user transactions"""
        token = self.client_token if user_type == "client" else self.merchant_token
        success, response = self.run_test(
            f"Get {user_type.title()} Transactions",
            "GET",
            "transactions",
            200,
            token=token
        )
        return success

    def test_get_analytics(self):
        """Test get merchant analytics"""
        success, response = self.run_test(
            "Get Merchant Analytics",
            "GET",
            "analytics/dashboard",
            200,
            token=self.merchant_token
        )
        return success

def main():
    print("🚀 Starting PayCoin API Tests...")
    print("=" * 50)
    
    tester = PayCoinAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("Register Client", tester.test_register_client),
        ("Register Merchant", tester.test_register_merchant),
        ("Get Client Profile", lambda: tester.test_get_profile("client")),
        ("Get Merchant Profile", lambda: tester.test_get_profile("merchant")),
        ("Update Client Profile", lambda: tester.test_update_profile("client")),
        ("Update Merchant Profile", lambda: tester.test_update_profile("merchant")),
        ("Create Store", tester.test_create_store),
        ("Get All Stores", tester.test_get_stores),
        ("Get My Stores", tester.test_get_my_stores),
        ("Create Product", tester.test_create_product),
        ("Get All Products", tester.test_get_products),
        ("Get My Products", tester.test_get_my_products),
        ("Create Transaction", tester.test_create_transaction),
        ("Get Client Transactions", lambda: tester.test_get_transactions("client")),
        ("Get Merchant Transactions", lambda: tester.test_get_transactions("merchant")),
        ("Get Merchant Analytics", tester.test_get_analytics),
    ]
    
    # Run all tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())