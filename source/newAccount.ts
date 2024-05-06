import { mnemonicGenerate } from '@polkadot/util-crypto';

import * as Kilt from '@kiltprotocol/sdk-js';

import { getApi } from './connection';
import { generateAccount } from './generators/generateAccount';

import readFlags from './flags';

makeNewAccount(undefined, undefined, 'sr25519');

async function makeNewAccount(
  oldMnemonic?: string,
  derivationPath?: string,
  scheme: 'ecdsa' | 'sr25519' | 'ed25519' = 'ed25519',
): Promise<Kilt.KiltKeyringPair> {
  const flags = await readFlags();
  // flags have priority over parameters:
  if (flags.mnemonicTyped) {
    oldMnemonic = flags.mnemonicTyped;
  }
  if (flags.derivationPath) {
    derivationPath = flags.derivationPath;
  }
  const api = await getApi(flags.chain);
  console.log('Using this scheme for the account : ', scheme);

  const chainName = (await api.rpc.system.chain()).toHuman();
  const newMnemonic = mnemonicGenerate();
  const mnemonic = oldMnemonic ?? newMnemonic;
  const baseAccount = generateAccount(mnemonic, scheme);

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
