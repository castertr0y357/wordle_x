// Debug script for Wordle validation issue
import { isValidWord, WORDS } from './lib/words.js';

console.log('=== WORDLE VALIDATION DEBUG ===');

// 1. Import { isValidWord, WORDS } from '@/lib/words' - DONE

// 2. Log the value of WORDS[5] to see if it's populated
console.log('2. WORDS[5] array:');
console.log('Length:', WORDS[5] ? WORDS[5].length : 'undefined');
console.log('First 10 words:', WORDS[5] ? WORDS[5].slice(0, 10) : 'undefined');
console.log('Full WORDS[5]:', WORDS[5]);

// 3. Test isValidWord("APPLE") and log the result
console.log('\n3. Testing isValidWord("APPLE"):');
const appleResult = isValidWord("APPLE");
console.log('Result:', appleResult);

// 4. Test isValidWord("BEACH") and log the result
console.log('\n4. Testing isValidWord("BEACH"):');
const beachResult = isValidWord("BEACH");
console.log('Result:', beachResult);

// 5. Check if WORDS[5] includes "APPLE"
console.log('\n5. Check if WORDS[5] includes "APPLE":');
const includesApple = WORDS[5] ? WORDS[5].includes("APPLE") : false;
console.log('WORDS[5].includes("APPLE"):', includesApple);

// Additional debugging
console.log('\n=== ADDITIONAL DEBUG INFO ===');
console.log('WORDS object keys:', Object.keys(WORDS));
console.log('WORDS[5] type:', typeof WORDS[5]);
console.log('WORDS[5] is array:', Array.isArray(WORDS[5]));

// Test with different cases
console.log('\n=== CASE SENSITIVITY TESTS ===');
console.log('isValidWord("apple"):', isValidWord("apple"));
console.log('isValidWord("APPLE"):', isValidWord("APPLE"));
console.log('isValidWord("Apple"):', isValidWord("Apple"));

// Check the isValidWord function logic step by step
console.log('\n=== FUNCTION LOGIC DEBUG ===');
const testWord = "APPLE";
console.log(`Testing word: "${testWord}"`);
console.log(`Word length: ${testWord.length}`);
console.log(`WORDS[${testWord.length}] exists:`, !!WORDS[testWord.length]);
console.log(`WORDS[${testWord.length}] includes "${testWord.toUpperCase()}":`, 
  WORDS[testWord.length] ? WORDS[testWord.length].includes(testWord.toUpperCase()) : 'N/A');

console.log('=== DEBUG COMPLETE ===');