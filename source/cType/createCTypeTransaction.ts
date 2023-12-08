import * as Kilt from '@kiltprotocol/sdk-js';

import { createRandomCTypeSchema } from './createCTypeSchema';

export async function createCTypeTransaction(
  cTypeSchema: Kilt.ICType | 'Random' = driversLicenseCTypeSchema,
  creator: Kilt.DidUri,
  submitterAccount: `4${string}`,
  signCallback: Kilt.SignExtrinsicCallback,
  txCounter?: Kilt.BN,
): Promise<Kilt.SubmittableExtrinsic> {
  const api = Kilt.ConfigService.get('api');

  if (cTypeSchema === 'Random') {
    cTypeSchema = createRandomCTypeSchema();
  }

  // Generate a creation tx.
  const encodedCType = Kilt.CType.toChain(cTypeSchema);
  const cTypeCreationTx = api.tx.ctype.add(encodedCType);
  // Sign it with the right DID key.
  const authorizedCTypeCreationTx = await Kilt.Did.authorizeTx(
    creator,
    cTypeCreationTx,
    signCallback,
    submitterAccount,
    { txCounter },
  );

  return authorizedCTypeCreationTx;
}

/** Default CType definition */
const driversLicenseCTypeSchema = Kilt.CType.fromProperties(
  `Drivers License by foobar`,
  {
    name: {
      type: 'string',
    },
    age: {
      type: 'integer',
    },
    id: {
      type: 'string',
    },
  },
);
