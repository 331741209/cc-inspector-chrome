console.log("background.js")
chrome.runtime.onConnect.addListener((port) => {
  console.log("runtime onConnect: ", port)
  port.onMessage.addListener((message) => {
    console.log("runtime port onMessage: ", message)
    port.postMessage(message + "*bg")
  })
  port.onDisconnect.addListener(() => {
    console.log("runtime port onDisconnect")
  })
})
chrome.runtime.onMessage.addListener((message) => {
  console.log("runtime onMessage: ", message)
})
// chrome.tabs.onConnect.addListener((port) => {
//   console.log("tabs onConnect: ", port)
//   port.onMessage.addListener((message) => {
//     console.log("port onMessage: ", message)
//   })
//   port.onDisconnect.addListener(() => {
//     console.log("port onDisconnect")
//   })
// })
// chrome.tabs.onMessage.addListener((message) => {
//   console.log("tabs onMessage: ", message)
// })