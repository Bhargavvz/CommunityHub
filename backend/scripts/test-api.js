#!/usr/bin/env node

/**
 * Simple script to test API endpoints
 * Usage: node test-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:8000';
const endpoints = [
  '/health',
  '/api',
  '/api/test/firebase'
];

async function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`Testing endpoint: ${url}`);
    
    http.get(url, (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];
      
      let error;
      if (statusCode !== 200) {
        error = new Error(`Request Failed.\nStatus Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error(`Invalid content-type.\nExpected application/json but received ${contentType}`);
      }
      
      if (error) {
        console.error(`❌ ${error.message}`);
        res.resume();
        resolve(false);
        return;
      }
      
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          console.log(`✅ Response: ${JSON.stringify(parsedData, null, 2)}`);
          resolve(true);
        } catch (e) {
          console.error(`❌ Error parsing JSON: ${e.message}`);
          resolve(false);
        }
      });
    }).on('error', (e) => {
      console.error(`❌ HTTP Error: ${e.message}`);
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('API Endpoint Test Script');
  console.log('========================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    try {
      const success = await testEndpoint(endpoint);
      if (success) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      failed++;
    }
    console.log('-------------------');
  }
  
  console.log('');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  
  return failed === 0;
}

runTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }); 