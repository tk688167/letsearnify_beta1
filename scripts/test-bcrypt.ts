import bcrypt from 'bcryptjs';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

// Test bcrypt hash generation
async function testHash() {
  console.log('Testing bcrypt hash generation...\n');
  
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  console.log('Generated hash:', hash);
  
  const isValid = await bcrypt.compare(ADMIN_PASSWORD, hash);
  console.log('Verification result:', isValid);
  
  console.log('\n✅ Bcrypt is working correctly');
  console.log(`Password: ${ADMIN_PASSWORD}`);
}

testHash();
