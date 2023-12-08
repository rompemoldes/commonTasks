import * as Kilt from "@kiltprotocol/sdk-js";

import { ACCOUNT_MNEMONIC, DID_MNEMONIC } from "./configuration";
import { getApi } from "./connection";
import { generateAccount } from "./generators/generateAccount";
import { generateFullDid } from "./generators/generateFullDid";
import { generateKeyPairs } from "./generators/generateKeyPairs";
import { u8aToHex } from "@polkadot/util";
import { singAndSubmitTxsBatch } from "./batchTransaction";
import {
  createCTypeTransaction,
  createRandomCTypeSchema,
} from "./createCTypeTransaction";
import readFlags from "./flags";

tryThis().then(() => process.exit());
async function tryThis() {
  const flags = await readFlags();
  console.log("Flags: ", flags);
  const api = await getApi(flags.chain);
  const chainName = (await api.rpc.system.chain()).toHuman();

  const payer = generateAccount(ACCOUNT_MNEMONIC);
  const fullDid = await generateFullDid(payer, DID_MNEMONIC);
  const didKeyPairs = generateKeyPairs(DID_MNEMONIC);

  const didAssertionKeyUri: Kilt.DidResourceUri = `did:kilt:${
    didKeyPairs.assertionMethod.address
  }${fullDid!.assertionMethod![0].id}`;

  console.log("Print what im working with.");
  console.log("Payer account address: ", payer.address);
  console.log("Did Uri ", fullDid.uri);
  console.log("did assertion Key Uri: ", didAssertionKeyUri, "\n");

  // generate transactions that create cTypes
  const extrinsicsForBatch: Kilt.SubmittableExtrinsic[] = [];

  for (let index = 0; index < flags.bulkSize; index++) {
    const cTypeSchema = createRandomCTypeSchema();

    const encodedCType = Kilt.CType.toChain(cTypeSchema);
    const cTypeCreationTx = api.tx.ctype.add(encodedCType);

    extrinsicsForBatch.push(cTypeCreationTx);
  }
  await singAndSubmitTxsBatch(extrinsicsForBatch);

  console.log("working on this blockchain: ", chainName);

  await api.disconnect();
}

// async function tryThat() {
//   const api = await getApi();
//   const keys = generateKeyPairs(DID_MNEMONIC);

//   const payer = generateAccount(ACCOUNT_MNEMONIC);
//   const didDocument = await generateFullDid(payer, DID_MNEMONIC);

//   console.log("The DID: ", didDocument);

//   console.log(
//     "keys.assertionMethod as unit8Array: ",
//     keys.assertionMethod.publicKey.toString()
//   );
//   console.log(
//     "keys.assertionMethod as hexadecimal number: ",
//     u8aToHex(keys.assertionMethod.publicKey)
//   );

//   const didUriFromKey = Kilt.Did.getFullDidUriFromKey(keys.authentication);

//   console.log("DID URI from key: ", didUriFromKey);

//   const isUriAsExpected = didUriFromKey === didDocument.uri;
//   console.log("Does life makes sense? ", isUriAsExpected);

//   const chainName = (await api.rpc.system.chain()).toHuman();
//   console.log("working on this blockchain: ", chainName);

//   api.disconnect();
// }
