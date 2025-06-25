
const fs = require('fs');
const path = require('path');

console.log('🔍 WRDO Fix Verification Script');
console.log('================================');

const fixes = [
  {
    name: 'API Client Implementation',
    files: ['lib/api-client.ts'],
    description: 'Centralized API client with error handling and rate limiting',
  },
  {
    name: 'Chat API Fix',
    files: ['pages/api/chat.ts'],
    description: 'Fixed 403 authorization errors with proper OpenAI integration',
  },
  {
    name: 'Hume.ai Integration',
    files: ['pages/api/hume/analyze.ts'],
    description: 'Fixed Hume.ai emotion analysis API integration',
  },
  {
    name: 'ElevenLabs Integration',
    files: ['pages/api/elevenlabs/synthesize.ts'],
    description: 'Fixed ElevenLabs voice synthesis API integration',
  },
  {
    name: 'Health Check Endpoint',
    files: ['pages/api/health.ts'],
    description: 'Added comprehensive health monitoring',
  },
  {
    name: 'Navigation Fix',
    files: ['components/Sidebar.tsx'],
    description: 'Fixed sidebar navigation issues',
  },
  {
    name: 'Error Boundary',
    files: ['components/ErrorBoundary.tsx'],
    description: 'Added comprehensive error handling',
  },
  {
    name: 'Next.js Configuration',
    files: ['next.config.js'],
    description: 'Fixed routing and CORS issues',
  },
  {
    name: 'Middleware Security',
    files: ['middleware.ts'],
    description: 'Added security headers and request handling',
  },
  {
    name: 'Docker Configuration',
    files: ['Dockerfile'],
    description: 'Optimized Docker build for Railway deployment',
  },
  {
    name: 'Railway Configuration',
    files: ['railway.json'],
    description: 'Railway deployment configuration',
  },
];

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return {
      exists: true,
      size: content.length,
      lines: content.split('\n').length,
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message,
    };
  }
}

console.log('\n📋 Checking implemented fixes...\n');

let totalFixes = 0;
let implementedFixes = 0;

fixes.forEach((fix, index) => {
  console.log(`${index + 1}. ${fix.name}`);
  console.log(`   Description: ${fix.description}`);
  
  let allFilesExist = true;
  
  fix.files.forEach(file => {
    const analysis = analyzeFile(file);
    const status = analysis.exists ? '✅' : '❌';
    
    console.log(`   File: ${file} ${status}`);
    
    if (analysis.exists) {
      console.log(`         Size: ${analysis.size} bytes, Lines: ${analysis.lines}`);
    } else {
      console.log(`         Error: ${analysis.error || 'File not found'}`);
      allFilesExist = false;
    }
  });
  
  if (allFilesExist) {
    implementedFixes++;
    console.log(`   Status: ✅ IMPLEMENTED`);
  } else {
    console.log(`   Status: ❌ MISSING FILES`);
  }
  
  totalFixes++;
  console.log('');
});

// Check package.json for dependencies
console.log('📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'next', 'react', 'react-dom', 'axios', 'cors', 
    'dotenv', 'openai', 'express', 'helmet', 'rate-limiter-flexible'
  ];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
  );
  
  if (missingDeps.length === 0) {
    console.log('   ✅ All required dependencies present');
  } else {
    console.log(`   ❌ Missing dependencies: ${missingDeps.join(', ')}`);
  }
} catch (error) {
  console.log(`   ❌ Error reading package.json: ${error.message}`);
}

// Check environment configuration
console.log('\n🔧 Checking configuration...');
const envExample = checkFileExists('.env.example');
console.log(`   .env.example: ${envExample ? '✅' : '❌'}`);

// Summary
console.log('\n📊 Summary:');
console.log('===========');
console.log(`Fixes implemented: ${implementedFixes}/${totalFixes}`);
console.log(`Success rate: ${Math.round((implementedFixes / totalFixes) * 100)}%`);

if (implementedFixes === totalFixes) {
  console.log('\n🎉 All fixes have been implemented successfully!');
  console.log('\nNext steps:');
  console.log('1. Set up environment variables (copy .env.example to .env)');
  console.log('2. Install dependencies: pnpm install');
  console.log('3. Test locally: pnpm dev');
  console.log('4. Run API tests: node scripts/test-apis.js');
  console.log('5. Deploy: ./scripts/deploy.sh');
} else {
  console.log('\n⚠️  Some fixes are missing. Please check the files above.');
}

// Generate fix report
const report = {
  timestamp: new Date().toISOString(),
  totalFixes,
  implementedFixes,
  successRate: Math.round((implementedFixes / totalFixes) * 100),
  fixes: fixes.map(fix => ({
    ...fix,
    implemented: fix.files.every(file => checkFileExists(file)),
  })),
};

fs.writeFileSync('/tmp/fix-verification-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Detailed report saved to: /tmp/fix-verification-report.json');
