import React, {Component} from 'react';
import * as _ from 'lodash';
import './App.css';
import 'antd/dist/antd.css';
import './layout.css';
import callApi from './util/callApi';

import AccessDenied from './component/AccessDenied';

import {
    SideBarComponent,
    EmptySelectedChannel,
    SplashScreenComponent,
    FormAliasSapoComponent,
    GuideComponent,
    NotificationComponent,
    SettingGoChat,
} from './component';
import {notification} from 'antd';
import {
    IconShopee,
    IconTiki,
    IconSendo,
    IconLazada,
    LogoSapo2,
    IconShopeeRound,
    IconSendoRound,
    IconLazadaRound,
    IconTikiRound
} from './icons';
import channelUrl from './constants/domains';
import NewVersion from './component/newVersion';
import Fetching from './component/fetching';
import WebviewSapo from './component/webview/WebviewSapo';
import WebviewChannel from './component/webview/WebviewChannel';
import WebviewBlank from './component/webview/WebviewBlank';

require('moment/locale/vi');

// detect event khách hàng bấm nút logout trên các trang sàn.
window.autoLogin = [];

const url = 'https://market-place.sapoapps.vn/home/connections';

export default class AppComponent extends Component {
    constructor(props) {
        super(props);
        let alias_admin = localStorage.getItem("alias_admin");
        this.state = {
            userMain: null,
            listShop: [],
            shopActive: null,
            webViewActive: null,
            viewChannelsId: this.getViewChannelsId(),
            loginAdmin: false,
            nextApp: !localStorage.getItem("next_app"),
            linkAdmin: alias_admin ? `https://${alias_admin}.mysapo.vn` : null,
            settingLinkAdmin: !!localStorage.getItem("next_app"),
            alias_admin: alias_admin,
            guideScreen: false,
            showFormAdmin: false,
            checkingVersion: true,
            newVersion: false,
            closeUpdate: false,
            windowNotify: false,
            currentAccount: {},
            // (cái này chưa biết xử lý nào hiện tại chỉ để state ẩn hiện component, cách tốt hơn e nghĩ là dùng 1 biến string để lưu tên định danh nó là router để render ra các componnet)
            visibleComponent: false,
        };
        this.time_set_baget = null;
    }

    componentDidMount = async () => {
        if (window.ipcRenderer) {
            window.ipcRenderer.on('ping', (event, arg) => {
                this.setState({ipc: true});
                window.ipcRenderer.send('ping', 'ok')
            });
            window.ipcRenderer.on('noti-in-app', (event, arg) => {
                this.setState({ windowNotify: arg })
            });
            window.ipcRenderer.send('app_version');
            window.ipcRenderer.on('app_version', (event, arg) => {
                window.ipcRenderer.removeAllListeners('app_version');
                console.log('Version ' + arg.version);
                this.getVersion(arg.version);
            });
            window.ipcRenderer.on('update_available', () => {
                window.ipcRenderer.removeAllListeners('update_available');
                console.log('A new update is available. Downloading now...');
            });
            window.ipcRenderer.on('update_downloaded', () => {
                window.ipcRenderer.removeAllListeners('update_downloaded');
                console.log('Update Downloaded. It will be installed on restart. Restart now?');
            });
            window.addEventListener('keydown', (e) => {
                if (e.keyCode === 123) {
                    window.ipcRenderer.send('open_dev_tool');
                }
            })
        }
    };

    doLogout = () => {
        let alias_admin = localStorage.getItem("alias_admin");
        this.setState({
            userMain: null,
            listShop: [],
            shopActive: null,
            webViewActive: null,
            viewChannelsId: this.getViewChannelsId(),
            loginAdmin: false,
            nextApp: !localStorage.getItem("next_app"),
            linkAdmin: alias_admin ? `https://${alias_admin}.mysapo.vn` : null,
            settingLinkAdmin: !!localStorage.getItem("next_app"),
            alias_admin: alias_admin,
            guideScreen: false,
            showFormAdmin: false,
        })
    };

    updateShop = (id, data) => {
        const listShop = [...this.state.listShop];
        let shopIndex = this.state.listShop.findIndex((item) => item.id === id);
        if (shopIndex > -1) {
            for (let key in data) {
                listShop[shopIndex][key] = data[key];
                if (!_.isEqual(listShop, this.state.listShop)) {
                    this.setState({
                        listShop
                    });
                }
            }
        }
    };

    activeWebView = (option) => {
        let {key, url} = option;
        this.setState({
            webViewActive: key,
            visibleComponent: false,
        });
        if (url) {
            let webview = document.querySelector(`.${key}`);
            if (webview) {
                let src_now = new URL(webview.src);
                let src_new = new URL(url);
                if (src_now.pathname !== src_new.pathname) {
                    webview.src = url;
                }
            }
        }
    };

    notification = (option) => {
        let {message, description, placement, type, duration, key} = option;
        placement = placement ? placement : 'topRight';
        type = type ? type : 'info';
        let msg = {
            message: message,
            description: description,
            placement: placement,
            rtl: false,
            duration: duration ? duration : 5
        };

        if (key) msg['key'] = key;
        notification[type](msg);
    };

    getViewChannelsId = () => {
        try {
            return localStorage.getItem("view_channels") ? JSON.parse(localStorage.getItem("view_channels")) : [];
        } catch (err) {
            return [];
        }
    };

    getLogoChannels = (type) => {
        let result = {
            default: LogoSapo2
        };
        switch (type) {
            case 'shopee':
                result['default'] = IconShopee;
                result['round'] = IconShopeeRound;
                break;
            case 'lazada':
                result['default'] = IconLazada;
                result['round'] = IconLazadaRound;
                break;
            case 'sendo':
                result['default'] = IconSendo;
                result['round'] = IconSendoRound;
                break;
            case 'tiki':
                result['default'] = IconTiki;
                result['round'] = IconTikiRound;
                break;
            default:
                break
        }
        return result;
    };

    saveViewChannel = (ids = []) => {
        localStorage.setItem("view_channels", JSON.stringify(ids));
        this.setState({
            viewChannelsId: ids
        })
    };

    getOptionChannel = (option) => {
        let {type, id} = option;
        let result = {
            key_seller: `seller_${type}_${id}`,
            partition: `persist:${id}`,
            icon_channel: this.getLogoChannels(type)
        };
        switch (type) {
            case 'shopee':
                result['key_webchat'] = `webchat_${type}_${id}`;
                result['key_live'] = `order_${type}_${id}`;
                result['url_chat'] = `${channelUrl['shopee']['vn']}/webchat/conversations`;
                result['url_live'] = `${channelUrl['shopee']['vn']}/datacenter/liveboard`;
                result['url_seller'] = `${channelUrl['shopee']['vn']}`;
                break;
            case 'lazada':
                result['key_webchat'] = `webchat_${type}_${id}`;
                result['key_live'] = `order_${type}_${id}`;
                result['url_chat'] = `${channelUrl['lazada']['vn']}/apps/im/window`;
                result['url_live'] = `${channelUrl['lazada']['vn']}/ba/livemonitor`;
                result['url_seller'] = `${channelUrl['lazada']['vn']}`;
                break;
            case 'sendo':
                result['url_seller'] = `${channelUrl['sendo']['vn']}`;
                break;
            case 'tiki':
                result['url_seller'] = `${channelUrl['tiki']['vn']}`;
                break;
            default:
                break;
        }

        return result;
    };

    getVersion = async (currentVersion) => {
        const endpoint = url + '/gochat-version';
        // const endpoint = 'http://localhost:8868/home/connections' + '/gochat-version';
        try {
            const option = {
                method: 'GET',
                headers: {}
            };
            const fetchResult = await callApi(endpoint, option);
            const data = fetchResult.data;
            if (data !== currentVersion) {
                this.setState({
                    newVersion: true,
                    checkingVersion: false,
                });
            } else {
                this.setState({
                    newVersion: false,
                    checkingVersion: false,
                });
            }
        } catch (e) {
            this.setState({
                newVersion: false,
                checkingVersion: false,
            });
        }
    };

    getListShop = async () => {
        window.autoLogin = [];
        try {
            this.setState({reloadShop: true});
            let cookies = this.state.userMain.cookies;
            let admin_session = cookies.find((item) => item.name === "_admin_session_id");
            if (!admin_session) throw ('not session');
            // const endpoint = `https://market-place.sapoapps.vn/home/connections?alias=${this.state.alias_admin}`;
            // const endpoint = `https://market-place-staging.sapoapps.vn/home/connections?alias=${this.state.alias_admin}`;
            // const endpoint = `http://localhost:8868/home/connections?alias=${this.state.alias_admin}`;
            const endpoint = url + `?alias=${this.state.alias_admin}`;
            const formData = new FormData();
            formData.append("Cookie", `_admin_session_id=${admin_session.value}`);
            const option = {
                method: "POST",
                headers: {},
                body: formData,
                credentials: "include"
            };
            const fetchResult = await fetch(endpoint, option);
            let data = await fetchResult.json();
            if (data.connections) {
                const account = data.account || {};
                data = data.connections.map((item) => {
                    item.type = item.type.toLowerCase();
                    item.option_webview = this.getOptionChannel(item);
                    if (item.allow_access) {
                        window.autoLogin.push(item.id);
                    }
                    return item;
                });
                let new_view_channel_ids = data.map((item) => item.id.toString());
                localStorage.setItem("view_channels", JSON.stringify(new_view_channel_ids));
                this.timeout = setTimeout(() => {
                    this.setState((prevState) => ({
                        reloadShop: false,
                        listShop: data,
                        viewChannelsId: new_view_channel_ids,
                        currentAccount: account || {},
                        userMain: prevState.userMain ? {...prevState.userMain, full_name: account.full_name} : prevState.userMain,
                    }));
                    this.notification({
                        message: "Làm mới gian hàng",
                        description: "Làm mới gian hàng thành công!",
                        type: 'success'
                    });
                    if (data.length === 0) {
                        this.activeWebView({
                            key: 'admin_sapo',
                            url: this.state.linkAdmin + '/admin/apps/market-place/home/dashboard'
                        })
                    } else {
                        if (this.time_set_baget) clearInterval(this.time_set_baget);
                        this.time_set_baget = setInterval(() => {
                            if (this.state.userMain) {
                                this.setBaget();
                            } else {
                                clearInterval(this.time_set_baget)
                            }
                        }, 1000)
                    }
                }, 500)
            }
        } catch (err) {
            this.setState({reloadShop: false});
            console.log(err);
            this.notification({
                message: "Làm mới gian hàng",
                description: "Đã có lỗi xảy ra..",
                type: 'warning'
            });
            this.activeWebView({
                key: 'admin_sapo'
            })
        }
    };

    setBaget = () => {
        let badge = 0;
        let listShop = this.state.listShop;
        if (listShop) {
            listShop.forEach((item) => {
                badge += item.total_unread ? item.total_unread : 0
            });
            // badge = badge >= 10 ? `9+` : badge > 0 ? `${badge.toString()}` : '';
            window.ipcRenderer.send('set-badge', {
                badge: badge
            })
        }
    };

    componentWillUnmount = () => {
        if (this.time_set_baget) clearInterval(this.time_set_baget);
        if (this.timeout) clearTimeout(this.timeout);
    };

    loginStatus = (msg) => {
        const { userMain } = this.state;
        if (msg.is_logged) {
            if (userMain) return;
            this.setState({userMain: msg})
        } else if (!userMain) {
            return;
        }
        this.setState({
            linkAdmin: null, userMain: null, settingLinkAdmin: true,
            listShop: [],
            shopActive: null,
            webViewActive: null,
            viewChannelsId: this.getViewChannelsId(),
            loginAdmin: false,
            nextApp: !localStorage.getItem("next_app"),
            guideScreen: false,
            showFormAdmin: false,
        })
    };

    handleLogin = (msg) => {
        if (msg.is_logged) {
            setTimeout(() => {
                this.setState({
                    linkAdmin: msg.location.origin,
                    userMain: msg,
                    showFormAdmin: false,
                    errorAlias: null
                });
                this.getListShop();
            }, 300)
        }
    };

    onShowViewComponent = () => {
        this.setState({
            visibleComponent: true,
        })
    }
    render = () => {
        const {
            reloadShop,
            listShop,
            newVersion,
            checkingVersion,
            closeUpdate,
            windowNotify
        } = this.state;
        if (checkingVersion) {
            return (
                <div id="app" className="justify-content-center bg-login">
                    <Fetching>
                        Đang kiểm tra phiên bản
                    </Fetching>
                </div>
            );
        }
        if (newVersion && !closeUpdate) {
            return (
                <div
                    id="app" className="bg-login"
                >
                    <NewVersion />
                    <div
                        style={{
                            position: 'absolute', top: 15, right: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                        onClick={() => this.setState({ closeUpdate: true })}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 6L18 18" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>

                    </div>
                </div>
            );
        }
        if (!this.state.userMain) {
            return <div id="app" className="bg-login">
                {
                    this.state.nextApp ?
                        <SplashScreenComponent nextApp={() => {
                            this.setState({nextApp: false, guideScreen: true});
                            localStorage.setItem("next_app", 1);
                        }} notification={this.notification}/>
                        : null
                }
                {
                    this.state.guideScreen ? <GuideComponent nextApp={() => {
                        this.setState({guideScreen: false, settingLinkAdmin: true, errorAlias: null});
                        localStorage.setItem("next_app", 2);
                    }} notification={this.notification}/> : null
                }
                {
                    this.state.settingLinkAdmin ?
                        <FormAliasSapoComponent
                            notification={this.notification} loginAdmin={(e) => {
                            // console.log(e);
                            this.setState({
                                loadingWebViewAdmin: true,
                                linkAdmin: e.domain,
                                alias_admin: e.alias,
                                showFormAdmin: true
                            })
                        }}
                            errorAlias={this.state.errorAlias}
                            changeErrorAlias={(message) => this.setState({errorAlias: message})}
                            loadingWebViewAdmin={this.state.loadingWebViewAdmin}
                            handleLoadingButton={(e) => this.setState({loadingWebViewAdmin: e})}
                        /> : null
                }
                {
                    // webview lúc chưa đăng nhập (userMain = null)
                    this.state.showFormAdmin ?
                        <WebviewSapo
                            src={this.state.linkAdmin}
                            visible={!this.state.loadingWebViewAdmin} id={'admin_sapo'}
                            type='admin' partition={`persist:admin_sapo`}
                            loginStatus={this.handleLogin}
                            notification={this.notification}
                            errorAliasAdmin={(e) => {
                                this.setState({
                                    showFormAdmin: false,
                                    settingLinkAdmin: true,
                                    errorAlias: e.message
                                })
                            }}
                            viewAliasAdmin={() => {
                                this.setState({
                                    showFormAdmin: false,
                                    settingLinkAdmin: true
                                })
                            }}
                            handleLoadingButton={(e) => this.setState({loadingWebViewAdmin: e})}
                            typeAdmin="login"
                        /> : null
                }
            </div>
        }

        return (
            <div id="app">
                <NotificationComponent />
                <SideBarComponent
                    listShop={listShop}
                    activeWebView={this.activeWebView}
                    webViewActive={this.state.webViewActive}
                    notification={this.notification} viewChannelsId={this.state.viewChannelsId}
                    getLogoChannels={this.getLogoChannels} saveViewChannel={this.saveViewChannel}
                    getOptionChannel={this.getOptionChannel} userMain={this.state.userMain}
                    linkAdmin={this.state.linkAdmin}
                    getListShop={this.getListShop}
                    reloadShop={this.state.reloadShop}
                    getViewChannelsId={this.getViewChannelsId}
                    updateShop={this.updateShop}
                    GuideScreen={() => this.setState({
                        // guideScreenAdmin: true,
                        webViewActive: null
                    })}
                    doLogout={this.doLogout}
                    onShowViewComponent={this.onShowViewComponent}
                />
                <div id="webview">
                    {
                        this.state.guideScreenAdmin ? <GuideComponent/> : !this.state.webViewActive ?
                            <EmptySelectedChannel/> : null
                    }
                    {
                        this.state.visibleComponent ? <SettingGoChat /> : null
                    }
                    {
                       !this.state.visibleComponent && this.state.listShop.map((item) => {
                            if (reloadShop) return null;
                            if (this.state.viewChannelsId.length > 0 && this.state.viewChannelsId.indexOf(item.id.toString()) === -1) return null;
                            if (!item || !item.allow_access) {
                                return (
                                    <AccessDenied
                                        name={item.short_name || item.name}
                                        visible={this.state.webViewActive === item.option_webview.key_seller && !this.state.visibleComponent}
                                    />
                                )
                            }
                            let webviews = [
                                <WebviewChannel
                                    key={item.option_webview.key_seller}
                                    shop={item}
                                    updateShop={this.updateShop}
                                    visible={this.state.webViewActive === item.option_webview.key_seller && !this.state.visibleComponent}
                                    activeWebView={this.activeWebView}
                                    typeChannel="seller"
                                    notification={this.notification}
                                    alias_admin={this.state.alias_admin}
                                    allowAccess={item.allow_access}
                                    windowNotify={windowNotify}
                                />
                            ];
                            if (item.is_logged && item.option_webview.key_webchat) {
                                webviews.push(
                                    <WebviewChannel
                                        key={item.option_webview.activeWebView}
                                        shop={item}
                                        visible={this.state.webViewActive === item.option_webview.key_webchat && !this.state.visibleComponent}
                                        updateShop={this.updateShop}
                                        activeWebView={this.activeWebView}
                                        typeChannel="chat"
                                        notification={this.notification}
                                        windowNotify={windowNotify}
                                    />);
                            }
                            if (item.is_logged && item.option_webview.key_webchat) {
                                webviews.push(
                                    <WebviewChannel
                                        key={item.option_webview.key_webchat}
                                        shop={item}
                                        visible={this.state.webViewActive === item.option_webview.key_webchat && !this.state.visibleComponent}
                                        updateShop={this.updateShop}
                                        activeWebView={this.activeWebView}
                                        typeChannel="chat"
                                        notification={this.notification}
                                        windowNotify={windowNotify}
                                    />);
                            }
                            if (item.is_logged && item.option_webview.key_live) {
                                webviews.push(
                                    <WebviewChannel
                                        key={item.option_webview.key_live}
                                        shop={item}
                                        visible={false}
                                        updateShop={this.updateShop}
                                        activeWebView={this.activeWebView}
                                        typeChannel="live"
                                        notification={this.notification}
                                        windowNotify={windowNotify}
                                    />);
                            }
                            if (item.tab_blanks) {
                                item.tab_blanks.forEach((tab) => {
                                    webviews.push(
                                        <WebviewBlank
                                            key={tab.key}
                                            src={tab.url}
                                            visible={this.state.webViewActive === tab.key && !this.state.visibleComponent}
                                            id={tab.key} activeWebView={this.activeWebView}
                                            type="tab_blank"
                                            shop={item}
                                            updateShop={this.updateShop}
                                            notification={this.notification}
                                        />);
                                })
                            }
                            return webviews
                        })
                    }
                    <WebviewSapo
                        src={this.state.linkAdmin}
                        visible={this.state.webViewActive === 'admin_sapo' && !this.state.visibleComponent}
                        id={'admin_sapo'}
                        partition={`persist:admin_sapo`}
                        loginStatus={this.loginStatus}
                        notification={this.notification}
                        currentAccount={this.state.currentAccount}
                    />
                </div>
            </div>
        );
    }
}
