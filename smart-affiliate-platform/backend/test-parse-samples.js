const { parseNLPQuery } = require('./utils/nlpParser');

const samples = [
  "i'm looking for a gaming laptop under 50000 in amazon",
  "need a smartphone around 30k on flipkart",
  "casual shoes between 2000 to 4000 on myntra",
  "looking for earbuds below 5k amazon.in",
  "budget: 1.5 lakhs for a laptop amazon and flipkart",
  "want a TV 55 inch 40,000 flipkart",
  "laptop 50k-80k amazon",
  "seeking a phone max 15000",
  "looking for running shoes up to rs. 2500 myntra",
  "need a 16GB RAM laptop under 80k"
];

for (const s of samples) {
  const p = parseNLPQuery(s);
  console.log('INPUT:', s);
  console.log(' -> category:', p.category, ' maxPrice:', p.maxPrice, ' minPrice:', p.minPrice, ' platforms:', p.platforms, ' tags:', p.tags);
  console.log('---');
}
