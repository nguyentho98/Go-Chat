import React from 'react';
import * as _ from 'lodash';
import {getDecryptPassword, getKey} from '../../util/aesUtil';
import ipc_channels from '../../constants/ipc_channels';
import { notificationChannel } from '../../util/notificationChannel';
import {notification} from 'antd';

function usePrevious(value) {
    const ref = React.useRef();
    React.useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

let windowNtf;

function WebviewChannel(props) {
    const {
        visible,
        typeChannel,
        alias_admin,
        allowAccess,
        shop,
        updateShop,
        activeWebView,
        notification: notificationApp,
        windowNotify
    } = props;
    windowNtf = windowNotify;
    const prevVisible = usePrevious(visible);
    const prevShop = usePrevious(shop);

    const webview = React.useRef();

    React.useEffect(() => {
        try {
            if (webview && webview.current) {
                webview.current.addEventListener('dom-ready', async () => {
                    // webview.current.openDevTools();
                    webview.current.send(ipc_channels['IPC_CHANNEL']['CHANNEL_CHECK_ONLINE'], shop, typeChannel);
                    webview.current.send(ipc_channels['IPC_CHANNEL']['CHANNEL_GET_NEW_CONVERSATION'], shop, typeChannel);
                    if (shop.type === 'shopee' && typeChannel === 'live') {
                        console.log('shopee ban event lay order');
                        console.log('webview url', webview.current.getURL());
                        webview.current.send(ipc_channels['IPC_CHANNEL']['CHANNEL_GET_NEW_ORDER'], shop, typeChannel);
                    }
                });
                window.session.fromPartition(shop.option_webview.partition).webRequest.onBeforeSendHeaders({
                    urls: ['https://banhang.shopee.vn/webchat/api/v1.2/conversation/unread-count*']
                }, (details, callback) => {
                    let location = new URL(details.url);
                    if (location.search.indexOf('type_channel') === -1) {
                        let params = new URLSearchParams(location.search);
                        updateShop(shop.id, {
                            auth_token: details.requestHeaders.Authorization,
                            _v: params.get("_v")
                        });
                    }
                    callback({ requestHeaders: details.requestHeaders })
                });

                webview.current.addEventListener('new-window', (e) => {
                    // webview.current.loadURL(e.url);
                    let tab_blanks = shop.tab_blanks;
                    tab_blanks = tab_blanks ? tab_blanks : [];
                    let find_index = tab_blanks.findIndex((item) => e.url === item.url);
                    let key_active = null;
                    if(find_index === -1) {
                        let name = `Tab ${tab_blanks.length + 1}`;
                        let location = new URL(e.url);
                        if(location.href.indexOf('cf.shopee.vn/file') > -1){
                            try{
                                name = location.pathname.split('/')[2];
                            } catch(err){

                            }
                        } else {
                            name = location.hostname
                        }
                        let stt = tab_blanks.length > 0 ? tab_blanks[tab_blanks.length-1]['stt']+1 : 1;
                        key_active = 'tab_blank_' + stt + '_' + shop.id;
                        tab_blanks.push({
                            stt: stt,
                            url: e.url,
                            name: name,
                            key: key_active
                        });
                        updateShop(shop.id, {
                            tab_blanks: tab_blanks
                        });
                    } else {
                        key_active = tab_blanks[find_index]['key'];
                        if(document.querySelector(`[data-id="${key_active}"]`)){
                            document.querySelector(`[data-id="${key_active}"]`).src = e.url;
                        }
                    }
                    activeWebView({ key: key_active})
                });
                webview.current.addEventListener('ipc-message', (e) => {
                    let msg = e.args ? e.args[0] : {};
                    if (e.channel === 'CC') {
                        console.log('CC', msg);
                    }
                    if (e.channel === ipc_channels['IPC_CHANNEL']['CHANNEL_CHECK_ONLINE']) {
                        if (shop.is_logged && !msg.is_logged) {
                            let webviews = document.querySelectorAll(`[partition*="${shop.option_webview.partition}"]`);
                            webviews.forEach((item) => {
                                item.reload();
                            });
                            if (webview.current.getAttribute('data-id').indexOf('seller') === -1) {
                            }
                            activeWebView({
                                key: shop.option_webview.key_seller
                            });
                        }
                        if(shop.is_logged !== msg.is_logged){
                            msg['tab_blanks'] = [];
                        }
                        if(!shop.is_logged && msg.is_logged){
                            if(shop.type === 'lazada' && visible){
                                activeWebView({
                                    key: shop.option_webview.key_webchat
                                })
                            }
                        }
                        webview.current.send(ipc_channels['IPC_CHANNEL']['CHANNEL_CHECK_ONLINE'], shop, typeChannel);
                        updateShop(shop.id, msg);
                    }
                    if (e.channel === ipc_channels['IPC_CHANNEL']['CHANNEL_INPUT_AUTO_FILL']) {
                        console.log('logger: CHANNEL_INPUT_AUTO_FILL', e);
                    }
                    if (e.channel === ipc_channels['IPC_CHANNEL']['CHANNEL_GET_NEW_CONVERSATION']) {
                        onNotify(msg)
                    }

                    if (e.channel === ipc_channels['IPC_CHANNEL']['CHANNEL_GET_NEW_ORDER']) {
                        console.log("msg", msg);
                        setTimeout(() => {
                            webview.current.send(ipc_channels['IPC_CHANNEL']['CHANNEL_GET_NEW_ORDER'], shop, typeChannel);
                        }, 60000)
                    }
                });
                webview.current.addEventListener('did-start-loading', (e) => {
                    // console.log('start loading');
                });
                webview.current.addEventListener('did-stop-loading', (e) => {
                    // console.log('stop loading');
                });

                webview.current.addEventListener('console-message', (e) => {
                    if(shop.type === 'tiki'){
                    }
                });
                webview.current.addEventListener('update-target-url', (e) => {

                });
                webview.current.addEventListener('did-navigate', (e) => {
                });
                webview.current.addEventListener('did-finish-load', (e) => {
                    setTimeout(() => {
                        if (allowAccess) {
                            if (window.autoLogin.includes(shop.id)) {
                                handleFillByChannel(shop.type, shop, webview.current)
                            }
                        }
                    }, 5000);
                });
                webview.current.addEventListener('did-navigate-in-page', (e) => {
                    // console.log(e);
                });

                webview.current.addEventListener('did-fail-load', (e) => {
                    if(e.errorDescription.indexOf("ERR_INTERNET_DISCONNECTED") > -1){
                        notification.destroy('log_webview');
                        notificationApp({
                            message: 'Vui lòng kiểm tra lại',
                            description: 'Mã lỗi: '+e.errorDescription,
                            type: 'warning',
                            key: 'log_webview'
                        });
                        setTimeout(() => {
                            try{
                                let wv = document.querySelector(`[data-id="${webview.current.getAttribute('data-id')}"]`);
                                if(wv) wv.reload();
                            } catch(err){}
                        }, 3000)
                    }
                });
            }
        } catch (e) {
            console.log('effect error', e);
        }
    }, []);

    React.useEffect(() => {
        if (
            (
                visible !== prevVisible
                && visible
                && allowAccess
                && webview
                && webview.current
                && shop
            ) || (allowAccess && !_.isEqual(shop, prevShop))
        ) {
            webview.current.addEventListener("dom-ready", async () => {
                webview.current.send(ipc_channels['IPC_CHANNEL']['CHANNEL_CHECK_ONLINE'], shop, typeChannel);
                webview.current.send(ipc_channels['IPC_CHANNEL']['CHANNEL_GET_NEW_CONVERSATION'], shop, typeChannel);
                setTimeout(() => {
                    if (window.autoLogin.includes(shop.id)) {
                        handleFillByChannel(shop.type, shop, webview.current);
                    }
                }, 5000);
            });
        }
    });

    // React.useEffect(() => {
    //     if (
    //         (
    //             allowAccess
    //             && webview
    //             && webview.current
    //             && shop
    //         ) || (allowAccess && !_.isEqual(shop, prevShop))
    //     ) {
    //         webview.current.addEventListener("dom-ready", async () => {
    //             webview.current.send(ipc_channels['IPC_CHANNEL']['CHANNEL_GET_NEW_ORDER'], shop, typeChannel);
    //         });
    //     }
    // });


    // bắn notify
    const onNotify = (msg) => {
        let timeout = 5000;
        let count = 0 ;
        if (msg) {
            updateShop(shop.id, msg);
            if (msg.new_conversations && msg.new_conversations.length > 0) {
                msg.new_conversations.forEach((item) => {
                    notificationChannel({
                        title: shop.name,
                        subtitle: item.user_name,
                        content: item.snippet,
                        icon: shop.option_webview.icon_channel.round,
                        duration: 4,
                        group: item.user_name + ' - ' + shop.id,
                        timestamp: Date.now(),
                        time: item.time,
                        event: function(){
                            activeWebView({
                                key: shop.option_webview.key_webchat
                            });
                        }
                    });

                    if (windowNtf) {
                        window.notify({
                            title: shop.name,
                            subtitle: 'SapoGo Chat',
                            body: item.snippet,
                            silent: false,
                            timeoutType: 'default',
                            sound: true,
                            urgency: 'critical',
                            icon: shop.option_webview.icon_channel,
                            onClick: function() {
                                window.ipcRenderer.send('click-notify');
                                activeWebView({
                                    key: shop.option_webview.key_webchat
                                });
                            },
                        });
                    }
                })
            }
            timeout = 1000;
            count = 1;
        }
        // sau 30s mà không có tin nhắn mới thì giãn thời gian ra.
        if (count === 30) {
            timeout = 5000;
        }
        // cho chậm 1s để bớt phải crawl liên tục nhiều lần.
        setTimeout(() => {
            count++;
            webview.current && webview.current.send(ipc_channels['IPC_CHANNEL']['CHANNEL_GET_NEW_CONVERSATION'], shop, typeChannel);
        }, timeout);
    };

    // Xử lý bắn noti khi có đơn hàng mới Lazda, Shopee
    // const onNotifyNewOrder = (msg) => {
    //     let timeout = 5000;
    //     let count = 0 ;
    //     if (msg) {
    //         notificationChannel({
    //             title: shop.name,
    //             subtitle: item.user_name,
    //             content: item.snippet,
    //             icon: shop.option_webview.icon_channel.round,
    //             duration: 4,
    //             group: item.user_name + ' - ' + shop.id,
    //             timestamp: Date.now(),
    //             time: item.time,
    //             event: function(){
    //                 activeWebView({
    //                     key: shop.option_webview.key_webchat
    //                 });
    //             }
    //         });

    //         if (windowNtf) {
    //             window.notify({
    //                 title: shop.name,
    //                 subtitle: 'SapoGo Chat',
    //                 body: item.snippet,
    //                 silent: false,
    //                 timeoutType: 'default',
    //                 sound: true,
    //                 urgency: 'critical',
    //                 icon: shop.option_webview.icon_channel,
    //                 onClick: function() {
    //                     window.ipcRenderer.send('click-notify');
    //                     activeWebView({
    //                         key: shop.option_webview.key_webchat
    //                     });
    //                 },
    //             });
    //         }
            
         
    //     }
    //     setTimeout(() => {
    //         count++;
    //         webview.current && webview.current.send(ipc_channels['IPC_CHANNEL']['CHANNEL_GET_NEW_CONVERSATION'], shop, typeChannel);
    //     }, timeout);
    // };

    // Xử lý auto fill password cho các sàn.
    const handleFillByChannel = (channelType, shop, webview) => {
        if (!allowAccess) return;
        const info = getInfo(shop);
        const {
            password,
            account,
        } = info;
        if (!webview) {
            return;
        }
        switch (channelType) {
            case 'shopee': {
                webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_INPUT_AUTO_FILL'], account, 'account', 'shopee');
                webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_INPUT_AUTO_FILL'], password, 'password', 'shopee');
                if (account && password) {
                    handleAutoClick('shopee', webview);
                    if (window.autoLogin.includes(shop.id)) {
                        window.autoLogin = [...window.autoLogin.filter(i => i !== shop.id)];
                    }
                }
                break;
            }
            case 'lazada': {
                webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_INPUT_AUTO_FILL'], account, 'account', 'lazada');
                webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_INPUT_AUTO_FILL'], password, 'password', 'lazada');
                if (account && password) {
                    handleAutoClick('lazada', webview);
                    if (window.autoLogin.includes(shop.id)) {
                        window.autoLogin = [...window.autoLogin.filter(i => i !== shop.id)];
                    }
                }
                break;
            }
            case 'sendo': {
                webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_INPUT_AUTO_FILL'], account, 'account', 'sendo');
                webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_INPUT_AUTO_FILL'], password, 'password', 'sendo');

                if (account && password) {
                    handleAutoClick('sendo', webview);
                    if (window.autoLogin.includes(shop.id)) {
                        window.autoLogin = [...window.autoLogin.filter(i => i !== shop.id)];
                    }
                }
                break;
            }
            case 'tiki': {
                webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_INPUT_AUTO_FILL'], account, 'account', 'tiki');
                webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_INPUT_AUTO_FILL'], password, 'password', 'tiki');

                if (account && password) {
                    handleAutoClick('tiki', webview);
                    if (window.autoLogin.includes(shop.id)) {
                        window.autoLogin = [...window.autoLogin.filter(i => i !== shop.id)];
                    }
                }
                break;
            }
            default: break;
        }
    };

    const handleAutoClick = (channelType, webview) => {
        switch (channelType) {
            case 'shopee': {
                webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_AUTO_SIGN_IN_CLICK'], 'shopee');
                break;
            }
            case 'lazada': {
                webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_AUTO_SIGN_IN_CLICK'], 'lazada');
                break;
            }
            case 'sendo': {
                webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_AUTO_SIGN_IN_CLICK'], 'sendo');
                break;
            }
            case 'tiki': {
                webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_AUTO_SIGN_IN_CLICK'], 'tiki');
                break;
            }
            default: break;
        }
    };

    const getInfo = (shop) => {
        const {
            account,
            password,
            channel_identity,
            salt,
        } = shop;
        if (!password) {
            return {
                password: '',
                account,
            }
        }
        try {
            const key = getKey(alias_admin, channel_identity, salt);
            const des = getDecryptPassword(password, key);
            return {
                password: des.split(`_${salt}`)[0],
                account,
            }
        } catch (e) {
            console.log('err', e);
            return {
                password: '',
                account,
            }
        }
    };
    const returnTypeChanel = () => {
        if(typeChannel === 'seller'){
            return shop.option_webview.url_seller
        }
        if(typeChannel === 'chat') {
            return shop.option_webview.url_chat
        }
        return shop.option_webview.url_live
    }
    const returnDataId = () => {
        if(typeChannel === 'seller'){
            return shop.option_webview.key_seller
        }
        if(typeChannel === 'chat') {
            return shop.option_webview.key_webchat
        }
        return shop.option_webview.key_live
    }
    return (
        <div className={!visible ? "webview hidden" : "webview active"}>
            <webview
                className={shop.option_webview.key_seller}
                style={{ width: "100%", height: "100%" }}
                src={returnTypeChanel()}
                webpreferences="contextIsolation"
                partition={shop.option_webview.partition}
                preload={window.pathPreloader}
                useragent={window.navigator.userAgent}
                ref={webview}
                autosize="true"
                data-id={returnDataId()}
                data-type={typeChannel}
                // allowpopups="true"
            />
        </div>
    );
}

export default React.memo(WebviewChannel);
