import { mnemonicGenerate } from '@polkadot/util-crypto';

import * as Kilt from '@kiltprotocol/sdk-js';

import { getApi } from './connection';
import { generateAccount } from './generators/generateAccount';
import { generateFullDid } from './generators/generateFullDid';

import { ACCOUNT_MNEMONIC, DID_MNEMONIC } from './configuration';

makeNewIdentity(ACCOUNT_MNEMONIC);

async function makeNewIdentity(payerMnemonic: string) {
  const api = await getApi();
  const chainName = (await api.rpc.system.chain()).toHuman();

  const payer = generateAccount(payerMnemonic);

  const newMnemonic = mnemonicGenerate();
  const newIdentity = await generateFullDid(payer, newMnemonic);

  console.log('newMnemonic: ', newMnemonic);
  console.log('payer account ', payer.address);
  console.log('Identity: ', JSON.stringify(newIdentity, null, 2));
  console.log('made on this blockchain: ', chainName);

  await api.disconnect();
}
