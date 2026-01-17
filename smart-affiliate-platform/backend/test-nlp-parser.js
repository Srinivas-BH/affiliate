/**
 * NLP Parser Testing Suite
 * Tests the enhanced NLP parser with various real-world user inputs
 */

const { parseNLPQuery } = require('./utils/nlpParser');

// Test cases covering different user input styles
const testCases = [
  // --- PRICE DETECTION TESTS ---
  {
    input: "I'm looking for a gaming laptop under 80000",
    desc: "Simple price with 'under'"
  },
  {
    input: "laptop below 1 lakh",
    desc: "Lakh notation"
  },
  {
    input: "mobile phone max budget 30k from amazon",
    desc: "With max and platform"
  },
  {
    input: "I need running shoes 2000 to 5000 rupees",
    desc: "Price range format"
  },
  {
    input: "Looking for a smartphone within 25k-50k",
    desc: "Range with k notation"
  },
  {
    input: "gaming pc above 50000 budget",
    desc: "Minimum price"
  },
  {
    input: "tv set between 30000 and 60000",
    desc: "Between X and Y format"
  },
  {
    input: "airpods under rs 10000",
    desc: "Currency with rupees"
  },
  
  // --- PLATFORM DETECTION TESTS ---
  {
    input: "looking for laptop from flipkart under 70k",
    desc: "With Flipkart"
  },
  {
    input: "search smartwatch on amazon 5k max",
    desc: "With Amazon"
  },
  {
    input: "i want to buy dress from myntra under 2000",
    desc: "With Myntra"
  },
  {
    input: "meesho saree 3000-5000",
    desc: "With Meesho"
  },
  
  // --- CATEGORY DETECTION TESTS ---
  {
    input: "I need a gaming laptop for programming",
    desc: "Laptop category"
  },
  {
    input: "looking for apple iphone under 50000",
    desc: "Mobile phone category"
  },
  {
    input: "want smart tv 55 inch 4k",
    desc: "TV category"
  },
  {
    input: "need wireless earbuds for gym",
    desc: "Audio/Earbuds category"
  },
  {
    input: "looking for casual shoes 41 size",
    desc: "Fashion/Shoes category"
  },
  {
    input: "want washing machine top load",
    desc: "Home appliance category"
  },
  {
    input: "looking for smartwatch fitness tracking",
    desc: "Wearables category"
  },
  
  // --- COMPLEX TESTS ---
  {
    input: "gaming laptop with 16gb ram under 80k from amazon",
    desc: "Complex: category + specs + price + platform"
  },
  {
    input: "I'm looking for a realme phone 6gb ram budget upto 20000 from flipkart",
    desc: "Complex: brand + specs + price + platform"
  },
  {
    input: "need best running shoes size 9 between 2000 to 4000 on myntra",
    desc: "Complex: category + specs + range + platform"
  },
  {
    input: "want oneplus 5g mobile under 40k",
    desc: "Brand recognition"
  },
  {
    input: "looking for canon dslr camera professional use around 80000",
    desc: "Professional camera"
  },
  {
    input: "i prefer hp laptop 15 inch 512gb ssd minimum price 40k maximum 75k",
    desc: "Multiple specs and explicit min/max"
  },
  
  // --- EDGE CASES ---
  {
    input: "laptop",
    desc: "Category only"
  },
  {
    input: "50000",
    desc: "Price only"
  },
  {
    input: "phone from amazon",
    desc: "Category and platform"
  },
  {
    input: "iphone 14 pro max",
    desc: "Brand and model (should extract brand)"
  },
  {
    input: "just get me something nice within 5-10k",
    desc: "Vague with range"
  }
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Run tests
console.log(`\n${colors.bright}${colors.cyan}=== NLP PARSER TEST SUITE ===${colors.reset}\n`);

let passCount = 0;
let totalCount = testCases.length;

testCases.forEach((test, index) => {
  const result = parseNLPQuery(test.input);
  
  console.log(`${colors.bright}Test ${index + 1}: ${test.desc}${colors.reset}`);
  console.log(`${colors.blue}Input:${colors.reset} "${test.input}"`);
  console.log(`${colors.green}Results:${colors.reset}`);
  console.log(`  Category: ${result.category || '❌ Not detected'}`);
  console.log(`  Max Price: ${result.maxPrice ? `₹${result.maxPrice.toLocaleString()}` : '❌ Not detected'}`);
  console.log(`  Min Price: ${result.minPrice && result.minPrice > 0 ? `₹${result.minPrice.toLocaleString()}` : 'Not specified'}`);
  console.log(`  Platforms: ${result.platforms.length > 0 ? result.platforms.join(', ') : '❌ Not detected'}`);
  console.log(`  Tags: ${result.tags.length > 0 ? result.tags.join(', ') : 'None'}`);
  
  // Check if important fields were extracted
  const hasCategory = result.category !== null;
  const hasPrice = result.maxPrice !== null || (result.minPrice && result.minPrice > 0);
  const isPassed = hasCategory || hasPrice || result.platforms.length > 0;
  
  if (isPassed) {
    console.log(`${colors.green}✅ PASS${colors.reset}`);
    passCount++;
  } else {
    console.log(`${colors.yellow}⚠️  WARNING${colors.reset} - Could not extract key information`);
  }
  
  console.log('');
});

// Summary
const successRate = ((passCount / totalCount) * 100).toFixed(1);
console.log(`${colors.bright}${colors.cyan}=== TEST SUMMARY ===${colors.reset}`);
console.log(`Passed: ${colors.green}${passCount}/${totalCount}${colors.reset}`);
console.log(`Success Rate: ${colors.green}${successRate}%${colors.reset}\n`);
