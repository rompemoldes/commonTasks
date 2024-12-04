function stringer(input: any) {
  console.log('Input: ', input);
  console.log(`Direct parse: ${input}.`);

  const stringified = String(input);

  console.log('stringified: ', stringified);
  console.log('Is it true? ', Boolean(stringified));
  console.log('Is it truthy? ', stringified ? 'yes' : 'no');

  const numberified = parseInt(input, 10);
  console.log('numberified: ', numberified);

  console.log('Is it true? ', Boolean(numberified));
  console.log('Is it truthy? ', numberified ? 'yes' : 'no');
  console.log('Is it Not a Number? ', Number.isNaN(numberified));
}

stringer(null);
