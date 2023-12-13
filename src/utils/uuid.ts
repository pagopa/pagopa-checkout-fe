/* eslint-disable functional/immutable-data */
/* eslint-disable no-bitwise */
/* eslint @typescript-eslint/no-var-requires: "off" */
const hexToUuid = require("hex-to-uuid");

export const decodeToUUID = (base64: string) => {
  const bytes = Buffer.from(base64, "base64");
  bytes[6] &= 0x0f;
  bytes[6] |= 0x40;
  bytes[8] &= 0x3f;
  bytes[8] |= 0x80;
  return hexToUuid(bytes.toString("hex")).replace(/-/g, "");
};
