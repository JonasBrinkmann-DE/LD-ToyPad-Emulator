class FlashHook implements IHook {
  handle(req: any, res: any): void {
    console.log("    => CMD_FLASH");
    console.log("    => pad:", req.payload[0]);
    console.log("    => color duration:", req.payload[1]);
    console.log("    => white duration:", req.payload[2]);
    console.log("    => cycles:", req.payload[3]);
    console.log("    => red:", req.payload[4]);
    console.log("    => green:", req.payload[5]);
    console.log("    => blue:", req.payload[6]);
  }
}

export default new FlashHook();
