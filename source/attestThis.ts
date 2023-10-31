import * as Kilt from "@kiltprotocol/sdk-js";
import { getApi } from "./connection";

export async function selfAttestCredential(
  credential: Kilt.ICredential,
  assertionMethodKey: Kilt.KiltKeyringPair,
  submitterAccount: Kilt.KiltKeyringPair
) {
  const api = await getApi();

  // In order to attest the credential we go through the following steps:

  // Step 1: calculating the claim hash

  const { cTypeHash, claimHash } = Kilt.Attestation.fromCredentialAndDid(
    credential,
    credential.claim.owner
  );

  // Step 2:  creating the attest transaction

  const attestationTx = api.tx.attestation.add(claimHash, cTypeHash, null);

  // Step 3: authorizing the transaction with the dApps DID
  // We authorize the call using the attestation key of the dApps DID.

  let submitTx: Kilt.SubmittableExtrinsic;

  const signCallback = async ({ data }: { data: string | Uint8Array }) => ({
    signature: assertionMethodKey.sign(data),
    keyType: assertionMethodKey.type,
  });

  // Step 4: paying for the transaction with a KILT account and submitting it to the chain

  try {
    submitTx = await Kilt.Did.authorizeTx(
      credential.claim.owner,
      attestationTx,
      signCallback,
      submitterAccount.address
    );
  } catch (error) {
    throw new Error("Could not sing the self-attestation of the credential");
  }

  // Since DIDs can not hold any balance, we pay for the transaction using our blockchain account
  const result = await Kilt.Blockchain.signAndSubmitTx(
    submitTx,
    submitterAccount
  );

  if (result.isError) {
    throw new Error("Attestation failed");
  } else {
    console.log("Attestation successful");
  }
}
