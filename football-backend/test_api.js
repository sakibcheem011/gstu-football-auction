const http = require('http');

async function testFetch() {
  try {
    // 1. Login
    const loginRes = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@gstu.edu', password: 'superadmin123' })
    });
    const loginData = await loginRes.json();
    console.log("Login Token:", loginData.token ? "Success" : "Failed");
    
    // 2. Fetch Players
    const res = await fetch('http://localhost:4000/auction/players', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    const players = await res.json();
    console.log("Players from API:", players);
  } catch(e) {
    console.error(e);
  }
}
testFetch();
