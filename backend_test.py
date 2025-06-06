import requests
import unittest
import sys
import json
from datetime import datetime

class EnglishLearningAPITester(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(EnglishLearningAPITester, self).__init__(*args, **kwargs)
        self.base_url = "https://8fd67542-886b-46d4-93d7-d171e66139c9.preview.emergentagent.com/api"
        self.test_word_id = None  # Will be set during testing

    def test_01_root_endpoint(self):
        """Test the root API endpoint"""
        print("\n🔍 Testing root endpoint...")
        response = requests.get(f"{self.base_url}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "English Learning App API")
        print("✅ Root endpoint test passed")

    def test_02_get_categories(self):
        """Test getting word categories"""
        print("\n🔍 Testing categories endpoint...")
        response = requests.get(f"{self.base_url}/words/categories")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("categories", data)
        self.assertTrue(len(data["categories"]) > 0)
        print(f"✅ Categories endpoint test passed. Found categories: {data['categories']}")
        return data["categories"]

    def test_03_get_random_words(self):
        """Test getting random words"""
        print("\n🔍 Testing random words endpoint...")
        response = requests.get(f"{self.base_url}/words/random?count=5")
        self.assertEqual(response.status_code, 200)
        words = response.json()
        self.assertEqual(len(words), 5)
        self.test_word_id = words[0]["id"]  # Save for later tests
        print(f"✅ Random words endpoint test passed. Got {len(words)} words")
        return words

    def test_04_get_category_specific_words(self):
        """Test getting words from a specific category"""
        categories = self.test_02_get_categories()
        if not categories:
            self.skipTest("No categories available")
        
        test_category = categories[0]
        print(f"\n🔍 Testing category-specific words endpoint for '{test_category}'...")
        response = requests.get(f"{self.base_url}/words/random?category={test_category}&count=3")
        self.assertEqual(response.status_code, 200)
        words = response.json()
        self.assertTrue(len(words) > 0)
        for word in words:
            self.assertEqual(word["category"], test_category)
        print(f"✅ Category-specific words test passed. Got {len(words)} words in '{test_category}' category")

    def test_05_get_multiple_choice_quiz(self):
        """Test getting a multiple choice quiz"""
        print("\n🔍 Testing multiple choice quiz endpoint...")
        response = requests.get(f"{self.base_url}/quiz/multiple-choice?count=3")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("questions", data)
        self.assertEqual(len(data["questions"]), 3)
        
        # Verify quiz structure
        for question in data["questions"]:
            self.assertIn("id", question)
            self.assertIn("english", question)
            self.assertIn("options", question)
            self.assertEqual(len(question["options"]), 4)
            
            # Check that exactly one option is correct
            correct_options = [opt for opt in question["options"] if opt["correct"]]
            self.assertEqual(len(correct_options), 1)
        
        print(f"✅ Multiple choice quiz test passed. Got {len(data['questions'])} questions")
        return data

    def test_06_get_category_specific_quiz(self):
        """Test getting a quiz for a specific category"""
        categories = self.test_02_get_categories()
        if not categories:
            self.skipTest("No categories available")
        
        test_category = categories[0]
        print(f"\n🔍 Testing category-specific quiz endpoint for '{test_category}'...")
        response = requests.get(f"{self.base_url}/quiz/multiple-choice?category={test_category}&count=3")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("questions", data)
        self.assertTrue(len(data["questions"]) > 0)
        print(f"✅ Category-specific quiz test passed. Got {len(data['questions'])} questions")

    def test_07_update_progress(self):
        """Test updating progress for a word"""
        if not self.test_word_id:
            words = self.test_03_get_random_words()
            self.test_word_id = words[0]["id"]
        
        print(f"\n🔍 Testing progress update endpoint for word ID: {self.test_word_id}...")
        response = requests.post(f"{self.base_url}/progress/update?word_id={self.test_word_id}&is_correct=true")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("progress", data)
        self.assertEqual(data["progress"]["word_id"], self.test_word_id)
        print("✅ Progress update test passed")

    def test_08_get_progress_stats(self):
        """Test getting progress statistics"""
        print("\n🔍 Testing progress stats endpoint...")
        response = requests.get(f"{self.base_url}/progress/stats")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify stats structure
        required_fields = [
            "total_words_studied", "mastered_words", "familiar_words", 
            "learning_words", "accuracy", "total_sessions", 
            "total_correct", "total_incorrect"
        ]
        for field in required_fields:
            self.assertIn(field, data)
        
        print("✅ Progress stats test passed")
        return data

def run_tests():
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add tests in order
    test_cases = [
        'test_01_root_endpoint',
        'test_02_get_categories',
        'test_03_get_random_words',
        'test_04_get_category_specific_words',
        'test_05_get_multiple_choice_quiz',
        'test_06_get_category_specific_quiz',
        'test_07_update_progress',
        'test_08_get_progress_stats',
    ]
    
    for test_case in test_cases:
        suite.addTest(EnglishLearningAPITester(test_case))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Return appropriate exit code
    return 0 if result.wasSuccessful() else 1

if __name__ == "__main__":
    sys.exit(run_tests())
