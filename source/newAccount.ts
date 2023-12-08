import { mnemonicGenerate } from '@polkadot/util-crypto';

import * as Kilt from '@kiltprotocol/sdk-js';

import { getApi } from './connection';
import { generateAccount } from './generators/generateAccount';
import { generateFullDid } from './generators/generateFullDid';

import { ACCOUNT_MNEMONIC } from './configuration';
import readFlags from './flags';

makeNewAccount();

async function makeNewAccount(
  oldMnemonic?: string,
  derivationPath?: string,
): Promise<Kilt.KiltKeyringPair> {
  const api = await getApi();
  const flags = await readFlags();
  // flags has priority over parameters:
  if (flags.mnemonicTyped) {
    oldMnemonic = flags.mnemonicTyped;
  }
  if (flags.derivationPath) {
    derivationPath = flags.derivationPath;
  }
  const chainName = (await api.rpc.system.chain()).toHuman();
  const newMnemonic = mnemonicGenerate();
  const mnemonic = oldMnemonic ?? newMnemonic;
  const baseAccount = generateAccount(mnemonic);

  let account = baseAccount;

  if (derivationPath) {
    account = baseAccount.derive(derivationPath) as Kilt.KiltKeyringPair;
    console.log('derivation path: ', derivationPath);
  }

  oldMnemonic && console.log('old Mnemonic: ', mnemonic);
  !oldMnemonic && console.log('new Mnemonic: ', mnemonic);

  console.log('base Account ', baseAccount.address);
  console.log('(possibly derived) Account ', account.address);

  console.log('made on this blockchain: ', chainName);

  const accountBalance = (
    await api.query.system.account(account.addressRaw)
  ).toHuman();

  console.log('account balance: ', JSON.stringify(accountBalance, null, 2));

  if (chainName === 'KILT Peregrine') {
    const peregrineFaucetURL = 'https://faucet.peregrine.kilt.io/?';

    console.log(
      `get some funds for that account on the faucet here: ${peregrineFaucetURL}${account.address}`,
    );
  }

  await api.disconnect();
  return account;
}
