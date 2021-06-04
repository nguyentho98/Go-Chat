const electron = require("electron");
const { ipcRenderer } = electron;
const session = electron.remote.session;

const { html } = require('./modal/access_denied');

const md5 = require("md5");

const { IPC_CHANNEL } = require("./constants/ipc_channels");
var firstClick = false;
var isLogin = false;
var firstNoti = false;
var setEventScrollConversation = false;


window.arrCheckNewOrder = [];

exports.shopee = () => {
  init();
};

const init = () => {
    try {
    ipcRenderer.on(IPC_CHANNEL.CHANNEL_CHECK_ONLINE, (e, shop) => {
        try {
            if (!shop || !shop.allow_access) {
                setTimeout(() => {
                    if (!document.querySelector('#myModal')) {
                        if (document.querySelector('#root')) {
                            document.querySelector('#root').insertAdjacentHTML('beforebegin', html);
                        }
                        if (document.querySelector('#app')) {
                            document.querySelector('#app').insertAdjacentHTML('beforebegin', html);
                        }
                    }
                    if (document.querySelector('.sidebar-container')) {
                        document.querySelector('.sidebar-container').hidden = true;
                    }
                }, 0);
            }
            if (shop && shop.allow_access) {
                setTimeout(() => {
                    if (document.querySelector('#myModal')) {
                        document.querySelector('#myModal').remove();
                    }
                }, 0);
            }
        } catch (err) {
            console.log('shopee.IPC_CHANNEL.CHANNEL_CHECK_ONLINE err', err);
        }
        setTimeout(async () => {
            let msg = {
                is_online: false,
                is_logged: false,
                location: JSON.parse(JSON.stringify(window.location)),
            };
            try {
                let cookies = await session.fromPartition(shop.option_webview.partition).cookies.get({ url: window.location.origin });
                msg['cookies'] = cookies;
                let SPC_SC_UD = cookies.find((item) => item.name === 'SPC_SC_UD');
                if(SPC_SC_UD && SPC_SC_UD.value){
                    let CTOKEN = cookies.find((item) => item.name === 'CTOKEN');
                    if(CTOKEN) msg['csrf_token'] = CTOKEN.value;
                    isLogin = true;
                    msg['platformSellerId'] = SPC_SC_UD.value;
                    msg['is_logged'] = true;
                    msg['is_online'] = true;
                    if (!firstClick) {
                        if(window.location.pathname.indexOf('webchat/conversations') > -1){
                            let document_unread = document.querySelectorAll('.ReactVirtualized__Grid__innerScrollContainer .z8iJb5JoTh ._3HQ7iP3Xw9 ._3OkO9gCL4m');
                            msg['total_unread'] = document_unread.length;
                        }
                        firstClick = true;
                    }
                } else {
                    isLogin = false;
                }
            } catch(err){
                console.log(err);
            }
            msg['channelId'] = shop.id;
            ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_CHECK_ONLINE, msg);
            return;
            const checkLoginForm = document.getElementsByClassName("signin-form");
            if (checkLoginForm.length === 0) {
                let msg = {
                    is_online: true,
                    is_logged: true,
                    location: JSON.parse(JSON.stringify(window.location)),
                };
                if(!firstClick){
                    if(window.location.pathname.indexOf('webchat/conversations') > -1){
                        let document_unread = document.querySelectorAll('.ReactVirtualized__Grid__innerScrollContainer .z8iJb5JoTh ._3HQ7iP3Xw9 ._3OkO9gCL4m');
                        msg['total_unread'] = document_unread.length;
                        msg['channelId'] = shop.id;
                    }
                    firstClick = true;
                }
                isLogin = true;
                ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_CHECK_ONLINE, msg);
            } else {
                isLogin = false;
                ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_CHECK_ONLINE, {
                    is_online: false,
                    is_logged: false,
                    location: JSON.parse(JSON.stringify(window.location)),
                    channelId: shop.id,
                });
            }
        }, 1000);
    });
} catch (e) {

    }

    try {
        ipcRenderer.on(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION, (e, shop, type) => {
            if(type === 'chat'){
                setTimeout(() => {
                    // getUnread(shop);
                    getConversation(shop);
                }, 1000)
            }
        });
    } catch (e) {
    }

    try {
      ipcRenderer.on(IPC_CHANNEL.CHANNEL_GET_NEW_ORDER, (e, shop, type) => {
          getOrder(shop, type);
        // setTimeout(() => {
        //
        // }, 5000)
      });
    } catch (e) {
    }

  ipcRenderer.on(IPC_CHANNEL.CHANNEL_INPUT_AUTO_FILL, (e, value = '', type, channel) => {
    try {
      if (channel === 'shopee' && value) {
        if (type === 'account') {
          const inputAccount = document.querySelector('.shopee-input__input');
          try {
            if (typeof value == 'string' && value.toString().startsWith('0')) {
              value = value.replace('0', '+84');
            }
          } catch (e) {

          }
          if (inputAccount) {
            handler(inputAccount, value);
          } else {
            const interval = setInterval(() => {
              try {
                const dom = document.querySelector('.shopee-input__input');
                if (dom) {
                  handler(dom, value);
                  clearInterval(interval);
                }
              } catch (e) {
                ipcRenderer.sendToHost('CC', { name: 'shopee', value, type, channel, msg: 'loi cmnr', err: e });
              }
            }, 500);
          }
        } else {
          const inputAccount = document.querySelectorAll('.shopee-input__input')[1];
          if (typeof value === 'number' && value.toString().startsWith('0')) {
            value = value.replace('0', '+84');
          } else if (typeof value == 'string' && value.toString().startsWith('0')) {
            value = value.replace('0', '+84');
          }
          if (inputAccount) {
            handler(inputAccount, value);
          } else {
            const interval = setInterval(() => {
              try {
                const dom = document.querySelectorAll('.shopee-input__input')[1];
                if (dom) {
                  handler(dom, value);
                  clearInterval(interval);
                }
              } catch (e) {
                ipcRenderer.sendToHost('CC', { name: 'shopee', value, type, channel, msg: 'loi cmnr', err: e });
              }
            }, 500);
          }
          handler(inputAccount, value);
        }
      }
    } catch (e) {
      ipcRenderer.sendToHost('CC', { name: 'shopee', value, type, channel, msg: 'loi end catch', err: e });
    }
  });

  ipcRenderer.on(IPC_CHANNEL.CHANNEL_AUTO_SIGN_IN_CLICK, (e, channel) => {
    return 1;
    // if (channel === 'shopee') {
    //   setTimeout(() => {
    //     const interval = setInterval(() => {
    //       const inputAccount = document.querySelector('.shopee-input__input');
    //       const buttonElement = document.querySelector("button[class='shopee-button shopee-button--primary shopee-button--large shopee-button--block']");
    //       if (inputAccount && inputAccount.value && buttonElement) {
    //         buttonElement.click();
    //         clearInterval(interval);
    //       }
    //     }, 500);
    //   }, 2000);
    // }
  });
};

const handler = (inputDOM, value) => {
    try {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(inputDOM, value);
        const inputEvent = new Event("input", { bubbles: true });
        inputDOM.dispatchEvent(inputEvent);
    } catch (e) {

    }
};

const getUnread = (shop) => {
  try {
    if(!isLogin) throw('not login');
    if(window.location.pathname.indexOf('conversations') == -1) throw('page wrong');
    if(!firstNoti){
      let first_conversation = document.querySelector('.wQ5ux9JhSI .ReactVirtualized__Grid__innerScrollContainer .z8iJb5JoTh');
      firstNoti = true;
      ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION, {
        conversation: {
          last_time: Date.now(),
          md5_convertions: [
            first_conversation ? md5(first_conversation.textContent) : ""
          ]
        }
      });
      return
    }
    let document_unread = document.querySelectorAll('.wQ5ux9JhSI .ReactVirtualized__Grid__innerScrollContainer .z8iJb5JoTh ._3HQ7iP3Xw9 ._3OkO9gCL4m');
    let conversations = document.querySelectorAll('.wQ5ux9JhSI .ReactVirtualized__Grid__innerScrollContainer .z8iJb5JoTh');
    let new_conversations = [];
    for(let i = 0 ; i < conversations.length; i++){
      let item = conversations[i];
      if(item.querySelector('._3HQ7iP3Xw9 ._3OkO9gCL4m')){
        let time = item.querySelector('._3Ye0QdUU1-').textContent;
        if(time.indexOf(":") > -1){
          let date_now = new Date();
          let time_arr = time.split(":");
          date_now.setHours(parseInt(time_arr[0]));
          date_now.setMinutes(parseInt(time_arr[1]));
          let conversation = {
            user_name: item.querySelector('._2YvuyWzYMq').textContent,
            time: date_now.getTime(),
            snippet: item.querySelector('._2VgQumDqQ2').textContent,
            md5: md5(item.textContent)
          };
          if(date_now.getTime() > shop.conversation.last_time){
            if(shop.conversation.md5_convertions.indexOf(md5(item.textContent)) > -1) break;
            new_conversations.push(conversation);
          }
        }
      }
    }
    let msg = {
      total_unread: document_unread.length,
      new_conversations: new_conversations
    }
    if(new_conversations.length > 0){
      let md5_convertions = shop.conversation.md5_convertions;
      for(let i = new_conversations.length - 1; i >= 0; i--){
        md5_convertions.unshift(new_conversations[i]['md5']);
      }

      msg['conversation'] = {
        last_time: new_conversations[0]['time'],
        md5_convertions: md5_convertions.length > 10 ? md5_convertions.splice(0, 10) : md5_convertions
      }
    }
    ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION, msg);
  } catch(err){
    ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION);
    console.log(err);
  }
}

const getConversation = async (shop) => {
  try {
    if(!isLogin) throw('not login');
    if(!shop.auth_token) throw('not auth token');
    let response = await fetch(`${shop.option_webview.url_seller}/webchat/api/v1.2/conversation/unread-count?type_channel=1&_uid=0-${shop.platformSellerId}&_v=${shop._v}&csrf_token=${shop.csrf_token}`, {
      method: "GET",
      mode: "cors",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Referer: `${shop.option_webview.url_seller}/webchat/conversations`,
        Authorization: shop.auth_token,
      },
    })
    let data = await response.json();
    if(data.error_code) throw(data);

    let oldTime = shop.last_message_time_nano ? shop.last_message_time_nano : Date.now() * 1000000 - 1000;
    let conversation = await fetch(`${shop.option_webview.url_seller}/webchat/api/v1.2/conversations?next_timestamp_nano=${oldTime}&direction=latest&_uid=0-${shop.platformSellerId}&_v=${shop._v}&csrf_token=${shop.csrf_token}`, {
      method: "GET",
      mode: "cors",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Referer: `${shop.option_webview.url_seller}/webchat/conversations`,
        Authorization: shop.auth_token,
      },
    })
    conversation = await conversation.json();
    if(conversation.error_code) throw(conversation);
    if(conversation.length > 0){
      oldTime = conversation[0]['last_message_time_nano'];
    }
    let new_conversations = [];
    conversation.forEach((item) => {
      if(item.latest_message_from_id != shop.platformSellerId){
        let snippet = '';
        if(item.latest_message_type == 'text'){
          snippet = item.latest_message_content.text;
        } else if(item.latest_message_type == 'sticker'){
          snippet = 'Đã gửi cho bạn 1 sticker';
        } else if(item.latest_message_type == 'image'){
          snippet = 'Đã gửi cho bạn 1 hình ảnh';
        } else {
          snippet = 'Đã gửi cho bạn 1 '+item.latest_message_type;
        }
        new_conversations.push({
          user_name: item.to_name,
          time: new Date(item.last_message_time).getTime(),
          snippet: snippet,
          avatar: item.to_avatar
        })
      }
    })
    let msg = {
      total_unread: data.total_unread_count,
      last_message_time_nano: oldTime,
      new_conversations: new_conversations
    }
    console.log(conversation);
    // conversation = conversation.filter((item) => item.latest_message_from_id != shop.platformSellerId);

    ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION, msg);
  } catch(err){
    console.log('err', err);
    ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION);
  }   
}z
const getOrder = (shop) => {
  
  let countBefore = 0;
  let totalBefore = 0;
  let checkBefore = false;
  let countAfter = 0;
  let totalAfter = 0;
  let checkAfter = false;
  let arrCount = [];
  let arrTotal = [];
  let count = 0;
  let total = 0;
  if(window.arrCheckNewOrder.length === 0) {
    const item = {};
    item.shopId = shop.id;
    item.total = 0;
    item.count = 0;
    item.check = false;
    window.arrCheckNewOrder.push(item);

    countBefore = 0;
    totalBefore = 0;
    checkBefore = false;
  }else {
    const itemCheckNewOrder = window.arrCheckNewOrder.find((i)=>i.shopId===shop.id);
    if(itemCheckNewOrder){
      countBefore = itemCheckNewOrder.count;
      totalBefore = itemCheckNewOrder.total;
      checkBefore = true;
    }else {
      const item = {};
      item.shopId = shop.id;
      item.total = 0;
      item.count = 0;
      item.check = false;
      window.arrCheckNewOrder.push(item);
    }
  }
  try {
      arrCount = document.querySelectorAll('.currency-value') || [];
      arrTotal = document.querySelectorAll('.current-sales') || [];
  } catch (e) {
      ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_ORDER, { err: e });
  }
  if(arrCount.length > 1) {
    totalBefore = Number(arrCount[2].textContent);
  }
  if(arrTotal.length > 0) {
    const tmpValue = arrTotal[0].textContent
    const tmp = tmpValue.split('₫');
    countBefore = Number(tmp[1].replace(".", ""));
  }
  count = countAfter - checkBefore;
  total = totalAfter - totalBefore;

  const msg = {
    count,
    total
  }
  // if(count && total) {

  // }
  ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_ORDER, msg);
}
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};