import Global from "../global";

export function createVehicle(id, upgrades, uid: string) {
  upgrades = upgrades || [0, 0];
  const token: any = Buffer.alloc(180);

  token.uid = uid;

  token.writeUInt32LE(upgrades[0], 0x8c); // 0x23 * 4
  token.writeUInt16LE(id, 0x90); //0x24 * 4
  token.writeUInt32LE(upgrades[1], 0x94); //0x25 * 4
  token.writeUInt16BE(1, 0x98); // 0x26 * 4 -- Page 26 is used for verification of somekind.
  return token;
}

export function createCharacter(id, uid: string) {
  const token: any = Buffer.alloc(180);
  token.uid = uid;
  token.id = id;
  return token;
}

export function getUIDAtPad(index) {
  const token = Global.emulator._tokens.find((t) => t.index == index);
  if (token != null) return token.uid;
  else return -1;
}
