const http = require('http');

console.log('🔍 Testing Vite dev server at http://localhost:5173\n');

// Test 1: Fetch HTML
http.get('http://localhost:5173', (res) => {
  let html = '';
  res.on('data', (chunk) => { html += chunk; });
  res.on('end', () => {
    console.log('✅ HTML Response (Status:', res.statusCode, ')');
    console.log('Length:', html.length, 'bytes\n');
    console.log('HTML Content:');
    console.log(html);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Check for script tags
    const scriptMatches = html.match(/<script[^>]*src="([^"]+)"[^>]*>/g);
    if (scriptMatches) {
      console.log('📜 Found', scriptMatches.length, 'script tag(s):');
      scriptMatches.forEach((tag, i) => {
        const src = tag.match(/src="([^"]+)"/)[1];
        console.log(`  ${i + 1}. ${src}`);
        
        // Test if script is accessible
        const scriptUrl = src.startsWith('http') ? src : `http://localhost:5173${src}`;
        http.get(scriptUrl, (scriptRes) => {
          console.log(`     Status: ${scriptRes.statusCode}`);
        }).on('error', (err) => {
          console.log(`     ❌ Error: ${err.message}`);
        });
      });
    } else {
      console.log('⚠️  No script tags found!');
    }
  });
}).on('error', (err) => {
  console.error('❌ Error fetching HTML:', err.message);
});
