import * as Kilt from "@kiltprotocol/sdk-js";

import { ACCOUNT_MNEMONIC, DID_MNEMONIC } from "./configuration";
import { getApi } from "./connection";
import { generateAccount } from "./generators/generateAccount";
import { generateFullDid } from "./generators/generateFullDid";
import { generateKeyPairs } from "./generators/generateKeyPairs";
import { u8aToHex } from "@polkadot/util";
import { singAndSubmitBatchTx } from "./batchTransaction";

tryThis();
async function tryThis() {
  const api = await getApi();
  const chainName = (await api.rpc.system.chain()).toHuman();
  console.log("working on this blockchain: ", chainName);

  const extrinsicsForBatch: Kilt.SubmittableExtrinsic[] = [];

  singAndSubmitBatchTx(extrinsicsForBatch);

  api.disconnect();
}

async function tryThat() {
  const api = await getApi();
  const keys = generateKeyPairs(DID_MNEMONIC);

  const payer = generateAccount(ACCOUNT_MNEMONIC);
  const didDocument = await generateFullDid(payer, DID_MNEMONIC);

  console.log("The DID: ", didDocument);

  console.log(
    "keys.assertionMethod as unit8Array: ",
    keys.assertionMethod.publicKey.toString()
  );
  console.log(
    "keys.assertionMethod as hexadecimal number: ",
    u8aToHex(keys.assertionMethod.publicKey)
  );

  const didUriFromKey = Kilt.Did.getFullDidUriFromKey(keys.authentication);

  console.log("DID URI from key: ", didUriFromKey);

  const isUriAsExpected = didUriFromKey === didDocument.uri;
  console.log("Does life makes sense? ", isUriAsExpected);

  const chainName = (await api.rpc.system.chain()).toHuman();
  console.log("working on this blockchain: ", chainName);

  api.disconnect();
}
