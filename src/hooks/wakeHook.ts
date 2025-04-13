import Global from "../global";

class WakeHook implements IHook {
  handle(req: any, res: any): void {
    Global.wasConnectionEstablished = true;
    Global.io.emit(IOEvents.ConnectionAffirmation);
  }
}

export default new WakeHook();
