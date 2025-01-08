console.log("devtools.js");
debugger

// const tabsConnect = chrome.tabs.connect({ name: "devtoos" });
// tabsConnect.onMessage.addListener((message) => {
//   console.log("tabsConnect Message: ", message)
// })
// tabsConnect.onDisconnect.addListener(() => {
//   console.log("tabsConnect disconnect")
// })
const runtimeConnect = chrome.runtime.connect({ name: "devtools" })
runtimeConnect.onDisconnect.addListener(() => {
  console.log(`runtimeConnect disconnect`,)
});
runtimeConnect.onMessage.addListener((message) => {
  console.log('runtimeConnect Message: ', message)
  text.innerText = message;
});
// view
const text = document.getElementById('text')
const send2bg = document.getElementById('send2bg')
if (send2bg) {
  send2bg.addEventListener('click', () => {
    const message = ("devtools send to background")
    runtimeConnect.postMessage(message)
    // tabsConnect.sendMessage(message);
    // chrome.runtime.sendMessage(message);
  })
}


chrome.devtools.panels.create("Hello World", "icon.png", "devtools.html", (panel) => {
  console.log("panel created");
  panel.onShown.addListener(() => {
    console.log("panel shown");
  });
  panel.onHidden.addListener(() => {
    console.log("panel hidden");
  });
  panel.onSearch.addListener((query) => {
    console.log("panel search", query);
  });
});