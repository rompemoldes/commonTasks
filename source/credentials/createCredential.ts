import * as Kilt from '@kiltprotocol/sdk-js';

export function createUnattestedCredential(
  claimerDID: Kilt.DidUri,
  ctype: Kilt.ICType,
  claimContents: Kilt.IClaimContents = defaultClaimContent,
): Kilt.ICredential {
  // The claimer generates the claim they would like to get attested.
  const claim = Kilt.Claim.fromCTypeAndClaimContents(
    ctype,
    claimContents,
    claimerDID,
  );

  const credential = Kilt.Credential.fromClaim(claim);
  return credential;
}

const defaultClaimContent: Kilt.IClaimContents = {
  name: 'Alice',
  age: 29,
  id: '123456789987654321',
};
