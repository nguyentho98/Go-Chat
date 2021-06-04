import React, { Component } from 'react';
import { IconShopee, IconTiki, IconSendo, IconLazada, LogoSapo2, IconLazadaRound, IconSendoRound,
IconShopeeRound, IconTikiRound
} from '../icons';
import { Checkbox, notification } from 'antd';
import Item from 'antd/lib/list/Item';

export default class FilterChannleComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hidden: false,
            selected_channel_ids: [],
        };
    }
    componentDidMount = async () => {
        this.resetSelectedChannel();
    }
    componentWillUnmount = () => {

    }
    componentWillReceiveProps = (nextProps) => {
        if(nextProps.visible && nextProps.visible != this.props.visible){
            this.resetSelectedChannel();
        }
    }
    handlerCheck = (e) => {
        if (e.target.name == 'checkall') {
            if (e.target.checked) {
                document.querySelectorAll('.list-channels [name="checkitem"]').forEach((item) => {
                    item.checked = true;
                });
            } else {
                document.querySelectorAll('.list-channels [name="checkitem"]').forEach((item) => item.checked = false)
            }
        } else {
            let checkItems = document.querySelectorAll('.list-channels [name="checkitem"]');
            let checkedItems = document.querySelectorAll('.list-channels [name="checkitem"]:checked');
            if(checkedItems.length == checkItems.length){
                document.querySelector('.list-channels [name="checkall"]').checked = true;
            } else {
                document.querySelector('.list-channels [name="checkall"]').checked = false;
            }
        }
        let checkedItems = document.querySelectorAll('.list-channels [name="checkitem"]:checked');
        let shop_ids = [];
        checkedItems.forEach((item) => {
            shop_ids.push(item.value);
        })
        this.setState({
            selected_channel_ids: shop_ids
        })

    }
    saveViewChannel = () => {
        let checkItems = document.querySelectorAll('.list-channels [name="checkitem"]');
        let shops_id = [];
        checkItems.forEach((item) => {
            if(item.checked){
                shops_id.push(item.value);
            }
        })
        if(shops_id.length == 0){
            this.props.notification({
                message: 'Hiển thị gian hàng',
                description: 'Bạn chưa chọn gian hàng nào để hiển thị !',
                placement: 'topRight',
                type: 'warning'
            });
            return
        }
        this.props.saveViewChannel(shops_id);
        this.props.notification({
            message: 'Hiển thị gian hàng',
            description: shops_id.length == checkItems.length ? 'Đã chọn tất cả gian hàng' : `Đã chọn ${shops_id.length} gian hàng`,
            placement: 'topRight',
            type: 'success'
        });
        this.props.hide();
    }
    resetSelectedChannel = () => {
        let selected_ids = this.props.viewChannelsId;
        let selected_channel_ids = [];
        let checkitems = document.querySelectorAll('.list-channels [name="checkitem"]');
        let count = 0;
        checkitems.forEach((item) => {
            if(selected_ids.indexOf(item.value) > -1){
                selected_channel_ids.push(item.value);
                item.checked = true;
                count++;
            } else {
                item.checked = false;
            }
        })
        if(checkitems.length == count){
            document.querySelector('.list-channels [name="checkall"]').checked = true;
        } else {
            document.querySelector('.list-channels [name="checkall"]').checked = false;
        }
        this.setState({
            selected_channel_ids: selected_channel_ids
        })
    }
    selectedChannelType = (type) => {
        let channels = this.props.listShop.filter((item) => item.type == type);
        let checkitems = document.querySelectorAll('.list-channels [name="checkitem"]');
        let selected_channel_ids = [];
        let count = 0;
        checkitems.forEach((item) => {
            let find = channels.find((channel) => channel.id.toString() == item.value);
            if(find){
                selected_channel_ids.push(item.value);
                item.checked = true;
                count++;
            } else {
                item.checked = false;
            }
        })
        if(count == this.props.listShop.length){
            document.querySelector('.list-channels [name="checkall"]').checked = true;
        } else {
            document.querySelector('.list-channels [name="checkall"]').checked = false;
        }
        this.setState({
            selected_channel_ids: selected_channel_ids
        })
    }
    render = () => {
        let shopee_selected = this.props.listShop.filter((item) => item.type == 'shopee' && this.state.selected_channel_ids.indexOf(item.id.toString()) > -1);
        let lazada_selected = this.props.listShop.filter((item) => item.type == 'lazada' && this.state.selected_channel_ids.indexOf(item.id.toString()) > -1);
        let sendo_selected = this.props.listShop.filter((item) => item.type == 'sendo' && this.state.selected_channel_ids.indexOf(item.id.toString()) > -1);
        let tiki_selected = this.props.listShop.filter((item) => item.type == 'tiki' && this.state.selected_channel_ids.indexOf(item.id.toString()) > -1);
        return (
            <div className="poup-filter-channel">
                <div className="type-channels">
                    {
                        this.props.listShop.find((item) => item.type == 'shopee') ? <div className="item item-shopee" onClick={() => this.selectedChannelType('shopee')}>
                        <div className="icon">
                            <img src={IconShopeeRound} />
                        </div>
                        <span>Shopee ({shopee_selected.length})</span>
                    </div> : null
                    }
                    {
                        this.props.listShop.find((item) => item.type == 'lazada') ? 
                        <div className="item item-lazada" onClick={() => this.selectedChannelType('lazada')}>
                            <div className="icon">
                                <img src={IconLazadaRound} />
                            </div>
                            <span>Lazada ({lazada_selected.length})</span>
                        </div> : null
                    }
                    {
                        this.props.listShop.find((item) => item.type == 'sendo') ?
                        <div className="item item-sendo" onClick={() => this.selectedChannelType('sendo')}>
                            <div className="icon">
                                <img src={IconSendoRound} />
                            </div>
                            <span>Sendo ({sendo_selected.length})</span>
                        </div>
                        : null
                    }
                    {
                        this.props.listShop.find((item) => item.type == 'tiki') ? 
                        <div className="item item-tiki" onClick={() => this.selectedChannelType('tiki')}>
                            <div className="icon">
                                <img src={IconTikiRound} />
                            </div>
                            <span>Tiki ({tiki_selected.length})</span>
                        </div>
                        : null
                    }
                </div>
                <div className="list-channels">
                    <ul>
                        <li>
                            <label className="css-checkbox">
                                <input type="checkbox" className="css-control-input" name="checkall" onChange={this.handlerCheck} id="checkall"/>
                                <span className="css-control-indicator"></span>
                            </label>
                            <label htmlFor="checkall">
                                <span>Tất cả gian hàng</span>
                            </label>
                        </li>
                        {
                            this.props.listShop.map((item, i) => {
                                return <li key={i}>
                                {/* <Checkbox name="checkitem" id={'checkitem'+i} onChange={this.handlerCheck} /> */}
                                <label className="css-checkbox">
                                    <input value={item.id} type="checkbox" className="css-control-input" name="checkitem" onChange={this.handlerCheck} id={`checkitem_${i}`} />
                                    <span className="css-control-indicator"></span>
                                </label>
                                <label className="channel-title" htmlFor={`checkitem_${i}`} >
                                        <span className="icon">
                                            <img src={item.option_webview.icon_channel.round} />
                                        </span>
                                        <span>{item.name}</span>
                                </label>
                            </li>
                            })
                        }
                    </ul>
                </div>
                <div className="tool-bottom d-flex">
                    <span>{this.state.selected_channel_ids.length == this.props.listShop.length ? 'Đã chọn tất cả gian hàng' : `Đã chọn ${this.state.selected_channel_ids.length} gian hàng`}</span>
                    <div>
                        <a href="#" className="btn-view-channels" onClick={this.saveViewChannel}>Xem</a>
                    </div>
                </div>
            </div>
        );
    }
}
