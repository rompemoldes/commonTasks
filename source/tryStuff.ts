import * as Kilt from "@kiltprotocol/sdk-js";

import { getApi } from "./connection";
import { singAndSubmitTxsBatch } from "./batchTransaction";

import readFlags from "./flags";
import { createRandomCTypeSchema } from "./cType/createCTypeSchema";

tryThis().then(() => process.exit());
async function tryThis() {
  const flags = await readFlags();
  flags.verbose && console.log("Flags: ", flags);
  const api = await getApi(flags.chain);
  const chainName = (await api.rpc.system.chain()).toHuman();

  // generate transactions that create cTypes
  const extrinsicsForBatch: Kilt.SubmittableExtrinsic[] = [];

  for (let index = 0; index < flags.bulkSize; index++) {
    const cTypeSchema = createRandomCTypeSchema(index);

    const encodedCType = Kilt.CType.toChain(cTypeSchema);
    const cTypeCreationTx = api.tx.ctype.add(encodedCType);

    extrinsicsForBatch.push(cTypeCreationTx);
  }
  await singAndSubmitTxsBatch(extrinsicsForBatch, flags.batchType, {
    verbose: flags.verbose,
  });

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
