class FlashAllHook implements IHook {
  handle(req: any, res: any): void {
    console.log("    => CMD_FLSAL - top pad color duration:", req.payload[1]);
    console.log("    => top pad white duration:", req.payload[2]);
    console.log("    => top pad cycles:", req.payload[3]);
    console.log("    => top pad red:", req.payload[4]);
    console.log("    => top pad green:", req.payload[5]);
    console.log("    => top pad blue:", req.payload[6]);
    console.log("    => left pad color duration:", req.payload[8]);
    console.log("    => left pad white duration:", req.payload[9]);
    console.log("    => left pad cycles:", req.payload[10]);
    console.log("    => left pad red:", req.payload[11]);
    console.log("    => left pad green:", req.payload[12]);
    console.log("    => left pad blue:", req.payload[13]);
    console.log("    => right pad color duration:", req.payload[15]);
    console.log("    => right pad white duration:", req.payload[16]);
    console.log("    => right pad cycles:", req.payload[17]);
    console.log("    => right pad red:", req.payload[18]);
    console.log("    => right pad green:", req.payload[19]);
    console.log("    => right pad blue:", req.payload[20]);
  }
}

export default new FlashAllHook();
