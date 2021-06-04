const url = require('url');
const path = require('path');
const electron = require('electron');

const { ipcRenderer, remote} = electron;

const Notification = electron.remote.Notification;
window.session = electron.remote.session;
window.net = electron.remote.net;
window.shell = electron.remote.shell;
window.Notification = Notification;
window.remote = remote;

window.ipcRenderer = ipcRenderer;

window.pathPreloader = url.format({
    pathname: path.join(__dirname, './electron-js/preloader.js'),
    protocol: 'file:',
    slashes: true
});

window.notify = function notify(msg) {
    // fix icon ở đây => sau muốn thay icon theo sàn thì copy mấy file icon vào cùng path kia rồi viết switch nhé.
    msg['icon'] = path.join(__dirname, '/logo-win.ico');
    try {
        const customNotification = new Notification(msg);
        customNotification.show();
        customNotification.on('click', () => {
            msg.onClick();
        });
        return customNotification;
    } catch(err){
        console.log(err);
    }
};