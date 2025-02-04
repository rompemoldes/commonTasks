import { isBigInt64Array, isBigUint64Array } from 'node:util/types';

function stringer(input: any) {
  console.log('Input: ', input);
  console.log(`Direct parse: ${input}`);

  const stringified = String(input);

  console.log('stringified: ', stringified);
  console.log('Is it true? ', Boolean(stringified));
  console.log('Is it truthy? ', stringified ? 'yes' : 'no');

  const numberified = parseInt(input);
  console.log('numberified: ', numberified);

  console.log('Is it true? ', Boolean(numberified));
  console.log('Is it truthy? ', numberified ? 'yes' : 'no');
  console.log('Is it Not a Number? ', Number.isNaN(numberified));

  const biggerized = BigInt(input);
  console.log('biggerized: ', biggerized);

  console.log('Is it true? ', Boolean(biggerized));
  console.log('Is it truthy? ', biggerized ? 'yes' : 'no');
  console.log('Is it Not a Number? ', Number.isNaN(biggerized));
  console.log('Stringified BigInt with constructor: ', String(biggerized));
  console.log(`Stringified BigInt directly: ${biggerized} `);

  console.log(isBigUint64Array(biggerized));
  console.log(isBigInt64Array(biggerized));
}

// stringer(2 ** 1023 * 1.99999999999999);
// stringer(null);
stringer(36789093876567894n);
