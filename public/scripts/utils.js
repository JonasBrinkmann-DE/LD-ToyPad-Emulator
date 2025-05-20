export function GetUniqueSortedValues(array) {
  return array
    .filter(function (value, index, self) {
      return self.indexOf(value) === index;
    })
    .sort(CompareWithoutArticles);
}

export function CompareWithoutArticles(a, b) {
  //(uppercase < lowercase)
  const aWithoutArticles = RemoveArticles(a).toLowerCase();
  const bWithoutArticles = RemoveArticles(b).toLowerCase();

  if (aWithoutArticles > bWithoutArticles) {
    return 1;
  }

  if (aWithoutArticles < bWithoutArticles) {
    return -1;
  }

  return 0;
}

export function RemoveArticles(string) {
  const words = string.split(" ");
  if (words.length <= 1) {
    return string;
  }

  if (words[0] == "The") {
    return words.splice(1).join(" ");
  }

  return string;
}
export async function LoadCharactermap() {
  return await (await fetch("json/charactermap.json")).json();
}
export async function LoadTokenmap() {
  return await (await fetch("json/tokenmap.json")).json();
}
export async function DownloadToytags() {
  return await (await fetch("json/toytags.json")).json();
}
export function FadePad(element, color, speed, cycles) {
  //TODO: Don't ignore speed and cycles
  //If cycles == 0xff   => fade until new command
  //If cycles == 0      =>ignore
  $(element).animate().css({ backgroundColor: color });
}
export function FilterById(jsonObject, id) {
  return jsonObject.filter(function (jsonObject) {
    return jsonObject["id"] == id;
  })[0];
}
export function FilterByName(jsonObject, name) {
  return jsonObject.filter(function (jsonObject) {
    return jsonObject["name"] == name;
  })[0];
}
export function GetGroupIndex(padIndex) {
  if (padIndex === 2) return 0;

  if (padIndex === 1 || padIndex === 4 || padIndex === 5) return 1;

  return 2;
}
export function GetGroupMembers(group) {
  if (group == 1) {
    return [2];
  }
  if (group === 2) {
    return [1, 4, 5];
  }
  if (group === 3) {
    return [3, 6, 7];
  }
  return [];
}
