class GetColorHook implements IHook {
  handle(req: any, res: any): void {
    console.log("    => CMD_GETCOL");
    console.log("    => pad:", req.payload[0]);
  }
}

export default new GetColorHook();
