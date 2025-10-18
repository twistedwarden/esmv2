// Quick Sanctum Token Tester for GSPH
// Paste this in browser console (F12)

async function testSanctumToken() {
  console.log('=== GSPH Sanctum Token Tester ===\n');
  
  // 1. Check token exists
  const token = localStorage.getItem('auth_token');
  console.log('1️⃣ Token Check:');
  console.log('   Exists:', !!token);
  
  if (!token) {
    console.log('   ❌ NO TOKEN FOUND');
    console.log('   Solution: Login to get a token');
    return;
  }
  
  console.log('   Preview:', token.substring(0, 40) + '...');
  console.log('   Length:', token.length);
  
  // 2. Test /api/user endpoint
  console.log('\n2️⃣ Testing /api/user...');
  try {
    const userResponse = await fetch('https://auth-gsph.up.railway.app/api/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   Status:', userResponse.status, userResponse.statusText);
    const userData = await userResponse.json();
    console.log('   Response:', userData);
    
    if (userResponse.ok && userData.success) {
      console.log('   ✅ TOKEN IS VALID');
      console.log('   User:', userData.data?.user?.email, '-', userData.data?.user?.role);
    } else {
      console.log('   ❌ TOKEN IS INVALID');
      console.log('   Solution: Clear localStorage and re-login');
      return;
    }
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    return;
  }
  
  // 3. Test dashboard endpoint
  console.log('\n3️⃣ Testing /api/dashboard/overview...');
  try {
    const dashboardResponse = await fetch('https://auth-gsph.up.railway.app/api/dashboard/overview', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   Status:', dashboardResponse.status, dashboardResponse.statusText);
    const dashboardData = await dashboardResponse.json();
    console.log('   Response:', dashboardData);
    
    if (dashboardResponse.ok && dashboardData.success) {
      console.log('   ✅ DASHBOARD WORKS!');
      console.log('   Data:', dashboardData.data);
    } else {
      console.log('   ❌ DASHBOARD FAILED');
      if (dashboardResponse.status === 401) {
        console.log('   Reason: Unauthorized (token issue)');
      } else if (dashboardResponse.status === 403) {
        console.log('   Reason: Forbidden (permission issue)');
      } else if (dashboardResponse.status === 500) {
        console.log('   Reason: Server error');
      }
    }
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
  }
  
  // 4. Summary
  console.log('\n📊 SUMMARY:');
  console.log('   - Token stored: ✅');
  console.log('   - Run test again to see current status');
  console.log('\n💡 SOLUTION:');
  console.log('   If you see 401 errors, run:');
  console.log('   localStorage.clear(); location.reload();');
  console.log('   Then login again');
}

// Run the test
testSanctumToken();

