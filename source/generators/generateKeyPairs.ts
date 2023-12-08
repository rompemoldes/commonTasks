import {
  mnemonicToMiniSecret,
  sr25519PairFromSeed,
  ed25519PairFromSeed,
  secp256k1PairFromSeed,
  keyExtractPath,
  keyFromPath,
  blake2AsU8a,
} from '@polkadot/util-crypto';
import * as Kilt from '@kiltprotocol/sdk-js';

function generateSR25519KeyAgreement(mnemonic: string) {
  const secretKeyPair = sr25519PairFromSeed(mnemonicToMiniSecret(mnemonic));
  const { path } = keyExtractPath('//did//keyAgreement//0');
  const { secretKey } = keyFromPath(secretKeyPair, path, 'sr25519');
  return Kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(
    blake2AsU8a(secretKey),
  );
}

function generateED25519KeyAgreement(mnemonic: string) {
  const secretKeyPair = ed25519PairFromSeed(mnemonicToMiniSecret(mnemonic));
  const { path } = keyExtractPath('//did//keyAgreement//0');
  const { secretKey } = keyFromPath(secretKeyPair, path, 'ed25519');
  return Kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(
    blake2AsU8a(secretKey),
  );
}

/**
 * Not sure if this will work.
 */
function generateECDSAKeyAgreement(mnemonic: string) {
  const secretKeyPair = secp256k1PairFromSeed(mnemonicToMiniSecret(mnemonic));
  const { path } = keyExtractPath('//did//keyAgreement//0');
  const { secretKey } = keyFromPath(secretKeyPair, path, 'ecdsa');
  return Kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(
    blake2AsU8a(secretKey),
  );
}
export function generateKeyPairs(
  mnemonic: string,
  scheme: 'ecdsa' | 'sr25519' | 'ed25519' = 'ed25519',
) {
  // Currently, the default the key type used by the Kilt-team is "ed25519". Better to use it for compatibility.
  const account = Kilt.Utils.Crypto.makeKeypairFromSeed(
    mnemonicToMiniSecret(mnemonic),
    scheme,
  );

  // You can derive the keys however you want to and it will still work.
  // But if, for example, you try to load your seed phrase in a third party wallet, you will get a different set of keys, because the derivation is different.
  // For a start, it is better to use the same derivations as Sporran. So you can load your Accounts and DIDs there and check if everything worked fine.

  // const authentication = account.derive("//did//0") as Kilt.KiltKeyringPair;

  // const assertionMethod = account.derive(
  //   "//did//assertion//0"
  // ) as Kilt.KiltKeyringPair;

  // const capabilityDelegation = account.derive(
  //   "//did//delegation//0"
  // ) as Kilt.KiltKeyringPair;

  // Dudley's method:
  const authentication = account;
  const assertionMethod = account;
  const capabilityDelegation = account;

  // The encryption keys, a.k.a. keyAgreement, are not natively supported by the Polkadot library.
  // So to derive this kinds of keys, we have to play a bit with lower-level details.
  // That's whats done in the extra function generateKeyAgreement()

  let keyAgreement: Kilt.KiltEncryptionKeypair;

  switch (scheme) {
    case 'sr25519':
      keyAgreement = generateSR25519KeyAgreement(mnemonic);
      break;

    case 'ed25519':
      keyAgreement = generateED25519KeyAgreement(mnemonic);
      break;

    case 'ecdsa':
      keyAgreement = generateECDSAKeyAgreement(mnemonic);
      break;
  }

  return {
    authentication: authentication,
    keyAgreement: keyAgreement,
    assertionMethod: assertionMethod,
    capabilityDelegation: capabilityDelegation,
  };
}
