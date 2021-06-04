import React from 'react';
import { notification } from 'antd';

import ipc_channels from '../../constants/ipc_channels';

let account = {};

function WebviewSapo(props) {
    const {
        src,
        partition,
        visible,
        id,
        typeChannel,
        handleLoadingButton,
        errorAliasAdmin,
        viewAliasAdmin,
        typeAdmin,
        loginStatus,
        notification: notificationApp,
        currentAccount,
    } = props;
    const webview = React.useRef();
    account = currentAccount;

    React.useEffect( () => {
        if (webview && webview.current) {
            try {
                webview.current.addEventListener('dom-ready', () => {
                    console.log('ADMIN_CHECK_ONLINE dom ready', account.full_name);
                    webview.current.send(ipc_channels['ADMIN']['ADMIN_CHECK_ONLINE'], {
                        partition: webview.current.getAttribute('partition'),
                        name: account.full_name || '',
                    });
                });
                webview.current.addEventListener('new-window', (e) => {
                    webview.current.loadURL(e.url);
                });
                webview.current.addEventListener('ipc-message', (e) => {
                    try {
                        let msg = e.args ? e.args[0] : {};
                        if(msg && msg.is_logged){
                            // is_logged = msg.is_logged;
                        }
                        if (e.channel === ipc_channels['ADMIN']['ADMIN_CHECK_ONLINE']) {
                            loginStatus(msg);
                            webview.current.send(ipc_channels['ADMIN']['ADMIN_CHECK_ONLINE'], {
                                partition: webview.current.getAttribute('partition'),
                                name: account.full_name || ''
                            });
                            // if(msg.is_logged && !getListshop && alias_admin){
                            //     getListshop = true;
                            // }
                        }
                        if(e.channel === ipc_channels['ADMIN']['ADMIN_LOGOUT']){
                            loginStatus(msg);
                        }
                        if(e.channel === ipc_channels['ADMIN']['ADMIN_GET_LIST_SHOP']){
                            console.log(msg);
                        }
                        if(e.channel === ipc_channels['ADMIN']['ADMIN_WRONG_ALIAS']){
                            errorAliasAdmin(msg);
                        }
                        if(e.channel === ipc_channels['ADMIN']['ADMIN_VIEW_ALIAS']){
                            viewAliasAdmin()
                        }
                    } catch(err){
                        console.log(err);
                    }
                });
                webview.current.addEventListener('did-finish-load', function() {
                    // console.log('child :: finished loading - ');
                });
                webview.current.addEventListener('console-message', (e) => {
                    // console.log(e);

                });
                if(typeAdmin === 'login'){
                    webview.current.addEventListener('did-start-loading', (e) => {
                        console.log('start loading');
                    });
                    webview.current.addEventListener('did-stop-loading', (e) => {
                        handleLoadingButton(false);
                    })
                }
                webview.current.addEventListener('did-fail-load', (e) => {
                    if(e.errorDescription.indexOf("ERR_INTERNET_DISCONNECTED") > -1){
                        notification.destroy('log_webview');
                        notificationApp({
                            message: 'Vui lòng kiểm tra lại',
                            description: 'Mã lỗi: ' + e.errorDescription,
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
            } catch (e) {
                console.log('webview sapo err', e);
            }
        }
    }, []);

    return (
        <div
            className={!visible ? "webview hidden" : "webview active"}
        >
            <webview
                className={id}
                style={{ width: "100%", height: "100%" }}
                src={src}
                webpreferences="contextIsolation"
                partition={partition}
                preload={window.pathPreloader}
                useragent={window.navigator.userAgent}
                ref={webview}
                autosize="true"
                data-id={id}
                data-type={typeChannel}
                // allowpopups="true"
            />
        </div>
    );
}

WebviewSapo.defaultProps = {
    errorAliasAdmin: () => {},
    viewAliasAdmin: () => {},
    currentAccount: {},
};

export default React.memo(WebviewSapo);