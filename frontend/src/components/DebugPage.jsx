import React, { useEffect, useState } from 'react';
import { isValidWord, WORDS } from '@/lib/words';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const DebugPage = () => {
  const [debugResults, setDebugResults] = useState({});

  useEffect(() => {
    // Run all the debug tests as requested
    const results = {};
    
    // 1. Log the value of WORDS[5] to see if it's populated
    console.log('WORDS[5]:', WORDS[5]);
    results.words5Length = WORDS[5] ? WORDS[5].length : 0;
    results.words5Sample = WORDS[5] ? WORDS[5].slice(0, 10) : [];
    
    // 2. Test isValidWord("APPLE") and log the result
    const appleResult = isValidWord("APPLE");
    console.log('isValidWord("APPLE"):', appleResult);
    results.appleTest = appleResult;
    
    // 3. Test isValidWord("BEACH") and log the result
    const beachResult = isValidWord("BEACH");
    console.log('isValidWord("BEACH"):', beachResult);
    results.beachTest = beachResult;
    
    // 4. Check if WORDS[5] includes "APPLE"
    const includesApple = WORDS[5] ? WORDS[5].includes("APPLE") : false;
    console.log('WORDS[5].includes("APPLE"):', includesApple);
    results.includesApple = includesApple;
    
    // Additional debug tests
    results.words6Length = WORDS[6] ? WORDS[6].length : 0;
    results.words7Length = WORDS[7] ? WORDS[7].length : 0;
    results.words8Length = WORDS[8] ? WORDS[8].length : 0;
    
    // Test some 7-letter words that were mentioned in the test results
    const airportResult = isValidWord("AIRPORT");
    console.log('isValidWord("AIRPORT"):', airportResult);
    results.airportTest = airportResult;
    
    const addressResult = isValidWord("ADDRESS");
    console.log('isValidWord("ADDRESS"):', addressResult);
    results.addressTest = addressResult;
    
    // Test invalid words
    const invalidResult = isValidWord("AAAAA");
    console.log('isValidWord("AAAAA"):', invalidResult);
    results.invalidTest = invalidResult;
    
    const invalidResult2 = isValidWord("AAAAAAA");
    console.log('isValidWord("AAAAAAA"):', invalidResult2);
    results.invalidTest2 = invalidResult2;
    
    // Check if WORDS[7] includes the test words
    results.words7IncludesAirport = WORDS[7] ? WORDS[7].includes("AIRPORT") : false;
    results.words7IncludesAddress = WORDS[7] ? WORDS[7].includes("ADDRESS") : false;
    
    setDebugResults(results);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Wordle Validation Debug</h1>
        </div>
        
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Word Lists Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{debugResults.words5Length}</div>
                <div className="text-sm text-muted-foreground">5-letter words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{debugResults.words6Length}</div>
                <div className="text-sm text-muted-foreground">6-letter words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{debugResults.words7Length}</div>
                <div className="text-sm text-muted-foreground">7-letter words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{debugResults.words8Length}</div>
                <div className="text-sm text-muted-foreground">8-letter words</div>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">WORDS[5] Sample (First 10 words)</h2>
            <div className="flex flex-wrap gap-2">
              {debugResults.words5Sample && debugResults.words5Sample.map((word, index) => (
                <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm font-mono">
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Validation Tests</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-mono">isValidWord("APPLE")</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  debugResults.appleTest ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugResults.appleTest ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-mono">isValidWord("BEACH")</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  debugResults.beachTest ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugResults.beachTest ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-mono">WORDS[5].includes("APPLE")</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  debugResults.includesApple ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugResults.includesApple ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-mono">isValidWord("AIRPORT") [7 letters]</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  debugResults.airportTest ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugResults.airportTest ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-mono">isValidWord("ADDRESS") [7 letters]</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  debugResults.addressTest ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugResults.addressTest ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-mono">isValidWord("AAAAA") [invalid]</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  !debugResults.invalidTest ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugResults.invalidTest ? 'TRUE (ERROR!)' : 'FALSE (CORRECT)'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-mono">isValidWord("AAAAAAA") [invalid 7-letter]</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  !debugResults.invalidTest2 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugResults.invalidTest2 ? 'TRUE (ERROR!)' : 'FALSE (CORRECT)'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Word List Inclusion Tests</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-mono">WORDS[7].includes("AIRPORT")</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  debugResults.words7IncludesAirport ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugResults.words7IncludesAirport ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-mono">WORDS[7].includes("ADDRESS")</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  debugResults.words7IncludesAddress ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugResults.words7IncludesAddress ? 'TRUE' : 'FALSE'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Console Output</h2>
            <p className="text-sm text-muted-foreground">
              Check the browser console (F12) for detailed logging output from the isValidWord function.
              The function logs each validation attempt with the word, length, and result.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;