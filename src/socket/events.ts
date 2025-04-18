import Global from "../global";
import { getUIDAtPad } from "../utils/tagUtils";
import * as Toytags from "../utils/toytags";
class Events {
  initalize(socket: any) {
    this.initalizeDeleteToken(socket);
    this.initalizeConnectionStatus(socket);
    this.initializeSync(socket);
  }
  //TODO: Replace with express request
  initalizeDeleteToken(socket: any) {
    socket.on(IOEvents.DeleteToken, (uid) => {
      console.log("IO Recieved: Deleting entry " + uid + " from JSON");

      const successfull = Toytags.deleteEntry("uid", uid);

      if (successfull) {
        console.log("Deleted ", uid, " from JSON");
      } else {
        console.log("Token not found");
      }
      Global.socket.emit(IOEvents.RefreshTokens);
    });
  }
  //TODO: Replace with express request
  initalizeConnectionStatus(socket: any) {
    socket.on(IOEvents.ConnectionStatus, () => {
      if (Global.wasConnectionEstablished) {
        Global.socket.emit(IOEvents.ConnectionAffirmation);
      }
    });
  }
  initializeSync(socket: any) {
    socket.on(IOEvents.Sync, (pad) => {
      console.log("[SOCKET] Started syncing tags with client...");
      Toytags.initalize();
      for (let i = 1; i <= 7; i++) {
        const uid = getUIDAtPad(i);
        if (uid != -1) {
          Toytags.storeData(uid, "index", i);
        }
      }
      Global.socket.emit(IOEvents.RefreshTokens);
      console.log("[SOCKET] Successfully synced tags with client!");
    });
  }
}
export default new Events();
