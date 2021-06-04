const { app, BrowserView, BrowserWindow, ipcMain, session, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const isMac = process.platform === 'darwin'

// configure logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

const path = require('path');
const url = require('url');

var mainWindow;

function createWindow() {
    console.log('development', process.env.DEVELOPMENT);
    console.log('process.env.ELECTRON_START_URL', process.env.ELECTRON_START_URL);
    try{
        // Create the browser window.
        mainWindow = new BrowserWindow({
            minWidth: 768,
            minHeight: 500,
            webPreferences: {
                nodeIntegration: true,
                preload: __dirname + '/preload.js',
                webviewTag: true,
                enableRemoteModule: true,
                nodeIntegrationInWorker: true,
                devTools: process.env.DEVELOPMENT ? true : false
            }
        });

        mainWindow.maximize();
        // and load the index.html of the app.
        const startUrl = process.env.ELECTRON_START_URL || url.format({
            pathname: path.join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true
        });
        mainWindow.loadURL(startUrl);
        // Open the DevTools.
        // mainWindow.webContents.openDevTools();
        if (process.env.DEVELOPMENT) {
            mainWindow.webContents.openDevTools();
        }

        mainWindow.webContents.on('did-finish-load', () => {
            mainWindow.webContents.send('ping', 'whoooooooh!')
        });

        mainWindow.webContents.on('devtools-opened', () => {
            if(!process.env.DEVELOPMENT){
                mainWindow.webContents.closeDevTools();
            }
        });

        mainWindow.once('ready-to-show', () => {
            autoUpdater.checkForUpdatesAndNotify();
        });
        mainWindow.on('closed', function () {
            mainWindow = null
        });

        mainWindow.on('hide', function () {
            // mainWindow.webContents.send('noti-in-app', false)
        });
        mainWindow.on('show', function () {
            // mainWindow.webContents.send('noti-in-app', true)
        });
        mainWindow.on('focus', function () {
            mainWindow.webContents.send('noti-in-app', false)
        });
        mainWindow.on('blur', function () {
            mainWindow.webContents.send('noti-in-app', true)
        });
        const template = [
            ...(isMac ? [
            {
                label: app.name,
                submenu: [
                    { role: 'about' },
                    { role: 'hide' },
                    { role: 'hideothers' },
                    { role: 'quit' }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                  { role: 'undo' },
                  { role: 'redo' },
                  { type: 'separator' },
                  { role: 'cut' },
                  { role: 'copy' },
                  { role: 'paste' },
                  ...(isMac ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' },
                    { type: 'separator' },
                    {
                      label: 'Speech',
                      submenu: [
                        { role: 'startspeaking' },
                        { role: 'stopspeaking' }
                      ]
                    }
                  ] : [
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' }
                  ])
                ]
            },
            {
                label: 'View',
                submenu: [
                    { type: 'separator' },
                    { role: 'resetzoom' },
                    { role: 'zoomin' },
                    { role: 'zoomout' },
                    { role: 'togglefullscreen' },
                    ...(process.env.DEVELOPMENT ? [
                        { role: 'reload' },
                        { role: 'toggledevtools' }
                    ] : [])
                ]
            },
            {
                role: 'help',
                submenu: [
                    {
                        label: 'Learn More',
                        click: async () => {
                            const { shell } = require('electron')
                            await shell.openExternal('https://support.sapo.vn')
                        }
                    }
                ]
            }
            ] : [])
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    } catch(err){
        console.log(err);
    }
}
app.on('ready', createWindow);

app.setAppUserModelId(process.execPath)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});
app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});

ipcMain.on('ping', async (event, msg) => {

})

ipcMain.on('click-notify', function () {
    mainWindow.moveTop();
    mainWindow.focus();
});

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});

ipcMain.on('open_dev_tool', () => {
    if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
    } else {
        mainWindow.webContents.openDevTools();
    }
});

autoUpdater.on('update-available', () => {
    try{
        if (mainWindow) mainWindow.webContents.send('update_available');
    } catch(err){

    }
});

autoUpdater.on('update-downloaded', () => {
    try {
        if (mainWindow) mainWindow.webContents.send('update_downloaded');
    } catch(err){

    }
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.on('set-badge', (event, msg) => {
    try {
        if (process.platform === 'darwin') {
            let badge = msg.badge >= 10 ? `9+` : msg.badge  > 0 ? `${msg.badge.toString()}` : '';
            app.dock.setBadge(badge);
        } else if(process.platform === 'linux'){
            app.setBadgeCount(badge)
        } else {
            let path_baget = null;
            if(msg.badge >= 10){
                path_baget = path.join(__dirname, 'baget/9+.ico')
            } else if(msg.badge > 0){
                path_baget = path.join(__dirname, `baget/${msg.badge}.ico`)
            }
            if(mainWindow) mainWindow.setOverlayIcon(path_baget, '');
        }
    } catch(err){

    }
})