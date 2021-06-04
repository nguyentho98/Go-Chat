import React, { Component } from 'react';
import { notification } from 'antd';
import * as _ from 'lodash';
import ipc_channels from '../constants/ipc_channels';
import {getDecryptPassword, getKey} from '../util/aesUtil';

import { notificationChannel } from '../util/notificationChannel';

notification.config({
    placement: 'bottomRight',
    bottom: 50,
    rtl: false,
    maxCount: 3
});

export default class WebViewComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hidden: false
        };
        this.webview = null;
        this.test = null;
        this.getListshop = false;
        this.firstSend = false;
        this.reloadPageError = null;
        this.is_logged = false;
    }
    componentDidMount = async () => {
        let _this = this;
        if (this.webview) {
            // this.webview.openDevTools();
            try {
                switch (this.props.type) {
                    case 'channel':
                        this.webview.addEventListener('dom-ready', async () => {
                            // this.webview.openDevTools();
                            this.webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_CHECK_ONLINE'], this.props.shop, this.props.typeChannel);
                            this.webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_GET_NEW_CONVERSATION'], this.props.shop, this.props.typeChannel);
                        });
                        window.session.fromPartition(this.props.partition).webRequest.onBeforeSendHeaders({
                            urls: ['https://banhang.shopee.vn/webchat/api/v1.2/conversation/unread-count*']
                        }, (details, callback) => {
                            let location = new URL(details.url);
                            if(location.search.indexOf('type_channel') == -1){
                                let params = new URLSearchParams(location.search);
                                this.props.updateShop(this.props.shop.id, {
                                    auth_token: details.requestHeaders.Authorization,
                                    _v: params.get("_v")
                                });
                            }
                            callback({ requestHeaders: details.requestHeaders })
                        })

                        this.webview.addEventListener('new-window', (e) => {
                            // this.webview.loadURL(e.url);
                            let tab_blanks = this.props.shop.tab_blanks;
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
                                key_active = 'tab_blank_'+stt+'_'+this.props.shop.id;
                                tab_blanks.push({
                                    stt: stt,
                                    url: e.url,
                                    name: name,
                                    key: key_active
                                });
                                this.props.updateShop(this.props.shop.id, {
                                    tab_blanks: tab_blanks
                                });
                            } else {
                                key_active = tab_blanks[find_index]['key'];
                                if(document.querySelector(`[data-id="${key_active}"]`)){
                                    document.querySelector(`[data-id="${key_active}"]`).src = e.url;
                                }
                            }
                            this.props.activeWebView({ key: key_active})
                        });
                        this.webview.addEventListener('ipc-message', (e) => {
                            let msg = e.args ? e.args[0] : {};
                            if (e.channel === 'CC') {
                                console.log('CC', msg);
                            }
                            if (e.channel === ipc_channels['IPC_CHANNEL']['CHANNEL_CHECK_ONLINE']) {
                                if (this.props.shop.is_logged && !msg.is_logged) {
                                    let webviews = document.querySelectorAll(`[partition*="${this.props.shop.option_webview.partition}"]`);
                                    webviews.forEach((item) => {
                                        item.reload();
                                    });
                                    if (this.webview.getAttribute('data-id').indexOf('seller') === -1) {
                                    }
                                    this.props.activeWebView({
                                        key: this.props.shop.option_webview.key_seller
                                    });
                                }
                                if(this.props.shop.is_logged !== msg.is_logged){
                                    msg['tab_blanks'] = [];
                                }
                                if(!this.props.shop.is_logged && msg.is_logged){
                                    if(this.props.shop.type === 'lazada' && this.props.visible){
                                        this.props.activeWebView({
                                            key: this.props.shop.option_webview.key_webchat
                                        })
                                    }
                                }
                                this.webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_CHECK_ONLINE'], this.props.shop, this.props.typeChannel);
                                this.props.updateShop(this.props.shop.id, msg);
                            }
                            if (e.channel === ipc_channels['IPC_CHANNEL']['CHANNEL_INPUT_AUTO_FILL']) {
                                console.log('logger: CHANNEL_INPUT_AUTO_FILL', e);
                            }
                            if (e.channel === ipc_channels['IPC_CHANNEL']['CHANNEL_GET_NEW_CONVERSATION']) {
                                let timeout = 5000;
                                let count = 0 ;
                                if (msg) {
                                    this.props.updateShop(this.props.shop.id, msg);
                                    if (msg.new_conversations && msg.new_conversations.length > 0) {
                                        msg.new_conversations.forEach((item) => {
                                            notificationChannel({
                                                title: this.props.shop.name,
                                                subtitle: item.user_name,
                                                content: item.snippet,
                                                icon: this.props.shop.option_webview.icon_channel.round,
                                                duration: 4,
                                                group: item.user_name+' - '+this.props.shop.id,
                                                timestamp: Date.now(),
                                                time: item.time,
                                                event: function(){
                                                    _this.props.activeWebView({
                                                        key: _this.props.shop.option_webview.key_webchat
                                                    });
                                                }
                                            })
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
                                    this.webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_GET_NEW_CONVERSATION'], this.props.shop, this.props.typeChannel);
                                }, timeout);
                            }
                        });
                        this.webview.addEventListener('did-start-loading', (e) => {
                            // console.log('start loading');
                        });
                        this.webview.addEventListener('did-stop-loading', (e) => {
                            // console.log('stop loading');
                        });

                        this.webview.addEventListener('console-message', (e) => {
                            if(this.props.shop.type === 'tiki'){
                            }
                        });
                        this.webview.addEventListener('update-target-url', (e) => {

                        });
                        this.webview.addEventListener('did-navigate', (e) => {
                        });
                        this.webview.addEventListener('did-finish-load', (e) => {
                            setTimeout(() => {
                                if (this.props.allowAccess) {
                                    if (window.autoLogin.includes(this.props.shop.id)) {
                                        this.handleFillByChannel(this.props.shop.type, this.props.shop, this.webview)
                                    }
                                }
                            }, 5000);
                        });
                        this.webview.addEventListener('did-navigate-in-page', (e) => {
                            // console.log(e);
                        });
                        break;
                    case 'admin':
                        this.webview.addEventListener('dom-ready', () => {
                            this.webview.send(ipc_channels['ADMIN']['ADMIN_CHECK_ONLINE'], {
                                partition: this.webview.getAttribute('partition')
                            });
                        });
                        this.webview.addEventListener('new-window', (e) => {
                            this.webview.loadURL(e.url);
                        });
                        this.webview.addEventListener('ipc-message', (e) => {
                            try {
                                let msg = e.args ? e.args[0] : {};
                                if(msg && msg.is_logged){
                                    this.is_logged = msg.is_logged;
                                }
                                if (e.channel === ipc_channels['ADMIN']['ADMIN_CHECK_ONLINE']) {
                                    this.props.loginStatus(msg);
                                    this.webview.send(ipc_channels['ADMIN']['ADMIN_CHECK_ONLINE'], {
                                        partition: this.webview.getAttribute('partition')
                                    });
                                    if(msg.is_logged && !this.getListshop && this.props.alias_admin){
                                        this.getListshop = true;
                                        // this.webview.send(ipc_channels['ADMIN']['ADMIN_GET_LIST_SHOP'], {
                                        //     alias: this.props.alias_admin
                                        // })
                                    }
                                }
                                if(e.channel === ipc_channels['ADMIN']['ADMIN_LOGOUT']){
                                    this.props.loginStatus(msg);
                                }
                                if(e.channel === ipc_channels['ADMIN']['ADMIN_GET_LIST_SHOP']){
                                    console.log(msg);
                                }
                                if(e.channel === ipc_channels['ADMIN']['ADMIN_WRONG_ALIAS']){
                                    this.props.errorAliasAdmin(msg);
                                }
                                if(e.channel === ipc_channels['ADMIN']['ADMIN_VIEW_ALIAS']){
                                    this.props.viewAliasAdmin()
                                }
                            } catch(err){
                                console.log(err);
                            }
                        });
                        this.webview.addEventListener('did-finish-load', function() {
                            // console.log('child :: finished loading - ');
                        });
                        this.webview.addEventListener('console-message', (e) => {
                            // console.log(e);

                        });
                        if(this.props.typeAdmin === 'login'){
                            this.webview.addEventListener('did-start-loading', (e) => {
                                console.log('start loading');
                            });
                            this.webview.addEventListener('did-stop-loading', (e) => {
                                this.props.handleLoadingButton(false);
                            })
                        }
                        break;
                    case 'tab_blank':
                        this.webview.addEventListener('dom-ready', async () => {
                            if(this.props.shop){
                                let title = this.webview.getTitle();
                                let findIndex = this.props.shop.tab_blanks.findIndex((item) => item.key === this.props.id);
                                if(findIndex > -1){
                                    let tab_blanks = this.props.shop.tab_blanks;
                                    tab_blanks[findIndex]['name'] = title;
                                    this.props.updateShop(this.props.shop.id, {
                                        tab_blanks: tab_blanks
                                    })
                                }
                            }
                        });
                        break;
                    default:
                        break;
                }
                this.webview.addEventListener('did-fail-load', (e) => {
                    if(e.errorDescription.indexOf("ERR_INTERNET_DISCONNECTED") > -1){
                        notification.destroy('log_webview');
                        this.props.notification({
                            message: 'Vui lòng kiểm tra lại',
                            description: 'Mã lỗi: '+e.errorDescription,
                            type: 'warning',
                            key: 'log_webview'
                        });
                        setTimeout(() => {
                            try{
                                let webview = document.querySelector(`[data-id="${this.webview.getAttribute('data-id')}"]`);
                                if(webview) webview.reload();
                            } catch(err){}
                        }, 3000)
                    }
                });
                this.webview.addEventListener('ipc-message', (e) => {
                    if(e.channel === 'click_element'){
                        if(this.props.visiblePopupFilter && this.props.setVisibleFilter){
                            this.props.setVisibleFilter(false);
                        }
                    }
                })

            } catch (err) {
                console.log('err', err);
            }
        }
    };

    componentDidUpdate(prevProps) {
        const {
            visible,
            shop,
            allowAccess,
            typeChannel
        } = this.props;
        if (
            (visible !== prevProps.visible && visible && allowAccess && this.webview && shop)
            || (allowAccess && !_.isEqual(shop, prevProps.shop))
        ) {
            this.webview.addEventListener("dom-ready", async () => {
                this.webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_CHECK_ONLINE'], shop, typeChannel);
                this.webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_GET_NEW_CONVERSATION'], shop, typeChannel);
                setTimeout(() => {
                    if (window.autoLogin.includes(shop.id)) {
                        this.handleFillByChannel(shop.type, shop, this.webview);
                    }
                }, 5000);
            });
        }
    }

    componentWillUnmount = () => {
        if(this.webview){
            this.webview.removeEventListener("ipc-message", function(e){
                console.log(e);
            });
        }
    };

    // Xử lý auto fill password cho các sàn.
    handleFillByChannel = (channelType, shop, webview) => {
        const { allowAccess } = this.props;
        if (!allowAccess) return;
        const info = this.getInfo(shop);
        const {
            password,
            account,
        } = info;
        if (!webview) {
            console.log('ko co webview');
            return;
        }
        switch (channelType) {
            case 'shopee': {
                console.log('------------------------------');
                webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_INPUT_AUTO_FILL'], account, 'account', 'shopee');
                webview.send(ipc_channels['IPC_CHANNEL']['CHANNEL_INPUT_AUTO_FILL'], password, 'password', 'shopee');
                console.log('------------------------------');
                if (account && password) {
                    this.handleAutoClick('shopee', webview);
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
                    this.handleAutoClick('lazada', webview);
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
                    this.handleAutoClick('sendo', webview);
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
                    this.handleAutoClick('tiki', webview);
                    if (window.autoLogin.includes(shop.id)) {
                        window.autoLogin = [...window.autoLogin.filter(i => i !== shop.id)];
                    }
                }
                break;
            }
            default: break;
        }
    };

    handleAutoClick = (channelType, webview) => {
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

    getInfo = (shop) => {
        const { alias_admin } = this.props;
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

    setRef = (e) => {
      this.webview = e;
    };

    render = () => {
        const { src, partition, visible, id, typeChannel} = this.props;
        return (
            <div className={!visible ? "webview hidden" : "webview active"}>
                <webview className={id} style={{ width: "100%", height: "100%" }} src={src} webpreferences="contextIsolation"
                    partition={partition} preload={window.pathPreloader} useragent={window.navigator.userAgent}
                    ref={this.setRef} autosize="true" data-id={id} data-type={typeChannel}
                // allowpopups="true"
                />
            </div>
        );
    }
}
