import yargs from 'yargs';

export default async function readFlags() {
  const argv = await yargs.option({
    chain: {
      description: 'Blockchain to interact with.',
      type: 'string',
      // choices: ["p", "s"],
      default: 'p',
      alias: 'c',
    },
    claimHash: {
      description: 'Root hash of the attestation to be revoke.',
      type: 'string',
      alias: '#',
    },
    mnemonic: {
      description: 'A mnemonic to use for this task.',
      type: 'string',
      alias: 'm',
    },
    derivation: {
      description: 'A derivation path to use for this task.',
      type: 'string',
      alias: 'd',
    },
    verbose: {
      description: 'Print more logs than strictly necessary.',
      type: 'boolean',
      alias: 'v',
      default: false,
    },
    bulkSize: {
      description: 'Number of transactions to be triggered',
      type: 'number',
      alias: 'n',
      default: 3,
    },
    batchType: {
      description: 'Type of utility call to wrap the extrinsics on.',
      type: 'string',
      alias: 'b',
      default: 'independent',
    },
    input: {
      description: 'Generic Input through the terminal',
      type: 'string',
      alias: 'i',
    },
  }).argv;

  return {
    chain: narrowChainFlag(argv.chain),
    claimHash: argv.claimHash,
    mnemonicTyped: argv.mnemonic,
    derivationPath: argv.derivation,
    verbose: argv.verbose,
    bulkSize: argv.bulkSize,
    batchType: narrowBatchType(argv.batchType),
    input: argv.input,
  };
}

function narrowChainFlag(value: string): 's' | 'p' {
  const spiritnetAliases = [
    's',
    'spiritnet',
    'spirit',
    'skynet',
    'real',
    'kilt',
    'skirt',
    'kilt-kilt',
    'real-kilt',
  ];

  if (spiritnetAliases.includes(value)) {
    return 's';
  } else {
    // default
    return 'p';
  }
}

function narrowBatchType(
  value: string,
): 'absolute' | 'gradual' | 'independent' {
  const absoluteAliases = [
    'batch',
    'absolute',
    'allOrNothing',
    'binary',
    'killjoy',
    'partyPooper',
  ];
  const gradualAliases = [
    'batchAll',
    'gradual',
    'stepwise',
    'hierarchical',
    'progressive',
    'untilFailure',
  ];

  if (absoluteAliases.includes(value)) {
    return 'absolute';
  }
  if (gradualAliases.includes(value)) {
    return 'gradual';
  } else {
    // default
    return 'independent';
  }
}
