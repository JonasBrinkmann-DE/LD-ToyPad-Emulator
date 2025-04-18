const characters = getCharacterMap();
const vehicles = getTokenMap();
//TODO: First load all tokens, and then load images async
function getCharacterMap() {
  let result = null;

  $.ajax({
    dataType: "json",
    url: "json/charactermap.json",
    async: false,
    success: (data) => {
      result = data;
    },
    error: () => {
      result = null;
    },
  });

  return result;
}

function getTokenMap() {
  let result = null;

  $.ajax({
    dataType: "json",
    url: "json/tokenmap.json",
    async: false,
    success: (data) => {
      result = data;
    },
    error: () => {
      result = null;
    },
  });

  return result;
}

setupFilterInputs();

const socket = io();
socket.emit("connectionStatus");
socket.emit("sync");

const currentMousePos = { x: -1, y: -1 };
$(document).mousemove((event) => {
  currentMousePos.x = event.pageX;
  currentMousePos.y = event.pageY;
});

//**Drag & Drop Functions**
$(".delete-token").sortable({
  cancel: ".drag-disabled",
});

$(".box").sortable({
  connectWith: ".box",
  scroll: true,
  scrollSensitivity: 40,
  scrollSpeed: 10,

  helper: "clone",
  appendTo: $("main"),
  containment: $("main"),
  //cursorAt: {left: (-(($(document).width() - $(window).width())/2))},

  sort: (event, ui) => {
    ui.helper[0].style.left = currentMousePos.x - 20;
    ui.helper.css({ "list-style-type": "none" });
  },

  start: (event, ui) => {
    // Store the starting pad number and index so we can determine when releasing the tag if it was released in the same space
    ui.item.attr("previouspadnum", ui.item.closest(".box").attr("padnum"));
    ui.item.attr("previouspadindex", ui.item.closest(".box").attr("padindex"));

    if (currentMousePos.x > window.innerWidth / 2) {
      $("#delete-token-right").removeAttr("hidden");
    } else {
      $("#delete-token-left").removeAttr("hidden");
    }
  },

  stop: (event, ui) => {
    const parentBox = ui.item.closest(".box");
    const previousPadNum = ui.item.attr("previouspadnum");
    const newPadNum = parentBox.attr("padnum");
    const previousPadIndex = ui.item.attr("previouspadindex");
    const newPadIndex = parentBox.attr("padindex");

    // If moving to the same space on the Toy Pad, remove and place in the current space
    if (
      previousPadNum != -1 &&
      previousPadNum != -2 &&
      previousPadNum == newPadNum &&
      previousPadIndex == newPadIndex
    ) {
      updateToyPadPosition(
        ui.item.attr("data-uid"),
        ui.item.attr("data-id"),
        newPadNum,
        newPadIndex,
        newPadIndex
      );
    }

    ui.item.removeAttr("previouspadnum");
    ui.item.removeAttr("previouspadindex");

    applyFilters(); //Refilter in case anything was in the search bar.

    $("#delete-token-right").attr("hidden", true);
    $("#delete-token-left").attr("hidden", true);
  },
  receive: (event, ui) => {
    var $this = $(this);

    const id = $this.attr("id");
    console.log(id);
    if (id == "delete-token-left" || id == "delete-token-right") {
      socket.emit("deleteToken", ui.item.attr("data-uid"));
      setTimeout(function () {
        refreshToyBox();
      }, 500);
    } else if (
      $this.attr("padnum") == undefined ||
      ($this.children("li").length > 1 && $this.attr("id") != "toybox-tokens")
    )
      $(ui.sender).sortable("cancel");
    //If moving to the Toy Box, remove tag from the game.
    else if ($this.attr("id") == "toybox-tokens") {
      $.ajax({
        method: "DELETE",
        contentType: "application/json",
        url: "/remove",
        data: JSON.stringify({
          index: parseInt(ui.sender.attr("padindex")),
          uid: ui.item.attr("data-uid"),
        }),
      });
    }
    //If moving from the Toy Box, place tag in the game.
    else if (ui.sender.attr("padnum") == -1) {
      const content = {
        uid: ui.item.attr("data-uid"),
        id: ui.item.attr("data-id"),
        position: $this.attr("padnum"),
        index: $this.attr("padindex"),
      };
      $.ajax({
        method: "POST",
        contentType: "application/json",
        url: "/place",
        data: JSON.stringify(content),
      });
    }
    //If moving between spaces on the Toy Pad, remove from previous space and place in new one.
    else {
      updateToyPadPosition(
        ui.item.attr("data-uid"),
        ui.item.attr("data-id"),
        $this.attr("padnum"),
        ui.sender.attr("padindex"),
        $this.attr("padindex")
      );
    }
  },
});

$(".box").disableSelection();

$("#active-filter").on("change", function (e) {
  applyFilters();
});
//When there is a change in the search bar
$("#search-bar").on("input", function (e) {
  const value = $("#search-bar").val();

  console.log("searching ", value, $("#active-filter").val());
  switch ($("#active-filter").val()) {
    case "World":
      filters.world = value;
      break;
    case "Ability":
      filters.abilities = value;
      break;
    default:
      filters.name = value;
      break;
  }

  applyFilters();
});
//TODO: Directly point to element
const padGroupMapping = [[2], [1, 4, 5], [3, 6, 7]];

//**IO Functions**
socket.on("refreshTokens", function () {
  console.log("IO Recieved: Refresh Tokens");
  setTimeout(function () {
    refreshToyBox();
  }, 1000);
});

socket.on("fadeOne", function (e) {
  console.log("IO Recieved: Fade One");
  pad = e[0];
  speed = e[1];
  cycles = e[2];
  color = e[3] + "80";
  console.log("FADE ONE: ", e);
  pads = padGroupMapping[pad - 1];
  pads.forEach((element) => {
    pad = document.getElementById("toypad" + element);

    console.log("#toypad" + element + " Color: " + color);
    $("#toypad" + element)
      .animate()
      .css({ backgroundColor: color });
    setTimeout(() => {
      $("#toypad" + element)
        .animate()
        .css({ backgroundColor: pad.color });
    }, speed * 100);
  });
});

socket.on("fadeAll", function (e) {
  console.log("IO Recieved: Fade All");
  speed = e[0];
  cycles = e[1];

  for (let i = 1; i <= 7; i++) {
    const pad = document.getElementById(`toypad${i}}`);

    if (!pad) continue;

    let color;
    switch (pad) {
      case 2:
        color = e[2];
        break;
      case 1:
      case 4:
      case 5:
        color = e[5];
        break;
      default:
        color = e[8];
    }
    color += "80";

    //TODO: This does not fade at all
    const oldColor = pad.style.backgroundColor;
    pad.style.backgroundColor = color;
    setTimeout(() => {
      pad.style.backgroundColor = oldColor;
    }, speed * 100);
  }
});

socket.on("colorOne", function (e) {
  console.log("IO Recieved: Color One");
  padindexs = [[2], [1, 4, 5], [3, 6, 7]];
  pad = e[0];
  color = e[1] + "80";
  console.log(color);
  pads = padindexs[pad - 1];
  pads.forEach((element) => {
    pad = document.getElementById("toypad" + element);
    pad.setAttribute("color", e[1]);
    $("#toypad" + element).css({ backgroundColor: color });
  });
});

socket.on("colorAll", function (e) {
  console.log("IO Recieved: Color All");
  padindexs = [1, 2, 3, 4, 5, 6, 7];
  padindexs.forEach((element) => {
    pad = document.getElementById("toypad" + element);
    padnum = pad.padnum;
    if (element == 2) var color = e[0];
    else if (element == 1 || element == 4 || element == 5) var color = e[1];
    else if (element == 3 || element == 6 || element == 7) var color = e[2];
    pad.setAttribute("color", color);
    console.log(pad);
    color = color + "80";
    $("#toypad" + element).css({ backgroundColor: color });
  });
});

socket.on("connectionAffirmation", function (e) {
  console.log("Connection Success Recieved");
  $("#connectionHintPanel").remove();
});

//**Script Functions**

function filterById(jsonObject, id) {
  return jsonObject.filter(function (jsonObject) {
    return jsonObject["id"] == id;
  })[0];
}

function filterByName(jsonObject, name) {
  return jsonObject.filter(function (jsonObject) {
    return jsonObject["name"] == name;
  })[0];
}

//Remove all token items from the lists and reread toytags.json and repopulate the lists.

//TODO: Inorder to support binary version of toytags.json,
// the ressource has to be downloaded from a get request that converts the binary into json (once)
//toytags - GET
function refreshToyBox() {
  //Remove All Current Tokens
  var boxes = document.querySelectorAll(".box");

  boxes.forEach(function (toybox) {
    while (
      toybox.lastChild &&
      toybox.lastChild.id != "delete-token" &&
      toybox.lastChild.id != "colorToken"
    ) {
      toybox.removeChild(toybox.lastChild);
    }
  });

  //Reread JSON file
  $.getJSON("./json/toytags.json", function (data) {
    tags = data;
  }).done(function () {
    $.each(tags, function (i, item) {
      if (item.name != "test" && item.index == "-1") {
        $("#toybox-tokens").append(createItemHtml(item));
      } else if (item.index != "-1") {
        $("#toypad" + item.index).append(createItemHtml(item));
      }
      applyFilters();
    });
  });
}

let itemCount = 0;
function createItemHtml(item) {
  var itemData;

  if (item.type == "character") {
    itemData = filterById(characters, item.id);
  } else {
    itemData = filterById(vehicles, item.id);
  }

  let content = "<h3>" + itemData.name + "</h3>";
  const path = "images/" + itemData.id + ".png";
  const url = $(location).attr("href") + "/../" + path;
  const localId = itemCount++;

  fileExists(url)
    .then(function (doesFileExist) {
      if (doesFileExist) {
        content =
          "<img src=" +
          path +
          " alt=" +
          itemData.name +
          " style='width: 100%; height: 100%; object-fit: contain; pointer-events: none;'>";

        $(`[data-local-id=${ta}']`).html(content);
      }
    })
    .catch(() => {});

  return (
    "<li class=item draggable=true data-name=" +
    item.name +
    " data-type=" +
    item.type +
    " data-id= " +
    item.id +
    " data-uid=" +
    item.uid +
    " pad=" +
    item.pad +
    ' data-world="' +
    itemData.world +
    '" data-abilities="' +
    itemData.abilities +
    '" data-local-id="' +
    localId.toString() +
    '">' +
    content +
    "</li>"
  );
}

async function fileExists(url) {
  const file = await fetch(url);
  return file.status != 404;
}

function updateToyPadPosition(uid, id, position, currentIndex, newIndex) {
  console.log(currentIndex);
  $.ajax({
    method: "DELETE",
    contentType: "application/json",
    url: "/remove",
    data: JSON.stringify({ index: parseInt(currentIndex), uid: uid }),
  }).done(function () {
    setTimeout(function () {
      $.ajax({
        method: "POST",
        contentType: "application/json",
        url: "/place",
        data: JSON.stringify({
          uid: uid,
          id: id,
          position: position,
          index: newIndex,
        }),
      });
    }, 500);
  });
}

//Filter the toybox to tags matching the current text of the search bar.

function setupFilterInputs() {
  $.each(characters, function (i, item) {
    if (item.name != "Unknown" || item.name.includes("(unreleased)"))
      $("#character-list").append(
        '<option value="' +
          item.name +
          '" data-world="' +
          item.world +
          '" data-abilities="' +
          item.abilities +
          '">'
      );
  });

  $.each(vehicles, function (i, item) {
    if (item.name != "Unknown")
      $("#vehicle-list").append(
        '<option value="' +
          item.name +
          '" data-world="' +
          item.world +
          '" data-abilities="' +
          item.abilities +
          '">'
      );
  });

  var worlds = [];
  var ignoredWorlds = ["15", "16", "17", "18", "19", "20", "N/A", "Unknown"];
  worlds = worlds.concat(
    characters.map(function (character) {
      return character.world;
    })
  );
  worlds = worlds.concat(
    vehicles.map(function (vehicle) {
      return vehicle.world;
    })
  );
  worlds = getUniqueSortedValues(worlds);
  worlds = worlds.filter(function (world) {
    return !ignoredWorlds.includes(world);
  });

  $.each(worlds, function (i, world) {
    if (world != "Unknown")
      $("#world-list").append('<option value="' + world + '">');
  });

  var abilities = [];
  abilities = abilities.concat(
    characters.map(function (character) {
      return character.abilities.split(",");
    })
  );
  abilities = abilities.concat(
    vehicles.map(function (vehicle) {
      return vehicle.abilities.split(",");
    })
  );
  abilities = abilities.flat();
  abilities = getUniqueSortedValues(abilities);

  $.each(abilities, function (i, ability) {
    if (ability != "Unknown")
      $("#ability-list").append('<option value="' + ability + '">');
  });
}
const filters = {
  name: "",
  world: "",
  abilities: "",
};
function applyFilters() {
  clearFilters();
  applyNameFilter();
  applyAbilityFilter();
  applyWorldFilter();
}
function applyNameFilter() {
  const text = filters.name.toLowerCase();
  if (text == "") return;

  $(".item").each(function (index, item) {
    var name = $(item).text().toLowerCase();
    if (!name.includes(text)) {
      $(item).addClass("filtered");
    }
  });
}
function applyWorldFilter() {
  const world = filters.abilities.toLowerCase();
  if (world == "") return;
  $("#character-list option, #vehicle-list option").each(function (
    index,
    option
  ) {
    if ($(option).attr("data-world") != world) {
      $(option).prop("disabled", true);
    }
  });

  $(".item").each(function (index, item) {
    if ($(item).attr("data-world") != world) {
      $(item).addClass("filtered");
    }
  });
}

function applyAbilityFilter() {
  const ability = filters.abilities.toLowerCase();

  if (ability == "") return;
  $("#character-list option, #vehicle-list option").each(function (
    index,
    option
  ) {
    if (!$(option).attr("data-abilities").split(",").includes(ability)) {
      $(option).prop("disabled", true);
    }
  });

  $(".item:not(#delete-token)").each(function (index, item) {
    if (!$(item).attr("data-abilities").split(",").includes(ability)) {
      $(item).addClass("filtered");
    }
  });
}

//Rework
function clearFilterInputs() {
  $("#tag-world-filter, #tag-ability-filter, #name-filter").val("");
}

function clearFilters() {
  $("#character-list option, #vehicle-list option").prop("disabled", false);
  $(".item").removeClass("filtered");
}
//
function getUniqueSortedValues(array) {
  return array
    .filter(function (value, index, self) {
      return self.indexOf(value) === index;
    })
    .sort(compareWithoutArticles);
}

function compareWithoutArticles(a, b) {
  var aWithoutArticles = removeLeadingArticle(a);
  var bWithoutArticles = removeLeadingArticle(b);

  if (aWithoutArticles > bWithoutArticles) {
    return 1;
  }

  if (aWithoutArticles < bWithoutArticles) {
    return -1;
  }

  return 0;
}

function removeLeadingArticle(string) {
  const words = string.split(" ");
  if (words.length <= 1) {
    return string;
  }

  if (words[0] == "The") {
    return words.splice(1).join(" ");
  }

  return string;
}

$("#character-select").submit(function (e) {
  e.preventDefault();

  var name = $("#character-name").val();
  $.ajax({
    method: "POST",
    contentType: "application/json",
    url: "/character",
    data: JSON.stringify({ id: filterByName(characters, name).id }),
  }).done(function () {
    let now = Date.now();
    const end = now + 150;
    while (now < end) {
      now = Date.now();
    }
    socket.emit("sync");
    $("#character-select")[0].reset();
  });
});

$("#vehicle-select").submit(function (e) {
  e.preventDefault();

  var name = $("#vehicle-name").val();
  console.log(name);
  var id = filterByName(vehicles, name).id;
  $.ajax({
    method: "POST",
    contentType: "application/json",
    url: "/vehicle",
    data: JSON.stringify({ id: id }),
  }).done(function () {
    var now = Date.now();
    var end = now + 150;
    while (now < end) {
      now = Date.now();
    }
    socket.emit("sync");
    $("#vehicle-select")[0].reset();
  });
});

$("#sync").click(function () {
  socket.emit("sync");
});

//**Customize Token**
var dialog;
dialog = $("#dialog-form").dialog({
  autoOpen: false,
  height: 400,
  width: 350,
  modal: true,
  buttons: {
    Cancel: function () {
      dialog.dialog("close");
    },
  },
  close: function () {
    form[0].reset();
    allFields.removeClass("ui-state-error");
  },
});

$(".item").click(function () {
  console.log("click! " + $(this).attr("id"));
  dialog.dialog("open");
});

$("#clear-filters").click(function () {
  clearFilterInputs();
  clearFilters();
});

function openGithub() {
  window.open("https://github.com/Berny23/LD-ToyPad-Emulator");
}
function openLicence() {
  window.open(
    "https://github.com/Berny23/LD-ToyPad-Emulator/blob/master/LICENSE"
  );
}

function filterSubmit(e) {
  e.preventDefault();

  const filter = $("#active-filter").val;
}
