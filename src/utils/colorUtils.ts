//TODO: Locate keystone (too many possible values to find by hand. need help here)
export function RGBToHex(
  r: number | string,
  g: number | string,
  b: number | string
) {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  if (r.length == 1) r = "0" + r;
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;
  let hex = `#${r}${g}${b}`;

  //Note: I removed comments when I orginized this, this should be documented in an external document.
  switch (hex) {
    case "#ff6e18":
    case "#f06716":
    case "#99420e":
      hex = "#ffffff";
      break;
    case "#ff0000":
      break;
    case "#ff6e00":
      hex = "#ffff00";
      break;
    case "#003700":
    case "#006700":
    case "#006e00":
      hex = "#00ff00";
      break;
    case "#006e18":
      hex = "#00ffff";
      break;
    case "#000016":
    case "#000018":
      hex = "#0000ff";
      break;
    case "#ff0018":
      hex = "#ff00ff";
      break;
    case "#f00016":
      hex = "#ff2de6";
      break;
    case "#002007":
      hex = "#007575";
      break;
    case "#4c2000":
      hex = "#757500";
      break;
    case "#4c0007":
      hex = "#750075";
      break;
    case "#3f1b05":
      hex = "#b0b0b0";
      break;
    case "#4c2007":
      hex = "#757575";
      break;
    case "#3f1b00":
      hex = "#b0b000";
      break;
    case "#3f0000":
      hex = "#b00000";
      break;
    case "#000005":
      hex = "#0000b0";
      break;
    case "#001b00":
      hex = "#00b000";
      break;
    case "#ff2700":
      hex = "#ffa200";
      break;
    case "#3f0900":
      hex = "#b06f00";
      break;
    case "#44000d":
      hex = "#d500ff";
      break;
    case "#110003":
      hex = "#9300b0";
      break;
    default:
      break;
  }

  return hex;
}
