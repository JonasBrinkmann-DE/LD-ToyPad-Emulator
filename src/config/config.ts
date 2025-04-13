import * as path from "path";
import * as fs from "fs";
const configPath = path.join(__dirname, "../../", "config.json");
class Config {
  static Port: number;

  static Reload() {
    const rawData: string = fs.readFileSync(configPath, "utf8");
    const data: IConfig = JSON.parse(rawData);

    this.Port = data.port || 80;
  }
}

export default Config;
