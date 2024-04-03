import * as Kilt from '@kiltprotocol/sdk-js';

import { getApi } from '../connection';

const cryptoKitty =
  'did:asset:eip155:1.erc721:0x06012c8cf97bead5deae237070f9587f8e7a266d:634446';
const cyberPunks =
  'did:asset:eip155:1.erc721:0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb';
const cyberPunk =
  'did:asset:eip155:1.erc721:0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb:1005';

export async function retrieveAllAssetCredentials(
  assetDid: Kilt.AssetDidUri,
): Promise<Kilt.IPublicCredential[]> {
  await getApi();
  console.log('Retrieving Public Credentials regarding this asset:', assetDid);

  const itsPublicCredentials =
    await Kilt.PublicCredential.fetchCredentialsFromChain(assetDid);

  for (let index = 0; index < itsPublicCredentials.length; index++) {
    const credential = itsPublicCredentials[index];
    console.log(`Credential #${index}`, credential);
  }
  return itsPublicCredentials;
}
// retrieveAllAssetCredentials(cryptoKitty).then(() => process.exit());
// retrieveAllAssetCredentials(cyberPunks).then(() => process.exit());
// retrieveAllAssetCredentials(cyberPunk).then(() => process.exit());

retrieveAllAssetCredentials(
  'did:asset:solana:DtyWjcJ3f312ojBQxTtrid.algo:DtyWjcJ3f312ojBQxTtrid:20',
).then(() => process.exit());
