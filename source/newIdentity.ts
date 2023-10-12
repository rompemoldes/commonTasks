import { getApi } from "./connection";
import { generateAccount } from "./generators/generateAccount";
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { generateFullDid } from "./generators/generateFullDid";
import * as Kilt from "@kiltprotocol/sdk-js";

const FUNDED_ACCOUNT_MNEMONIC =
  "resemble finger consider swear twenty obscure during exact palm model praise relief";

makeNewIdentity(FUNDED_ACCOUNT_MNEMONIC);

async function makeNewIdentity(payerMnemonic: string) {
  const api = await getApi();
  const chainName = (await api.rpc.system.chain()).toHuman();

  const payer = generateAccount(payerMnemonic);

  const newMnemonic = mnemonicGenerate();
  const newIdentity = await generateFullDid(payer, newMnemonic);

  console.log("newMnemonic: ", newMnemonic);
  console.log("payer account ", payer.address);
  console.log("Identity: ", JSON.stringify(newIdentity, null, 2));
  console.log("made on this blockchain: ", chainName);

  await api.disconnect();
}
