import React, { Component } from 'react';
import {
  LogoSapo2, LogoSapo, IconAdd, IconLogout, IconReload, IconBar, IconShopee,
  IconTiki, IconSendo, IconClose1, IconBack, IconGuide, IconLazada, IconSetting1
} from '../icons';

import { Menu, Popover, Tooltip } from 'antd';
import FilterChannel from './filterChannel';

const { SubMenu } = Menu;

export default class SidebarComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    window.addEventListener('click', this.onOutSideClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onOutSideClick);
  }

  onDivClick = (e) => {
    e.stopPropagation();
  };

  onOutSideClick = () => {
    this.setState({ visible: false });
  };

  handleVisibleChange = visible => {
    this.setState({ visible });
  };

  handleClick = e => {
    let key = e.key;
    this.props.activeWebView({
      key: key,
    });
  };

  handleClickMenuSapo = e => {
    const { doLogout } = this.props;
    try {
      let location = new URL(this.props.linkAdmin);
      if (e.key === 'connect_channel') {
        this.props.activeWebView({
          key: 'admin_sapo',
          url: location.origin + '/admin/apps/market-place/home/dashboard'
        });
      } else if (e.key === 'setting') {
        this.props.activeWebView({
          key: 'admin_sapo',
          url: location.origin + '/admin/settings'
        });
      } else if (e.key === 'logout') {
        doLogout();
        let webview = document.querySelector('[data-id="admin_sapo"]');
        webview.send('adminLogOut', {
          partition: webview.getAttribute("partition"),
        });
      } else if (e.key === 'guide') {
        window.shell.openExternal('https://support.sapo.vn/phan-mem-chat-da-san-sapo-gochat');
      } else if (e.key === 'setting_go_chat') {
        this.props.onShowViewComponent()
      }
    } catch (err) {

    }
  };

  render = () => {
    console.log('re-render side bar');
    var { listShop } = this.props;
    listShop = listShop.sort((a, b) => b.time_created - a.time_created);
    let type_selected = [];
    if (this.props.viewChannelsId) {
      let type_selected_ = [];
      listShop.forEach((shop) => {
        let find = this.props.viewChannelsId.find((item) => item === shop.id);
        if (find && !type_selected_[shop.type]) {
          type_selected_[shop.type] = true;
        }
      });
      if (type_selected_['shopee']) type_selected.push('shopee');
      if (type_selected_['lazada']) type_selected.push('lazada');
      if (type_selected_['sendo']) type_selected.push('sendo');
      if (type_selected_['tiki']) type_selected.push('tiki');
    }
    type_selected = type_selected.splice(0, 3);
    type_selected.forEach((item, i) => {
      let icon = LogoSapo2;
      if (item === 'shopee') icon = IconShopee;
      if (item === 'lazada') icon = IconLazada;
      if (item === 'sendo') icon = IconSendo;
      if (item === 'tiki') icon = IconTiki;

      type_selected[i] = <div className="icon" key={i}>
        <div className="img">
          <img
              src={icon}
              alt="img"
          />
          {
            listShop.length > this.props.viewChannelsId.length && i === type_selected.length - 1 ?
              <span className="more-channel">+{listShop.length - this.props.viewChannelsId.length}</span>
              : null
          }
        </div>
      </div>
    });
    return (
      <div id="sidebar" className={this.state.sidebarMini ? 'sidebar-mini' : ''}>
        <div className="head head-top">
          <div className="logo" onClick={(e) => {
            e.preventDefault();
            this.props.GuideScreen()
          }}>
            <img src={LogoSapo} alt="icon" />
          </div>
          <div className="head-tool">
            {
              this.props.webViewActive ?
                <Tooltip
                  title="Nhấn vào đây để quay lại trang"
                  placement="bottomLeft"
                >
                  <div className="btn-back" onClick={(e) => {
                    window.autoLogin = [];
                    const webview = document.querySelector(`[data-id="${this.props.webViewActive}"]`);
                    if (webview) {
                      webview.goBack();
                    }
                  }}>
                    <img src={IconBack} alt="icon" />
                  </div>
                </Tooltip> : null
            }
            <div className="btn-bar" onClick={() => this.setState({ sidebarMini: !this.state.sidebarMini })}>
              <img src={IconBar} alt="icon" />
            </div>
          </div>
        </div>
        <div
            className="list-channel"
        >
          <div
              onClick={this.onDivClick}
          >
            {
              listShop.length > 0 ?
                  <Popover
                      content={<FilterChannel listShop={listShop} {...this.props} visible={this.state.visible} hide={() => this.handleVisibleChange(false)} />}
                      trigger="click"
                      visible={this.state.visible}
                      onVisibleChange={this.handleVisibleChange}
                      placement="bottomLeft"
                      style={{ padding: 0 }}
                      overlayClassName="popover-channels"
                  >
                    <div className="channel-select">
                      <div className={type_selected.length >= 3 ? "channel-icons channel-icons-mutiple" : "channel-icons"}>
                        {type_selected}
                      </div>
                      <div className="channel-label">
                        {
                          this.props.viewChannelsId.length === this.props.listShop.length ? `Tất cả gian hàng (${this.props.viewChannelsId.length})` :
                              `Đã chọn (${this.props.viewChannelsId.length}) gian hàng`
                        }
                      </div>
                      <i className="arrow" />
                    </div>
                  </Popover>
                  : null
            }
          </div>
          {
            !this.state.sidebarMini ?
              <div className="head head-reload-channels">
                <span>Gian hàng</span>
                <Tooltip
                  placement="right"
                  title="Làm mới danh sách gian hàng"
                >
                  <div
                      className={this.props.reloadShop ? "btn-reload d-flex active" : "btn-reload d-flex"}
                      onClick={this.props.getListShop}>
                    <img src={IconReload} alt="icon" />
                  </div>
                </Tooltip>
              </div> : null
          }
          <div className="menu">
            <Menu
              onClick={this.handleClick}
              mode="inline"
              selectedKeys={[this.props.webViewActive]}
              inlineCollapsed={this.state.sidebarMini}
            >
              {
                listShop.map((item, i) => {
                  if (this.props.viewChannelsId.length > 0 && this.props.viewChannelsId.indexOf(item.id.toString()) === -1) return null;
                  let menu = null;
                  if (item.is_logged || (item.tab_blanks && item.tab_blanks.length > 0)) {
                    menu = <SubMenu
                      key={`channel_${item.id}`}
                      icon={
                        <span className={item.is_logged ? "icon-channel" : "icon-channel channel-offline"}>
                          {
                            !this.state.sidebarMini ?
                              <Tooltip
                                title={item.short_name || item.name}
                                placement="topLeft"
                              >
                                <img className="icon" src={item.option_webview.icon_channel.default} alt="icon" />
                              </Tooltip>
                              : <img className="icon" src={item.option_webview.icon_channel.default} alt="icon" />
                          }

                          {item.total_unread ? <span className="total-unread">{item.total_unread > 9 ? '9+' : item.total_unread}</span> : ''}
                        </span>
                      }
                      title={
                        <div className={item.is_logged ? "p-relative shop-title shop-active" : "p-relative shop-title"}>
                          {/* <span className="icon-channel"><img className="icon" src={this.props.getLogoChannels(item.type)} /></span> */}
                          <span className="channel-name">{item.short_name || item.name}</span>
                          {item.total_unread ? <span className="total-unread">{item.total_unread > 9 ? '9+' : item.total_unread}</span> : ''}
                        </div>
                      }
                    >
                      <Menu.Item className="shop-title" key={`channel_${item.id}`}>{item.short_name || item.name}</Menu.Item>
                      {item.is_logged && item.option_webview.key_webchat ? <Menu.Item key={item.option_webview.key_webchat}>Kênh chat</Menu.Item> : null}
                      {
                        (item.is_logged && item.type === 'tiki')
                            ? (<Menu.Item key={item.option_webview.key_seller}>Kênh người bán</Menu.Item>)
                            : (
                                (item.is_logged && item.allow_access)
                                    ? (<Menu.Item key={item.option_webview.key_seller}>Kênh người bán</Menu.Item>)
                                    : null
                            )
                      }

                      {
                        !item.is_logged && (item.tab_blanks && item.tab_blanks.length > 0) ?
                          <Menu.Item key={item.option_webview.key_seller}>Đăng nhập</Menu.Item>
                          : null
                      }
                      {
                        item.tab_blanks && item.tab_blanks.length > 0 ?
                          <Menu.Item className="dot-menu"><div className="dot" /></Menu.Item> : null
                      }
                      {
                        item.tab_blanks ? item.tab_blanks.map((tab, i) => {
                          return <Menu.Item key={tab.key} className={`tab-blank-item ` + tab.key} data-url={tab.url}>
                            <Tooltip
                              title={tab.name}
                              placement="right"
                            >
                              <div className="tab-blank-title">
                                <span className="tab-title">{tab.name}</span>
                                <div className="icon-close" onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  let find_index = item.tab_blanks.findIndex((item) => item.key === tab.key);
                                  if (find_index > -1) {
                                    let tab_blanks = item.tab_blanks;
                                    tab_blanks.splice(find_index, 1);
                                    this.props.updateShop(item.id, {
                                      tab_blanks: tab_blanks
                                    });
                                  }
                                  if (tab.key === this.props.webViewActive) {
                                    this.props.activeWebView({
                                      key: (item.is_logged && item.option_webview.key_webchat) ? item.option_webview.key_webchat : item.option_webview.key_seller
                                    })
                                  }
                                  e.target.parentNode.remove();
                                }}>
                                  <img src={IconClose1} alt="icon" />
                                </div>
                              </div>
                            </Tooltip>
                          </Menu.Item>
                        }) : null
                      }
                    </SubMenu>
                  } else {
                    menu = <Menu.Item key={item.option_webview.key_seller} icon={
                      !this.state.sidebarMini ?
                        <Tooltip
                          title={item.short_name || item.name}
                          placement="topLeft"
                        ><span className="icon-channel channel-offline">
                            <img className="icon" src={item.option_webview.icon_channel.default} alt="icon" />
                          </span></Tooltip> : <span className="icon-channel channel-offline">
                          <img className="icon" src={item.option_webview.icon_channel.default} alt="icon" />
                        </span>
                    }>
                      <span className="channel-name">{item.short_name || item.name}</span>
                      <i className="ant-menu-submenu-arrow" />
                    </Menu.Item>
                  }
                  return menu;
                })
              }
            </Menu>
          </div>

        </div>
        <div className="sidebar-bottom">
          <div className={this.state.showMenuUserSapo ? "menu menu-user active" : "menu menu-user"}>
            <Menu
              mode="inline"
              onClick={this.handleClickMenuSapo}
              inlineCollapsed={this.state.sidebarMini}
            >
              <Menu.Item key="setting_go_chat" icon={<img className="icon" src={IconSetting1} alt="icon" />}>
                <span className="title">Cấu hình</span>
              </Menu.Item>
              <Menu.Item key="connect_channel" icon={<img className="icon" src={IconAdd} alt="icon" />}>
                <span className="title">Kết nối thêm gian hàng</span>
              </Menu.Item>
              <Menu.Item key="guide" icon={<img className="icon" src={IconGuide} alt="icon" />}>
                <span className="title">Hướng dẫn sử dụng</span>
              </Menu.Item>
              <Menu.Item key="logout" icon={<img className="icon" src={IconLogout} alt="icon" />}>
                <span className="title">Đăng xuất</span>
              </Menu.Item>
            </Menu>
          </div>
          <div className={this.state.showMenuUserSapo ? "user-sapo open-menu" : "user-sapo"} onClick={() => this.setState({ showMenuUserSapo: !this.state.showMenuUserSapo })}>
            <span className="avatar">
              <img className="icon" src={this.props.userMain.profile_picture} alt="icon" />
            </span>
            <div className="full-name">
              <span>{this.props.userMain.full_name}</span>
              <i className="arrow" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
