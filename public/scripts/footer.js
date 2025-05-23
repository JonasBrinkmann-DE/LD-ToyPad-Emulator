function OpenCopyright() {
  window.open("https://choosealicense.com/licenses/mit", "about:blank");
}
function OpenGithub() {
  window.open("https://github.com/Berny23/LD-ToyPad-Emulator", "about:blank");
}
function ToggleTheme() {
  const $this = document.getElementById("themeSwitcher").children[0];
  console.log($this);
  isDarkmode = document.body.classList.contains("dark");

  if (isDarkmode) {
    document.body.classList.remove("dark");
    $this.src = "ressources/moon.svg";
    $this.alt = "Activate lightmode";
  } else {
    document.body.classList.add("dark");
    $this.src = "ressources/sun.svg";
    $this.alt = "Activate darkmode";
  }
}
