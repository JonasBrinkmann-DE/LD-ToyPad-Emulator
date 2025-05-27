import { DialogShadow, EditDialog } from "./dom.js";

export function openEditDialog() {
  openDialog(EditDialog);
}

export function closeAll() {
  document.body.style.overflowY = "";
  const dialogs = document.querySelectorAll("dialog");

  dialogs.forEach((dialog) => {
    dialog.close();
  });
  DialogShadow?.setAttribute("hidden", "");
}
function openDialog(element) {
  closeAll();

  scrollTo({
    top: 0,
    behavior: "smooth",
  });
  element.show();
  document.body.style.overflowY = "hidden";
  DialogShadow?.removeAttribute("hidden");
}
