const electron = require("electron");

const { ipcRenderer } = electron;
const session = electron.remote.session;

const { ADMIN } = require("./constants/ipc_channels");
var firstClick = false;
var isLogin = false;

exports.sapo = () => {
  init();
};

const init = () => {
  try {
    if(!isLogin && window.location.pathname.indexOf('login') > -1){
      if(document.querySelector('.title') && document.querySelector('.title').textContent == 'Xin lỗi! Cửa hàng này chưa có'){
        ipcRenderer.sendToHost(ADMIN.ADMIN_WRONG_ALIAS, {
          message: document.querySelector('.title').textContent
        });
      }
      let html = `
        <div class="btn-back-gochat" style="position: fixed;
        top: 30px;
        left: 30px;
        z-index: 99;
        background: #fff;
        padding: 10px 25px;
        border-radius: 20px;
        font-size: 13px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.14);
        font-weight: 400;
        cursor: pointer;
        display: flex;
        align-items: center;
        color: #46484a
        ">
          <span style="
          border: solid #46484a;
          border-width: 0 1.5px 1.5px 0;
          display: inline-block;
          padding: 3px;
          transform: rotate(135deg);
          margin-right: 8px"
          ></span>
          <span>Quay trở lại trang trước</span>
        </div>
      `;
      document.querySelector('body').insertAdjacentHTML('beforebegin', html);
      document.querySelector('.btn-back-gochat').addEventListener("click", function(){
        ipcRenderer.sendToHost(ADMIN.ADMIN_VIEW_ALIAS);
      })
    }
  } catch(er){

  }
  ipcRenderer.on(ADMIN.ADMIN_CHECK_ONLINE, async (e, arg) => {
    setTimeout(async () => {
      try{
        const checkLoginForm = document.getElementsByClassName("form-login");
        if (checkLoginForm.length === 0) {
          // let profile_picture_element = document.querySelector('.profile-pic');
          // let profile_picture = profile_picture_element ? profile_picture_element.src : 'public/avatar-default.png';
          let msg = {
            is_logged: true,
            location: JSON.parse(JSON.stringify(window.location)),
            full_name: arg.name ? arg.name.replace(/\n/g, '').trim() : '',
          };
          isLogin = true;
          const profile_picture = window.location.origin + '/favicon.ico';
          msg['profile_picture'] = profile_picture;
          let cookies = await session.fromPartition(arg.partition).cookies.get({ url: window.location.origin });
          msg['cookies'] = cookies;
          ipcRenderer.sendToHost(ADMIN.ADMIN_CHECK_ONLINE, msg);
        } else {
          isLogin = false;
          ipcRenderer.sendToHost(ADMIN.ADMIN_CHECK_ONLINE, {
            is_logged: false,
            location: JSON.parse(JSON.stringify(window.location)),
          });
        }
      } catch(err){

      }
    }, 1000);
  });
  ipcRenderer.on(ADMIN.ADMIN_LOGOUT, async (e, msg) => {
    try {
      // let btn_logout = document.querySelector('[bind-event-click="logout()"]');
      // if (btn_logout) btn_logout.click();
      if(msg.partition){
        let cookies = await session.fromPartition(msg.partition).cookies.get({ url: window.location.origin });
        for(let i = 0; i < cookies.length; i++){
          session.fromPartition(msg.partition).cookies.remove(window.location.origin, cookies[i]['name'])
        }
        ipcRenderer.sendToHost(ADMIN.ADMIN_LOGOUT, {
          is_logged: false
        })
      }
    } catch(err){

    }
  })
  ipcRenderer.on(ADMIN.ADMIN_GET_LIST_SHOP, async (e, msg) => {
    // ipcRenderer.sendToHost(ADMIN.ADMIN_GET_LIST_SHOP, {
    //   result: data
    // })
  })
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};