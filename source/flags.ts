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
  }).argv;

  return {
    chain: narrowChainFlag(argv.chain as string),
    claimHash: argv.claimHash,
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
