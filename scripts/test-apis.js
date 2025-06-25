
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test configuration
const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    url: `${BASE_URL}/api/health`,
    expectedStatus: [200, 503],
  },
  {
    name: 'AI Chat API',
    method: 'POST',
    url: `${BASE_URL}/api/chat`,
    data: {
      messages: [
        { role: 'user', content: 'Hello, this is a test message.' }
      ],
      model: 'gpt-3.5-turbo',
      max_tokens: 50,
    },
    expectedStatus: [200, 403],
  },
  {
    name: 'Hume Emotion Analysis',
    method: 'POST',
    url: `${BASE_URL}/api/hume/analyze`,
    data: {
      text: 'I am feeling very happy today!',
      type: 'text',
    },
    expectedStatus: [200, 403],
  },
  {
    name: 'ElevenLabs Voice Synthesis',
    method: 'POST',
    url: `${BASE_URL}/api/elevenlabs/synthesize`,
    data: {
      text: 'Hello, this is a test.',
      voice_id: 'pNInz6obpgDQGcFmaJgB',
    },
    expectedStatus: [200, 403],
  },
];

async function runTest(test) {
  console.log(`\n🧪 Testing: ${test.name}`);
  console.log(`   URL: ${test.url}`);
  
  try {
    const config = {
      method: test.method,
      url: test.url,
      timeout: 30000,
      validateStatus: () => true, // Don't throw on any status
    };
    
    if (test.data) {
      config.data = test.data;
      config.headers = {
        'Content-Type': 'application/json',
      };
    }
    
    const response = await axios(config);
    
    const isExpectedStatus = test.expectedStatus.includes(response.status);
    const statusIcon = isExpectedStatus ? '✅' : '❌';
    
    console.log(`   Status: ${response.status} ${statusIcon}`);
    
    if (response.data) {
      if (typeof response.data === 'object') {
        console.log(`   Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
      } else {
        console.log(`   Response: ${response.data.toString().substring(0, 100)}...`);
      }
    }
    
    return {
      name: test.name,
      status: response.status,
      success: isExpectedStatus,
      response: response.data,
    };
    
  } catch (error) {
    console.log(`   Error: ❌ ${error.message}`);
    return {
      name: test.name,
      status: 0,
      success: false,
      error: error.message,
    };
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Tests...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  const results = [];
  
  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name} (${result.status})`);
  });
  
  console.log(`\n🎯 Results: ${passed}/${total} tests passed`);
  
  // Save results to file
  const reportPath = '/tmp/api-test-results.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Detailed results saved to: ${reportPath}`);
  
  return results;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, runTest };
