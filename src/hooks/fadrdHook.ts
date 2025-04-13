class FadrdHook implements IHook {
  handle(req: any, res: any): void {
    console.log("    => CMD_FADRD - pad:", req.payload[0]);
    console.log("    => speed:", req.payload[1]);
    console.log("    => cycles:", req.payload[2]);
  }
}

export default new FadrdHook();
