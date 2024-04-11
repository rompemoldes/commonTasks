import {
  mnemonicToMiniSecret,
  sr25519PairFromSeed,
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

export function generateKeyPairsTheSporranWay(
  mnemonic: string,
  scheme: 'ecdsa' | 'sr25519' | 'ed25519' = 'sr25519',
) {
  // Considerations for compatibility:
  // Currently, the default the key type used by the Sporran is "sr25519".
  // But the "Default" set by the the team is "ed25519"
  const account = Kilt.Utils.Crypto.makeKeypairFromSeed(
    mnemonicToMiniSecret(mnemonic),
    scheme,
  );

  // You can derive the keys however you want to and it will still work.
  // But if, for example, you try to load your seed phrase in a third party wallet, you will get a different set of keys, because the derivation is different.
  // For a start, it is better to use the same derivations as Sporran. So you can load your Accounts and DIDs there and check if everything worked fine.

  const authentication = account.derive('//did//0') as Kilt.KiltKeyringPair;

  const assertionMethod = account.derive(
    '//did//assertion//0',
  ) as Kilt.KiltKeyringPair;

  const capabilityDelegation = account.derive(
    '//did//delegation//0',
  ) as Kilt.KiltKeyringPair;

  // The encryption keys, a.k.a. keyAgreement, are not natively supported by the Polkadot library.
  // So to derive this kinds of keys, we have to play a bit with lower-level details.
  // That's whats done in the extra function generateKeyAgreement()

  const keyAgreement: Kilt.KiltEncryptionKeypair =
    generateSR25519KeyAgreement(mnemonic);

  return {
    authentication: authentication,
    keyAgreement: keyAgreement,
    assertionMethod: assertionMethod,
    capabilityDelegation: capabilityDelegation,
  };
}
