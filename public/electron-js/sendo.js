const electron = require("electron");

const { ipcRenderer } = electron;
const session = electron.remote.session;

const { IPC_CHANNEL } = require("./constants/ipc_channels");

const { html } = require('./modal/access_denied');

var firstClick = false;
let isLogin = false;

exports.sendo = () => {
  init();
};

const init = () => {
  // token_seller_api
  ipcRenderer.on(IPC_CHANNEL.CHANNEL_CHECK_ONLINE, (e, shop) => {
    try {
      if (!shop || !shop.allow_access) {
        if (!document.querySelector('#myModal')) {
          document.querySelector('#root').insertAdjacentHTML('beforebegin', html);
        }
        if (document.querySelector('.wrapperMenu_2s6p')) {
          document.querySelector('.wrapperMenu_2s6p').hidden = true;
        }
      }
      if (shop && shop.allow_access) {
        setTimeout(() => {
          if (document.querySelector('#myModal')) {
            document.querySelector('#myModal').remove();
          }
        }, 0);
      }
    } catch (e) {

    }
    setTimeout(() => {
      session.fromPartition(shop.option_webview.partition).cookies.get({ url: window.location.origin, name: "token_seller_api"})
      .then((cookies) => {
        let msg = {
          is_logged: false,
          location: JSON.parse(JSON.stringify(window.location)),
          channelId: shop.id,
        };
        if(cookies.length > 0){
          msg['is_logged'] = true;
          isLogin = true;
        } else {
          isLogin = false;
        }
        ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_CHECK_ONLINE, msg);
      }).catch((error) => {
        console.log(error)
      })
    }, 1000)
  });
  setTimeout(() => {
    let showPassBtn = document.querySelector('.d7e-7bcd6e');
    if (showPassBtn) {
      showPassBtn.hidden = true;
    }
  }, 1000);
  ipcRenderer.on(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION, () => {
    setTimeout(() => {
      if(isLogin){
        let selector = document.querySelector('.ChatButton_notifyMessage_2dZsP.seller');
          ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION, {
            total_unread: selector ? parseInt(selector.textContent) : 0
          })
      } else {
        ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION)
      }
    }, 500)
  });

  ipcRenderer.on(IPC_CHANNEL.CHANNEL_INPUT_AUTO_FILL, (e, value = '', type, channel) => {
    if (channel === 'sendo' && value) {
      if (type === 'account') {
        setTimeout(() => {
          const inputAccount = document.querySelector("input[name='username']");
          if (inputAccount) {
            handler(inputAccount, value);
          } else {
            let interval = setInterval(() => {
              try {
                const dom = document.querySelector("input[name='username']");
                if (dom) {
                  handler(dom, value);
                  clearInterval(interval);
                }
              } catch (e) {
                clearInterval(interval);
              }
            }, 500);
          }
        }, 0);
      } else {
        setTimeout(() => {
          const inputPassword = document.querySelector("input[name='password']");
          if (inputPassword) {
            handler(inputPassword, value);
          } else {
            let interval = setInterval(() => {
              try {
                const dom = document.querySelector("input[name='password']");
                if (dom) {
                  handler(dom, value);
                  clearInterval(interval);
                }
              } catch (e) {
                clearInterval(interval);
              }
            }, 500);
          }
        }, 0);
      }
    }
  });

  ipcRenderer.on(IPC_CHANNEL.CHANNEL_AUTO_SIGN_IN_CLICK, (e, channel) => {
    if (channel === 'sendo') {
      setTimeout(() => {
        const interval = setInterval(() => {
          const inputAccount = document.querySelector("input[name='username']");
          const buttonElement = document.querySelector('.d7e-dc4b7b');
          if (inputAccount && inputAccount.value && buttonElement) {
            buttonElement.click();
            clearInterval(interval);
          }
        }, 500);
      }, 2000);
    }
  });
};

const handler = (inputDOM, value) => {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  nativeInputValueSetter.call(inputDOM, value);
  const inputEvent = new Event("input", { bubbles: true });
  inputDOM.dispatchEvent(inputEvent);
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};