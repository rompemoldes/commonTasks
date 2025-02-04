import { builtinModules as builtin } from 'node:module';

import * as Kilt from '@kiltprotocol/sdk-js';
import { u8aToHex } from '@polkadot/util';

import { getApi } from './connection';

import { ACCOUNT_MNEMONIC, DID_MNEMONIC } from './configuration';
import { getAccountHexFromDidUri, getDidUriFromAccountHex } from './did/coding';
import { generateAccount } from './generators/generateAccount';
import { generateFullDid } from './generators/generateFullDid';
import { generateKeyPairs } from './generators/generateKeyPairs';

// tryThis().then(() => process.exit());
// tryThat().then(() => process.exit());
// tryIt().then(() => process.exit());
tryItOut().then(() => process.exit());

async function tryThis() {
  const api = await getApi();
  const keys = generateKeyPairs(DID_MNEMONIC!);

  const payer = generateAccount(ACCOUNT_MNEMONIC!);
  const didDocument = await generateFullDid(payer, DID_MNEMONIC!);

  console.log('The DID: ', didDocument);

  console.log(
    'keys.assertionMethod as unit8Array: ',
    keys.assertionMethod.publicKey.toString(),
  );
  console.log(
    'keys.assertionMethod as hexadecimal number: ',
    u8aToHex(keys.assertionMethod.publicKey),
  );

  const didUriFromKey = Kilt.Did.getFullDidUriFromKey(keys.authentication);

  console.log('DID URI from key: ', didUriFromKey);

  const isUriAsExpected = didUriFromKey === didDocument.uri;
  console.log('Does life makes sense? ', isUriAsExpected);

  const chainName = (await api.rpc.system.chain()).toHuman();
  console.log('working on this blockchain: ', chainName);

  api.disconnect();
}

async function tryThat() {
  console.log('List of Node Core modules:');
  builtin.map((moduleName, index) =>
    console.log(`Module #${index}`, moduleName),
  );
}

async function tryIt() {
  const api = await getApi();

  const payer = generateAccount(ACCOUNT_MNEMONIC!);
  const didDocument = await generateFullDid(payer, DID_MNEMONIC!);

  console.log('The original DID-URI: ', didDocument.uri);

  const didHex = getAccountHexFromDidUri(didDocument.uri, false);
  console.log('The DID as Hex Account: ', didHex);

  const didUri = getDidUriFromAccountHex(didHex, false);
  console.log('The processed  DID-URI: ', didUri);

  const chainName = (await api.rpc.system.chain()).toHuman();
  console.log('working on this blockchain: ', chainName);

  api.disconnect();
}

async function tryItOut() {
  const title = '';
  const display = title || '∅';

  console.log('title: ', title);
  console.log('display: ', display);
  console.log('Boolean title: ', Boolean(title));
  const longest = Number.MAX_VALUE;
  console.log('longest: ', longest);
  console.log('longest number of bits: ', Math.log2(longest));

  const longest_save = Number.MAX_SAFE_INTEGER;
  console.log('longest_save: ', longest_save);
  console.log('longest_save number of bits: ', Math.log2(longest_save));
}
