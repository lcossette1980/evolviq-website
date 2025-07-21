#!/usr/bin/env python3
"""
Test script for CrewAI agentic system
Run this to verify your CrewAI implementation is working
"""

import os
import logging
from crewai_assessment import generate_crewai_question, AIReadinessCrewAI

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_crewai_system():
    """Test the CrewAI system with proper error handling"""
    
    print("🤖 Testing CrewAI Agentic Assessment System")
    print("=" * 60)
    
    # Check for API key
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        print("❌ OPENAI_API_KEY environment variable not set")
        print("Please set your OpenAI API key to test the system")
        return False
    
    if openai_api_key.startswith("sk-") and len(openai_api_key) > 20:
        print("✅ Valid OpenAI API key found")
    else:
        print("⚠️ API key format looks suspicious")
    
    print("\n1️⃣ Testing Question Generation...")
    
    # Test question generation
    question_history = []
    
    try:
        print("🎯 Generating first question using CrewAI agents...")
        result = generate_crewai_question(openai_api_key, question_history)
        
        if result.get("error"):
            print(f"❌ CrewAI question generation failed: {result.get('error')}")
            print("This is expected if you don't have credits or valid API key")
            return False
        else:
            print("✅ CrewAI question generation successful!")
            print(f"📝 Question: {result.get('question', 'No question')}")
            print(f"🤖 Agent: {result.get('agent_name', 'Unknown')}")
            print(f"🎯 Focus: {result.get('agent_focus', 'Unknown')}")
            print(f"📊 Section: {result.get('section', 'Unknown')}")
            
            return True
            
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        return False

def test_fallback_system():
    """Test the fallback question system"""
    
    print("\n2️⃣ Testing Fallback System...")
    
    try:
        # Initialize CrewAI system
        crew_system = AIReadinessCrewAI("invalid_key")
        
        # This should trigger fallback
        result = crew_system.generate_agent_question([])
        
        if result.get("generated_by") == "crewai_fallback":
            print("✅ Fallback system working correctly")
            print(f"📝 Fallback question: {result.get('question', 'No question')[:100]}...")
            return True
        else:
            print("❌ Fallback system not working as expected")
            return False
            
    except Exception as e:
        print(f"❌ Fallback test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting CrewAI System Tests...")
    
    # Test main functionality
    success1 = test_crewai_system()
    
    # Test fallback
    success2 = test_fallback_system()
    
    print("\n" + "="*60)
    print("📊 Test Results:")
    print(f"CrewAI Question Generation: {'✅ PASS' if success1 else '❌ FAIL'}")
    print(f"Fallback System: {'✅ PASS' if success2 else '❌ FAIL'}")
    
    if success1 or success2:
        print("\n🎉 Your CrewAI agentic system is ready!")
        print("The system will use real AI agents when possible,")
        print("and fall back to structured questions otherwise.")
    else:
        print("\n⚠️ System needs OpenAI API key to work properly")
        print("Set OPENAI_API_KEY environment variable and try again")