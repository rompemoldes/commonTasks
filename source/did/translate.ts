import * as Kilt from '@kiltprotocol/sdk-js';

import readFlags from '../flags';

import { getDidUriFromAccountHex, getAccountHexFromDidUri } from './coding';

translate().then(() => process.exit());

/**
 * Translates from a `HexString of Account Address` to it's corresponding `DID-URI` and vice versa.
 */
async function translate(inputDid?: string) {
  const flags = await readFlags();

  inputDid = inputDid ?? flags.input;

  if (!inputDid) {
    throw new Error('No DID Input to translate passed');
  }

  // new line for better visualization
  console.log('\n');

  if (inputDid.startsWith('0x')) {
    return flags.verbose
      ? getDidUriFromAccountHex(inputDid, true)
      : console.log(getDidUriFromAccountHex(inputDid));
  }
  return flags.verbose
    ? getAccountHexFromDidUri(inputDid as Kilt.DidUri, true)
    : console.log(getAccountHexFromDidUri(inputDid as Kilt.DidUri));
}
