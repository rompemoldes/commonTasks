import * as Kilt from '@kiltprotocol/sdk-js';

import { getApi } from '../connection';
import { singAndSubmitTxsBatch } from '../batchTransaction';

import readFlags from '../flags';

registerDomainLinkageCType().then(() => process.exit());
async function registerDomainLinkageCType() {
  const flags = await readFlags();
  flags.verbose && console.log('Flags: ', flags);
  const api = await getApi(flags.chain);
  const chainName = (await api.rpc.system.chain()).toHuman();

  const cTypeSchema = ctypeDomainLinkage;

  console.log(
    'CType that is going to be registered: ',
    JSON.stringify(ctypeDomainLinkage, null, 2),
  );

  const encodedCType = Kilt.CType.toChain(cTypeSchema);
  const cTypeCreationTx = api.tx.ctype.add(encodedCType);

  try {
    await singAndSubmitTxsBatch([cTypeCreationTx], flags.batchType, {
      verbose: flags.verbose,
    });
  } catch (error) {
    throw new Error(JSON.stringify(error, null, 2));
  }
  console.log('working on this blockchain: ', chainName);

  await api.disconnect();
}

const ctypeDomainLinkage = Kilt.CType.fromProperties(
  'Domain Linkage Credential',
  {
    origin: {
      type: 'string',
    },
    id: {
      type: 'string',
    },
  },
);
