const electron = require("electron");

const { ipcRenderer } = electron;
const session = electron.remote.session;

const { IPC_CHANNEL } = require("./constants/ipc_channels");

const { html } = require('./modal/access_denied');

var firstNoti = false;
let isLogin = false;
var firstClick = false;

exports.tiki = () => {
  init();
};

const init = () => {
  ipcRenderer.on(IPC_CHANNEL.CHANNEL_CHECK_ONLINE, (e, shop) => {
    try {
      if (!shop || !shop.allow_access) {
        if (!document.querySelector('#myModal')) {
          document.querySelector('#root').insertAdjacentHTML('beforebegin', html);
        }
        if (document.querySelector('aside')) {
          document.querySelector('aside').hidden = true;
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
      console.log(e);
    }
    setTimeout(async () => {
      session.fromPartition(shop.option_webview.partition).cookies.get({ url: window.location.origin})
      .then(async (cookies) => {
        let msg = {
          is_logged: false,
          location: JSON.parse(JSON.stringify(window.location)),
          channelId: shop.id,
        };
        let ACP_AUTH = cookies.find((item) => item.name == 'ACP_AUTH');
        if(ACP_AUTH){
          msg['is_logged'] = true;
          msg['cookies'] = cookies;
          isLogin = true;
        } else {
          isLogin = false;
          msg['cookies'] = null;
        }
        if(isLogin && !firstClick){
          try {
            let token = JSON.parse(decodeURIComponent(ACP_AUTH.value));
            var fetchResult = await fetch(window.location.origin+'/api/user', {
              method: 'get',
              headers: {
                authorization: `Bearer ${token.accessToken}`
              }
            });
            var data = await fetchResult.json();
            firstClick = true;
            msg['info_channel'] = data;
            msg['token'] = token;
          } catch(err){
            console.log(err);
          }
        }
        ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_CHECK_ONLINE, msg);
      }).catch((error) => {
        console.log(error)
      })
    }, 1000)
  })

  ipcRenderer.on(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION, async (e, shop) => {
    setTimeout(async () => {
      try {
        if(isLogin && shop.cookies){
          // let selector = document.querySelector('.noticeButton___2tmwZ .ant-badge-count');
          // ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION, {
          //   total_unread: selector ? parseInt(selector.getAttribute('title')) : 0
          // })
          var fetchResult = await fetch(`https://seller-store-api.tiki.vn/notifications?$skip=0&$sort[createdAt]=-1&$limit=10&userId=${shop.info_channel.id}`, {
            method: 'get',
            headers: {
              authorization: `Bearer ${shop.token.accessToken}`
            }
          });
          var data = await fetchResult.json();
          let msg = {
            total_unread: data.unread,
            conversations: data.data
          }

          if(!firstNoti){
            firstNoti = true;
          } else {
            let new_conversations = [];
            for(let i = 0; i < data.data.length; i++){
              let item = data.data[i];
              let find = shop.conversations.find((item) => item._id == item._id);
              if(find) break;
              new_conversations.push({
                user_name: item.title,
                time: new Date(item.createdAt).getTime(),
                snippet: item.body,
              })
            }
            msg['new_conversations'] = new_conversations;
          }
          ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION, msg)

        } else {
          ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION)
        }
      } catch(err){
        console.log(err);
        ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION)
      }
    }, 3000)
  })

  ipcRenderer.on(IPC_CHANNEL.CHANNEL_INPUT_AUTO_FILL, (e, value = '', type, channel) => {
    if (channel === 'tiki' && value) {
      if (type === 'account') {
        const inputAccount = document.querySelector('#email');
        if (inputAccount) {
          handler(inputAccount, value);
        } else {
          const interval = setInterval(() => {
            const ip = document.querySelector('#email');
            if (ip) {
              handler(ip, value);
              clearInterval(interval);
            }
          }, 500);
        }
      } else {
        const inputPassword = document.querySelector('#password');
        if (inputPassword) {
          handler(inputPassword, value);
        } else {
          const interval = setInterval(() => {
            const ip = document.querySelector('#email');
            if (ip) {
              handler(ip, value);
              clearInterval(interval);
            }
          }, 500);
        }
      }
    }
  });

  ipcRenderer.on(IPC_CHANNEL.CHANNEL_AUTO_SIGN_IN_CLICK, (e, channel) => {
    if (channel === 'tiki') {
      setTimeout(() => {
        const inputAccount = document.querySelector('#email');
        const buttonElement = document.querySelector("button[type='submit']");
        const interval = setInterval(() => {
          if (inputAccount && inputAccount.value && buttonElement) {
            buttonElement.click();
            clearInterval(interval);
          }
        }, 500);
      }, 1500);
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