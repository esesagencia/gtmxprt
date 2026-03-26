async function testScout() {
  const payload = {
    html_snippet: "<html><body><button id='contact'>Contact Us</button></body></html>",
    client: { name: "Test Client", url: "test.com" }
  };

  try {
    console.log('Sending scout request...');
    const res = await fetch('http://localhost:3000/api/scout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('Response status:', res.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Request failed:', err);
  }
}

testScout();
