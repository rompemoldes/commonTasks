import { getApi } from "./connection";
import { generateAccount } from "./generators/generateAccount";
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { generateFullDid } from "./generators/generateFullDid";
import * as Kilt from "@kiltprotocol/sdk-js";
import { ACCOUNT_MNEMONIC, DID_MNEMONIC } from "./configuration";
import { makeSignExtrinsicCallBackShortCut } from "./callBacks/makeSignExtrinsicCallBackShortCut";
import { generateKeyPairs } from "./generators/generateKeyPairs";
import type { Extrinsic } from "@polkadot/types/interfaces";
import { makeSignCallBackShortCut } from "./callBacks/makeSignCallBackShortCut";

const TRANSACTION_TIMEOUT = 5 * 60 * 1000;

async function timeout(delay: number, error: Error) {
  return new Promise((resolve, reject) =>
    setTimeout(() => reject(error), delay)
  );
}

async function runTransactionWithTimeout<Result>(transaction: Promise<Result>) {
  await Promise.race([
    transaction,
    timeout(TRANSACTION_TIMEOUT, new Error("Transaction timed out")),
  ]);
}

export async function singAndSubmitTxsBatch(
  extrinsics: Kilt.SubmittableExtrinsic[],
  payerMnemonic: string = ACCOUNT_MNEMONIC,
  didMnemonic: string = DID_MNEMONIC
) {
  const api = await getApi();

  const payer = generateAccount(payerMnemonic);

  const fullDid = await generateFullDid(payer, didMnemonic);

  const didKeyPairs = generateKeyPairs(didMnemonic);

  const didAssertionKey: Kilt.DidResourceUri = `did:kilt:${
    didKeyPairs.assertionMethod.address
  }${fullDid!.assertionMethod![0].id}`;

  console.log("Authorizing transaction");
  const authorized = await Kilt.Did.authorizeBatch({
    batchFunction: api.tx.utility.forceBatch,
    did: fullDid.uri,
    extrinsics,
    sign: makeSignCallBackShortCut(
      didAssertionKey,
      didKeyPairs.assertionMethod
    ),
    // sign: makeSignExtrinsicCallBackShortCut(didKeyPairs.assertionMethod), // both work
    submitter: payer.address,
  });

  console.log("Submitting transaction");
  await runTransactionWithTimeout(
    Kilt.Blockchain.signAndSubmitTx(authorized, payer)
  );
  console.log("Transaction submitted");
}
