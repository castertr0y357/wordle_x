import React, { useEffect, useState } from 'react';
import { isValidWord, WORDS } from '@/lib/words';

const DebugPage = () => {
  const [debugResults, setDebugResults] = useState([]);

  useEffect(() => {
    const results = [];
    
    // Helper function to log and store results
    const debugLog = (message, value = '') => {
      const logEntry = `${message}${value ? ': ' + JSON.stringify(value) : ''}`;
      console.log(logEntry);
      results.push(logEntry);
    };

    debugLog('=== WORDLE VALIDATION DEBUG ===');

    // 1. Import { isValidWord, WORDS } from '@/lib/words' - DONE
    debugLog('1. Import completed successfully');

    // 2. Log the value of WORDS[5] to see if it's populated
    debugLog('2. WORDS[5] analysis');
    debugLog('   WORDS[5] exists', !!WORDS[5]);
    debugLog('   WORDS[5] length', WORDS[5] ? WORDS[5].length : 'undefined');
    debugLog('   WORDS[5] first 10 words', WORDS[5] ? WORDS[5].slice(0, 10) : 'undefined');

    // 3. Test isValidWord("APPLE") and log the result
    debugLog('3. Testing isValidWord("APPLE")');
    const appleResult = isValidWord("APPLE");
    debugLog('   Result', appleResult);

    // 4. Test isValidWord("BEACH") and log the result
    debugLog('4. Testing isValidWord("BEACH")');
    const beachResult = isValidWord("BEACH");
    debugLog('   Result', beachResult);

    // 5. Check if WORDS[5] includes "APPLE"
    debugLog('5. Check if WORDS[5] includes "APPLE"');
    const includesApple = WORDS[5] ? WORDS[5].includes("APPLE") : false;
    debugLog('   WORDS[5].includes("APPLE")', includesApple);

    // Additional debugging
    debugLog('=== ADDITIONAL DEBUG INFO ===');
    debugLog('WORDS object keys', Object.keys(WORDS));
    debugLog('WORDS[5] type', typeof WORDS[5]);
    debugLog('WORDS[5] is array', Array.isArray(WORDS[5]));

    // Test with different cases
    debugLog('=== CASE SENSITIVITY TESTS ===');
    debugLog('isValidWord("apple")', isValidWord("apple"));
    debugLog('isValidWord("APPLE")', isValidWord("APPLE"));
    debugLog('isValidWord("Apple")', isValidWord("Apple"));

    // Check the isValidWord function logic step by step
    debugLog('=== FUNCTION LOGIC DEBUG ===');
    const testWord = "APPLE";
    debugLog(`Testing word: "${testWord}"`);
    debugLog(`Word length`, testWord.length);
    debugLog(`WORDS[${testWord.length}] exists`, !!WORDS[testWord.length]);
    debugLog(`WORDS[${testWord.length}] includes "${testWord.toUpperCase()}"`, 
      WORDS[testWord.length] ? WORDS[testWord.length].includes(testWord.toUpperCase()) : 'N/A');

    // Test some other words from the list
    debugLog('=== TESTING OTHER WORDS FROM LIST ===');
    const testWords = ["BRAIN", "BREAD", "CHAIR", "CLOCK", "DANCE"];
    testWords.forEach(word => {
      debugLog(`isValidWord("${word}")`, isValidWord(word));
    });

    // Test invalid words
    debugLog('=== TESTING INVALID WORDS ===');
    const invalidWords = ["AAAAA", "ZZZZZ", "HELLO"];
    invalidWords.forEach(word => {
      debugLog(`isValidWord("${word}")`, isValidWord(word));
    });

    debugLog('=== DEBUG COMPLETE ===');
    
    setDebugResults([...results]);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Wordle Validation Debug</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Results:</h2>
        <pre className="text-sm overflow-auto max-h-96">
          {debugResults.join('\n')}
        </pre>
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Live Tests:</h2>
        <div className="space-y-2">
          <div>
            <strong>isValidWord("APPLE"):</strong> {String(isValidWord("APPLE"))}
          </div>
          <div>
            <strong>isValidWord("BEACH"):</strong> {String(isValidWord("BEACH"))}
          </div>
          <div>
            <strong>WORDS[5] includes "APPLE":</strong> {String(WORDS[5]?.includes("APPLE"))}
          </div>
          <div>
            <strong>WORDS[5] length:</strong> {WORDS[5]?.length || 'undefined'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;