import type { U8aFixed } from '@polkadot/types-codec';

import * as Kilt from '@kiltprotocol/sdk-js';

import { createCTypeTransaction } from '../cType/createCTypeTransaction';
import { makeSignExtrinsicCallBackShortCut } from '../callBacks/makeSignExtrinsicCallBackShortCut';
import { ACCOUNT_MNEMONIC, DID_MNEMONIC } from '../configuration';
import { getApi } from '../connection';
import readFlags from '../flags';
import { generateAccount } from '../generators/generateAccount';
import { generateKeyPairs } from '../generators/generateKeyPairs';

const madeUpAssetDidUri =
  'did:asset:eip155:7.erc20:0x6b175474e89094c44da98b954eedeac335271d0f';

async function publishCredential() {
  const flags = await readFlags();
  const api = await getApi(flags.chain);

  const chainName = (await api.rpc.system.chain()).toHuman();
  console.log('working on this blockchain: ', chainName);

  const didKeyPairs = generateKeyPairs(DID_MNEMONIC);
  const payer = generateAccount(ACCOUNT_MNEMONIC);

  const didUri: Kilt.DidUri = `did:kilt:${didKeyPairs.authentication.address}`;
  //   const didUri = Kilt.Did.getFullDidUriFromKey(didKeyPairs.authentication);

  console.log('didUri: ', didUri);
  console.log('cTypeSchema.$id: ', cTypeSchema.$id);

  const cTypeHash = Kilt.CType.idToHash(cTypeSchema.$id);

  try {
    // check if the cType is already on chain
    await Kilt.CType.fetchFromChain(cTypeSchema.$id);
  } catch (error) {
    console.log(`CType ${cTypeSchema.$id} not yet on chain. Let's anchor it!`);
    try {
      // Anchor the new CType on the chain
      const authorizedCTypeCreationTx = await createCTypeTransaction(
        cTypeSchema,
        didUri,
        payer.address,
        makeSignExtrinsicCallBackShortCut(didKeyPairs.assertionMethod),
      );

      await Kilt.Blockchain.signAndSubmitTx(authorizedCTypeCreationTx, payer);
    } catch (error) {
      console.log(error);
    }
  }

  const newOfflineCredential = createCredential(
    madeUpAssetDidUri,
    didUri,
    cTypeHash,
  );

  console.log('new Credential to be anchored: ', newOfflineCredential);

  const credentialID = Kilt.PublicCredential.getIdForCredential(
    newOfflineCredential,
    didUri,
  );

  console.log("It's corresponding Credential ID: ", credentialID);

  try {
    console.log('Issuing and publishing the credential...');
    await issueCredential(
      didUri,
      payer,
      makeSignExtrinsicCallBackShortCut(didKeyPairs.assertionMethod),
      newOfflineCredential,
    );
  } catch (error) {
    console.log(error);
    throw new Error('Error anchoring the credential on chain.');
  }
  console.log('Done!');
}

// CType definition.
const cTypeSchema = Kilt.CType.fromProperties(`Just for me`, {
  name: {
    type: 'string',
  },
  randomNumber: {
    type: 'integer',
  },
  creationDate: {
    type: 'string',
  },
  artistIdentity: {
    type: 'string',
  },
});

function createCredential(
  assetDid: Kilt.AssetDidUri,
  artistDid: Kilt.DidUri,
  cTypeHash: Kilt.CTypeHash,
): Kilt.IPublicCredentialInput {
  const claimProperties: Kilt.IClaimContents = {
    name: 'From the Common Tasks',
    randomNumber: Math.floor(Math.random() * 173),
    creationDate: new Date().toString(),
    artistIdentity: artistDid,
  };
  const fullClaim: Kilt.IAssetClaim = {
    contents: claimProperties,
    cTypeHash,
    subject: assetDid,
  };

  return Kilt.PublicCredential.fromClaim(fullClaim);
}

async function issueCredential(
  attester: Kilt.DidUri,
  submitterAccount: Kilt.KiltKeyringPair,
  signCallback: Kilt.SignExtrinsicCallback,
  credential: Kilt.IPublicCredentialInput,
): Promise<void> {
  const flags = await readFlags();
  const api = await getApi(flags.chain);

  const credentialCreationTx = api.tx.publicCredentials.add(
    Kilt.PublicCredential.toChain(credential),
  );

  // Same as for traditional KILT credentials
  const authorizedAttestationTx = await Kilt.Did.authorizeTx(
    attester,
    credentialCreationTx,
    signCallback,
    submitterAccount.address,
  );
  await Kilt.Blockchain.signAndSubmitTx(
    authorizedAttestationTx,
    submitterAccount,
  );
}

publishCredential().then(() => process.exit());
