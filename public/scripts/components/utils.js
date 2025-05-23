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
export function FadePad(element, color, ticks, cycles) {
  if (cycles === 0) return;

  const currentColor = GetColor(element);

  if (cycles === 255) {
    cycles = Infinity;
  }
  CancelAllAnimations(element);
  element
    .animate([{ backgroundColor: currentColor }, { backgroundColor: color }], {
      duration: ticks * 20,
      iterations: cycles,
      direction: "alternate",
    })
    .finished.then(() => {
      element.style.backgroundColor = color;
    });
}

export function FlashPad(element, tickOn, tickOff, ticks, color) {
  throw new Error("NOT IMPLEMENTED");
  if (cycles === 0) return;

  const currentColor = GetColor(element);

  if (cycles === 255) {
    cycles = Infinity;
  }

  CancelAllAnimations(element);
}

export function CancelAllAnimations(element) {
  element.getAnimations().forEach((anim) => anim.cancel());
}
export function GetColor(element) {
  return getComputedStyle(element).backgroundColor;
}
export function FilterById(jsonObject, id) {
  return jsonObject.filter(function (jsonObject) {
    return jsonObject["id"] == id;
  })[0];
}
export function FilterByName(jsonObject, name) {
  return jsonObject.filter(function (entry) {
    return entry["name"] == name;
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
