import { getApi } from "./connection";
import { generateAccount } from "./generators/generateAccount";
import { generateFullDid } from "./generators/generateFullDid";
import * as Kilt from "@kiltprotocol/sdk-js";
import { ACCOUNT_MNEMONIC, DID_MNEMONIC } from "./configuration";
import { makeSignExtrinsicCallBackShortCut } from "./callBacks/makeSignExtrinsicCallBackShortCut";
import { generateKeyPairs } from "./generators/generateKeyPairs";
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

export interface SubmitOptions {
  payerMnemonic?: string;
  didMnemonic?: string;
  verbose?: boolean;
}

/**
 *
 * @param extrinsics unsigned Extrinsics
 * @param batchType
 * * "absolute" => utility.batch
 * * "gradual" => utility.batchAll
 * * "independent" => utility.forceBatch
 * @param options (optional)
 * Defaults:
 * * payerMnemonic = env.ACCOUNT_MNEMONIC
 * * didMnemonic = env.DID_MNEMONIC
 * * verbose = false
 */
export async function singAndSubmitTxsBatch(
  extrinsics: Kilt.SubmittableExtrinsic[],
  batchType: "absolute" | "gradual" | "independent",
  options: SubmitOptions = {}
) {
  // extract options o use default:
  const {
    payerMnemonic = ACCOUNT_MNEMONIC,
    didMnemonic = DID_MNEMONIC,
    verbose = false,
  } = options;

  const api = await getApi();

  const payer = generateAccount(payerMnemonic);
  const fullDid = await generateFullDid(payer, didMnemonic);
  const didKeyPairs = generateKeyPairs(didMnemonic);

  const didAssertionKeyUri: Kilt.DidResourceUri = `did:kilt:${
    didKeyPairs.assertionMethod.address
  }${fullDid!.assertionMethod![0].id}`;

  const batchFunction =
    batchType === "absolute"
      ? api.tx.utility.batch
      : batchType === "gradual"
      ? api.tx.utility.batchAll
      : api.tx.utility.forceBatch;

  if (verbose) {
    console.log("\n", "Payer account address: ", payer.address);
    console.log("Did Uri ", fullDid.uri);
    console.log("DID assertion Key Uri: ", didAssertionKeyUri, "\n");
  }

  verbose && console.log("Authorizing transaction");
  const authorized = await Kilt.Did.authorizeBatch({
    batchFunction,
    did: fullDid.uri,
    extrinsics,
    sign: makeSignCallBackShortCut(
      didAssertionKeyUri,
      didKeyPairs.assertionMethod
    ),
    // sign: makeSignExtrinsicCallBackShortCut(didKeyPairs.assertionMethod), // both work
    submitter: payer.address,
  });

  verbose && console.log("Submitting transaction");
  await runTransactionWithTimeout(
    Kilt.Blockchain.signAndSubmitTx(authorized, payer)
  );
  verbose && console.log("Transaction submitted");
}
