// Display specific button sections from product page
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'product', '[id]', 'page.jsx');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log('=== PRODUCT PAGE BUTTON SECTIONS ===\\n');
  
  // Find lines containing Add to Cart and Buy Now
  const lines = content.split('\\n');
  
  lines.forEach((line, index) => {
    if (line.includes('Add to Cart') || line.includes('Buy Now')) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
      // Show context lines
      for (let i = Math.max(0, index - 2); i <= Math.min(lines.length - 1, index + 2); i++) {
        const marker = i === index ? '>>> ' : '    ';
        console.log(`${marker}${i + 1}: ${lines[i].trim()}`);
      }
      console.log('');
    }
  });
  
  // Also show the price section structure
  console.log('=== PRICE TO BUTTON FLOW ===');
  let inPriceSection = false;
  let priceLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('<p className="text-3xl font-medium mt-6">')) {
      inPriceSection = true;
    }
    if (inPriceSection) {
      priceLines.push(`${i + 1}: ${line}`);
      if (line.includes('</div>') && line.includes('Buy Now')) {
        break;
      }
    }
  }
  
  priceLines.forEach(line => console.log(line));
  
} catch (error) {
  console.error('Error reading file:', error.message);
}