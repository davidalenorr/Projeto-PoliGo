const { parseFlexibleNumber, numbersEqual, parsePairInput } = require('../src/utils/equationValidation');

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exitCode = 1;
  } else {
    console.log('ok:', message);
  }
}

console.log('Running equation validation tests...');

// parseFlexibleNumber
assert(parseFlexibleNumber('5') === 5, "parse '5'");
assert(parseFlexibleNumber('  7 ') === 7, "parse '  7 '");
assert(numbersEqual(parseFlexibleNumber('23/5'), 23/5), "parse fraction '23/5'");
assert(numbersEqual(parseFlexibleNumber('4,5'), 4.5), "parse comma decimal '4,5'");
assert(parseFlexibleNumber('foo') === null, "invalid input returns null");

// numbersEqual
assert(numbersEqual(1.00001, 1.0, 1e-6) === false, 'tolerance correctly detects difference');
assert(numbersEqual(1.000000001, 1.0, 1e-6) === true, 'tiny difference within tolerance');

// parsePairInput
const pair = parsePairInput('4', '3');
assert(pair && pair.x === 4 && pair.y === 3, 'parse pair ints');
const pair2 = parsePairInput('6', '4');
assert(pair2 && pair2.x === 6 && pair2.y === 4, 'parse pair ints 2');

if (process.exitCode === 1) {
  console.error('Some tests failed.');
  process.exit(1);
}

console.log('All tests passed.');
