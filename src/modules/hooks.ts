import { select, updateKey, updateKeys } from "utils/toytags";
import { GetColor, RGBToHex } from "utils/conversion";
import { io, setConnectionStatus, tp } from "modules/bridge";
import { getAnyNameFromID } from "utils/tagUtils";
import Tagtypes from "enums/Tagtypes";
import Emits from "enums/Emits";

export function hook() {
  tp.hook(tp.CMD_WRITE, handleWriteCommand);

  //Colors
  tp.hook(tp.CMD_COL, handleColorCommand);
  tp.hook(tp.CMD_COLALL, handleColorAllCommand);

  //Fade
  tp.hook(tp.CMD_FADE, handleFadeCommand);
  tp.hook(tp.CMD_FADAL, handleFadeAllCommand);
  tp.hook(tp.CMD_GETCOL, handleGetColorCommand);

  ///NOT IMPLEMENTED///
  tp.hook(tp.CMD_FLASH, handleFlashCommand);
  tp.hook(tp.CMD_FLSAL, handleFlashAllCommand);
  tp.hook(tp.CMD_FADRD, handleFadeRandomCommand);

  ///DEBUG PURPOSES///
  tp.hook(tp.CMD_WAKE, handleWakeCommand);
}

//When the game calls 'CMD_WRITE', writes the given data to the toytag in the top position.
/* Writing Tags Explained:
 * A write occurs in three seperate function calls, and will repreat until either the write is canceled in game,
 * or all three calls successfully write data.
 *
 * To appease the game all data is passed through and copied to the token in the top pad. But during this we can intercept what is being written
 * and save the data locally as well. This lets us call that data back when we want to use that tag again.
 *
 * payload[1] tells what page is being written, and everything after is the data.
 * page 24 - ID
 * page 23 - Vehicle Upgrade Pt 1
 * page 26 - Vehicle Upgrades Pt 2
 * **When writing the pages requested for the write are sometimes offset by 12, not sure why.
 * This data is copied to the JSON for future use.
 */
function handleWriteCommand(req: any, res: any) {
  const ind = req.payload[0];
  const page = req.payload[1];
  const data = req.payload.slice(2);
  const uid = select("index", ind)?.uid;

  if (!uid) return;
  console.log(
    `REQUEST (CMD_WRITE) \nindex: ${ind}, \npage: ${page}, \ndata: ${data}`
  );

  //The ID is stored in page 24
  if (page == 24 || page == 36) {
    const id = data.readInt16LE(0);
    const name = getAnyNameFromID(id);

    updateKeys(uid, [
      ["id", id],
      ["name", name],
      ["type", Tagtypes.Vehicle],
    ]);
  }
  //Vehicle uprades are stored in Pages 23 & 25
  else if (page == 23 || page == 35)
    updateKey(uid, "vehicleUpgradesP23", data.readUInt32LE(0));
  else if (page == 25 || page == 37) {
    updateKey(uid, "vehicleUpgradesP25", data.readUInt32LE(0));
    io.emit(Emits.Refresh);
  }

  res.payload = Buffer.from([0x00]);
  const token = tp._tokens.find((t: any) => t.index == ind);
  if (token) {
    req.payload.copy(token.token, 4 * page, 2, 6);
  }
}
function handleColorCommand(req: any, res: any) {
  const pad_number = req.payload[0];
  const r = req.payload[1];
  const g = req.payload[2];
  const b = req.payload[3];

  console.log(
    `REQUEST (CMD_COL) \npad: ${pad_number}, \nred: ${r}, \ngreen: ${g}, blue: ${b}`
  );
  const pad_color = RGBToHex(r, g, b);
  if (pad_number == 0)
    io.emit(Emits.ColorAll, [pad_color, pad_color, pad_color]);
  else io.emit(Emits.ColorOne, [pad_number, pad_color]);
}
function handleFadeCommand(req: any, res: any) {
  const pad_number = req.payload[0];
  const pad_speed = req.payload[1];
  const pad_cycles = req.payload[2];
  const pad_color = RGBToHex(req.payload[3], req.payload[4], req.payload[5]);

  io.emit(Emits.FadeOne, [pad_number, pad_speed, pad_cycles, pad_color]);
}
function handleFlashCommand(req: any, res: any) {
  console.log("    => CMD_FLASH");
  console.log("    => pad:", req.payload[0]);
  console.log("    => color duration:", req.payload[1]);
  console.log("    => white duration:", req.payload[2]);
  console.log("    => cycles:", req.payload[3]);
  console.log("    => red:", req.payload[4]);
  console.log("    => green:", req.payload[5]);
  console.log("    => blue:", req.payload[6]);

  const padNumber = req.payload[0];
  const onTicks = req.payload[1];
  const offTicks = req.payload[2];
  const cycles = req.payload[3];
  const r = req.payload[4];
  const g = req.payload[5];
  const b = req.payload[6];

  console.log(
    `REQUEST (CMD_FLASH) \npad: ${padNumber}, \nonTicks: ${onTicks}, \noffTicks: ${offTicks}, \ncycles:${cycles}\nred: ${r}, \ngreen: ${g}, blue: ${b}`
  );

  const hex = RGBToHex(r, g, b, true);

  io.emit(Emits.FlashOne, [padNumber, onTicks, offTicks, cycles, hex]);
}

function handleFadeRandomCommand(req: any, res: any) {
  console.log("    => CMD_FADRD - pad:", req.payload[0]);
  console.log("    => speed:", req.payload[1]);
  console.log("    => cycles:", req.payload[2]);
}
function handleFadeAllCommand(req: any, res: any) {
  const top_pad_speed = req.payload[1];
  const top_pad_cycles = req.payload[2];
  const top_pad_color = RGBToHex(
    req.payload[3],
    req.payload[4],
    req.payload[5]
  );
  const left_pad_speed = req.payload[7];
  const left_pad_cycles = req.payload[8];
  const left_pad_color = RGBToHex(
    req.payload[9],
    req.payload[10],
    req.payload[11]
  );
  const right_pad_speed = req.payload[13];
  const right_pad_cycles = req.payload[14];
  const right_pad_color = RGBToHex(
    req.payload[15],
    req.payload[16],
    req.payload[17]
  );

  io.emit(Emits.FadeAll, [
    top_pad_speed,
    top_pad_cycles,
    top_pad_color,
    left_pad_speed,
    left_pad_cycles,
    left_pad_color,
    right_pad_speed,
    right_pad_cycles,
    right_pad_color,
  ]);
}
function handleFlashAllCommand(req: any, res: any) {
  console.log("    => CMD_FLSAL");

  const topEnabled = req.payload[0];
  const leftEnabled = req.payload[7];
  const rightEnabled = req.payload[14];

  if (topEnabled === 1) {
    const onDuration = req.payload[1];
    const offDuration = req.payload[2];
    const cycles = req.payload[3];
    const color = GetColor(req.payload, 4);

    const hex = RGBToHex(color.r, color.g, color.b);
    io.emit(Emits.FadeOne, [0, onDuration, offDuration, cycles, hex]);
  }

  if (leftEnabled === 1) {
    const onDuration = req.payload[8];
    const offDuration = req.payload[9];
    const cycles = req.payload[10];
    const color = GetColor(req.payload, 11);

    const hex = RGBToHex(color.r, color.g, color.b);

    io.emit(Emits.FadeOne, [1, onDuration, offDuration, cycles, hex]);
  }

  if (rightEnabled === 1) {
    const onDuration = req.payload[15];
    const offDuration = req.payload[16];
    const cycles = req.payload[17];
    const color = GetColor(req.payload, 18);

    const hex = RGBToHex(color.r, color.g, color.b);

    io.emit(Emits.FadeOne, [2, onDuration, offDuration, cycles, hex]);
  }
}
function handleColorAllCommand(req: any, res: any) {
  console.log("    => CMD_COLAL");
  const top_pad_color = RGBToHex(
    req.payload[1],
    req.payload[2],
    req.payload[3]
  );
  const left_pad_color = RGBToHex(
    req.payload[5],
    req.payload[6],
    req.payload[7]
  );
  const right_pad_color = RGBToHex(
    req.payload[9],
    req.payload[10],
    req.payload[11]
  );

  io.emit(Emits.ColorAll, [top_pad_color, left_pad_color, right_pad_color]);
}
function handleGetColorCommand(req: any, res: any) {
  console.log("    => CMD_GETCOL");
  console.log("    => pad:", req.payload[0]);
}
function handleWakeCommand(req: any, res: any) {
  setConnectionStatus(true);
  io.emit(Emits.ConnectionAffirmation);
}
