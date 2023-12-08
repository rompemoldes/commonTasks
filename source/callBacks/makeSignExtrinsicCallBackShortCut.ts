import * as Kilt from '@kiltprotocol/sdk-js';

/** Returns a "Kilt.SignExtrinsicCallback" function that directly returns what it's need.
 * The internal parameters of the signCallBack are just ignored, (except the "data").
 */
export function makeSignExtrinsicCallBackShortCut(
  didSigningKey: Kilt.KiltKeyringPair,
) {
  // The SignExtrinsicCallback is a more specialized SignCallback since it doesn't
  // need to return the keyUri.
  const signCallback: Kilt.SignExtrinsicCallback = async ({
    data,
    // The key relationship specifies which DID key must be used.
    keyRelationship,
    // The DID URI specifies which DID must be used. We already know which DID
    // this will be since we will use this callback just a few lines later (did === didUri).
    did,
  }) => ({
    signature: didSigningKey.sign(data),
    keyType: didSigningKey.type,
  });

  return signCallback;
}
