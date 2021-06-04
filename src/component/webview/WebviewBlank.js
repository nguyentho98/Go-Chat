import React from 'react';

import {notification} from 'antd';

function WebviewBlank(props) {
    const {
        id,
        src,
        shop,
        visible,
        typeChannel,
        updateShop,
        notification: notificationApp
    } = props;

    const webview = React.useRef();

    React.useEffect(() => {
        try {
            webview.current.addEventListener('dom-ready', async () => {
                if(shop){
                    let title = webview.current.getTitle();
                    let findIndex = shop.tab_blanks.findIndex((item) => item.key === id);
                    if(findIndex > -1){
                        let tab_blanks = shop.tab_blanks;
                        tab_blanks[findIndex]['name'] = title;
                        updateShop(shop.id, {
                            tab_blanks: tab_blanks
                        })
                    }
                }
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
        } catch (e) {
            console.log('tab blank err', e);
        }
    }, []);

    return (
        <div
            className={!visible ? "webview hidden" : "webview active"}>
            <webview
                className={id}
                style={{ width: "100%", height: "100%" }}
                src={src}
                webpreferences="contextIsolation"
                partition={shop.option_webview.partition}
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

export default React.memo(WebviewBlank);
