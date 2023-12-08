import * as Kilt from '@kiltprotocol/sdk-js';

import { getApi } from '../connection';
import { singAndSubmitTxsBatch } from '../batchTransaction';

import readFlags from '../flags';
import { createRandomCTypeSchema } from './createCTypeSchema';

orderBatchOfCTypes().then(() => process.exit());
async function orderBatchOfCTypes() {
  const flags = await readFlags();
  flags.verbose && console.log('Flags: ', flags);
  const api = await getApi(flags.chain);
  const chainName = (await api.rpc.system.chain()).toHuman();

  // generate transactions that create cTypes
  const extrinsicsForBatch: Kilt.SubmittableExtrinsic[] = [];

  for (let index = 0; index < flags.bulkSize; index++) {
    const cTypeSchema = createRandomCTypeSchema(index);

    const encodedCType = Kilt.CType.toChain(cTypeSchema);
    const cTypeCreationTx = api.tx.ctype.add(encodedCType);

    extrinsicsForBatch.push(cTypeCreationTx);
  }
  await singAndSubmitTxsBatch(extrinsicsForBatch, flags.batchType, {
    verbose: flags.verbose,
  });

  console.log('working on this blockchain: ', chainName);

  await api.disconnect();
}
