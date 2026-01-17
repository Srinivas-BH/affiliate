const { parseNLPQuery } = require('./utils/nlpParser');

const input = "i'm looking for a gaming laptop under 50000 in amazon";
const result = parseNLPQuery(input);

console.log('Input:', input);
console.log('Category:', result.category);
console.log('Price:', result.maxPrice);
console.log('Platform:', result.platforms);

const isValid = result.category && result.maxPrice && result.platforms.length > 0;
console.log('\nAnswer:', isValid ? 'YES' : 'NO');
