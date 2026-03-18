// Helper to safely get a value, handling null, undefined, but preserving falsy values (false, 0, '')
function safeValue(value, defaultValue = '') {
  return (value !== null && value !== undefined) ? value : defaultValue;
}

// Helper to safely get JSON field (handles both string and object)
function safeJsonValue(value, defaultValue = '[]') {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return JSON.stringify(value);
  return defaultValue;
}

// Test cases
console.log('Testing safeValue:');
console.log('  safeValue("test") =', safeValue("test")); // "test"
console.log('  safeValue(false) =', safeValue(false)); // false (not "")
console.log('  safeValue(0) =', safeValue(0)); // 0 (not "")
console.log('  safeValue(null) =', safeValue(null)); // ""
console.log('  safeValue(undefined) =', safeValue(undefined)); // ""

console.log('\nTesting safeJsonValue:');
console.log('  safeJsonValue(\'["a"]\') =', safeJsonValue('["a"]')); // '["a"]'
console.log('  safeJsonValue(["a"]) =', safeJsonValue(["a"])); // '["a"]'
console.log('  safeJsonValue(null) =', safeJsonValue(null)); // '[]'



