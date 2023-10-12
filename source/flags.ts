import yargs from "yargs";

export default async function readFlags() {
  const argv = await yargs.option({
    chain: {
      description: "Blockchain to interact with.",
      type: "string",
      // choices: ["p", "s"],
      default: "p",
      alias: "c",
    },
    claimHash: {
      description: "Root hash of the attestation to be revoke.",
      type: "string",
      alias: "#",
    },
    mnemonic: {
      description: "A mnemonic to use for this task.",
      type: "string",
      alias: "m",
    },
    derivation: {
      description: "A derivation path to use for this task.",
      type: "string",
      alias: "d",
    },
  }).argv;

  return {
    chain: narrowChainFlag(argv.chain as string),
    claimHash: argv.claimHash,
    mnemonicTyped: argv.mnemonic,
    derivationPath: argv.derivation,
  };
}

function narrowChainFlag(value: string): "s" | "p" {
  const spiritnetAliases = [
    "s",
    "spiritnet",
    "spirit",
    "skynet",
    "real",
    "kilt",
    "skirt",
    "kilt-kilt",
    "real-kilt",
  ];

  if (spiritnetAliases.includes(value)) {
    return "s";
  } else {
    // default
    return "p";
  }
}
