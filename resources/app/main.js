const { app, BrowserWindow, session } = require("electron");
const Store = require("electron-store");
const path = require("path");
const store = new Store();

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "messages.ico"),
    webPreferences: {
      nodeIntegration: false,
      partition: "persist:messages", // This enables session persistence
    },
  });

  // Load Google Messages web page
  win.loadURL("https://messages.google.com/web");

  // Save session cookies when the window is closed
  win.on("close", () => {
    const ses = win.webContents.session;
    ses.cookies.get({}, (error, cookies) => {
      store.set("cookies", cookies);
    });
  });
}

// Restore session cookies on app launch
function restoreSessionCookies() {
  const ses = session.fromPartition("persist:messages");
  const cookies = store.get("cookies");

  if (cookies) {
    cookies.forEach((cookie) => {
      ses.cookies.set(cookie);
    });
  }
}

app.whenReady().then(() => {
  restoreSessionCookies();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
