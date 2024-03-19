import type { AccountId32 } from '@polkadot/types/interfaces';

import * as Kilt from '@kiltprotocol/sdk-js';
import { u8aToHex, hexToU8a } from '@polkadot/util';

export function getDidUriFromAccountHex(
  didAccount: Kilt.HexString,
  verbose: boolean = false,
): Kilt.DidUri {
  verbose && console.log('DID as HexString of Account Address:' + didAccount);
  const didU8a = hexToU8a(didAccount);

  const didUri = Kilt.Did.fromChain(didU8a as AccountId32);
  verbose && console.log('Corresponding DID-URI: ' + didUri);
  return didUri;
}

export function getAccountHexFromDidUri(
  didUri: Kilt.DidUri,
  verbose: boolean = false,
): Kilt.HexString {
  verbose && console.log('DID-URI being parsed: ' + didUri);

  const didU8a = Kilt.Utils.Crypto.decodeAddress(Kilt.Did.toChain(didUri));
  // const didU8a = Kilt.Utils.Crypto.decodeAddress(didUri.split(':')[2]);

  const didAsAccountHex = u8aToHex(didU8a);
  verbose &&
    console.log('DID as HexString of Account Address: ' + didAsAccountHex);

  return didAsAccountHex;
}
