import * as Kilt from "@kiltprotocol/sdk-js";

import randomWord from "random-word";

export async function createCTypeTransaction(
  cTypeSchema: Kilt.ICType | "Random" = driversLicenseCTypeSchema,
  creator: Kilt.DidUri,
  submitterAccount: `4${string}`,
  signCallback: Kilt.SignExtrinsicCallback,
  txCounter?: Kilt.BN
): Promise<Kilt.SubmittableExtrinsic> {
  const api = Kilt.ConfigService.get("api");

  if (cTypeSchema === "Random") {
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
    { txCounter }
  );

  return authorizedCTypeCreationTx;
}

/** Default CType definition */
const driversLicenseCTypeSchema = Kilt.CType.fromProperties(
  `Drivers License by foobar`,
  {
    name: {
      type: "string",
    },
    age: {
      type: "integer",
    },
    id: {
      type: "string",
    },
  }
);

export function createRandomCTypeSchema(
  bulkIndex?: number,
  verbose?: boolean
): Kilt.ICType {
  type Properties = Kilt.ICType["properties"];
  type PatternedProperty = Properties[keyof Properties];

  const validPropertiesTypes: PatternedProperty[] = [
    { type: "string" },
    { type: "integer" },
    { type: "number" },
    { type: "boolean" },
    { type: "array", items: { type: "number" } },
  ];
  // Could not add a $ref ;(
  //  {$ref: "0x3150faaa9073d048b81f402fc2754bec63241a03202f3ba9e5378503555de737",},

  const properties: Properties = {};
  const randomNumber = Math.floor(Math.random() * 1000);
  const UUID = Kilt.Utils.UUID.generate();

  // start at 1 to not divide (%) by 0
  for (let index = 1; index <= validPropertiesTypes.length; index++) {
    const propertyName = randomWord();
    const propertyType = validPropertiesTypes[randomNumber % index];
    properties[propertyName] = propertyType;
  }
  const title = `Random Claim Type. ${
    bulkIndex !== undefined ? `Internal bulk index: ${bulkIndex}.` : ""
  } UUID: ${UUID}`;

  const newUnregisteredCType = Kilt.CType.fromProperties(title, properties);
  verbose && console.log(newUnregisteredCType);
  return newUnregisteredCType;
}
