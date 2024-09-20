document.addEventListener("DOMContentLoaded", function () {
  handleStartStopBtnClick();
  handleTabSwitching();
});

window.addEventListener("message", handleCommunicationSignal);

function handleTabSwitching() {
  const tabs = document.querySelectorAll(".tab-button");
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      handleTabClick(tab.dataset.page);
    });
  });
}

function handleTabClick(activePage) {
  const mainFrame = document.getElementById("mainFrame");
  mainFrame.src = activePage;
}

function handleCommunicationSignal(e) {
  const signalImg = document.getElementById("communication-signal-image");
  if (signalImg) {
    signalImg.style.filter =
      e.data === "connected" ? "grayscale(0%)" : "grayscale(100%)";
  }
}

function handleStartStopBtnClick() {
  const startBtn = document.getElementById("system-start-btn");
  startBtn.addEventListener("click", () => {
    const mainFrame = document.getElementById("mainFrame");
    mainFrame.contentWindow.postMessage("start", "*");
  });
  const stopBtn = document.getElementById("system-stop-btn");
  stopBtn.addEventListener("click", () => {
    const mainFrame = document.getElementById("mainFrame");
    mainFrame.contentWindow.postMessage("stop", "*");
  });
}
