const http = require('http');

function testAiChat(prompt) {
  const data = JSON.stringify({ message: prompt });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/ai/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('--- TEST PROMPT:', prompt, '---');
      console.log('STATUS:', res.statusCode);
      try {
        const json = JSON.parse(body);
        console.log('RESPONSE MESSAGE:', json.message);
        console.log('ACTIONS:', json.actions);
      } catch (e) {
        console.log('RAW BODY:', body);
      }
      console.log('\n');
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.write(data);
  req.end();
}

console.log('Testing 11 New AI Capabilities...\n');
testAiChat('Draft Amharic Lease Agreement for my house');
setTimeout(() => testAiChat('Calculate commute time to Kazanchis'), 1500);
setTimeout(() => testAiChat('Calculate roommate split for 2 roommates'), 3000);
