import React, { Component } from 'react';
import { Banner1 } from '../icons';
import { Spin } from 'antd';
import Banner from '../images/banner2.png';
export default class EmptySelectedChannel extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    componentDidMount = async () => {
        
    }
    componentWillUnmount = () => {

    }
    componentWillReceiveProps = (nextProps) => {

    }
    render = () => {
        return (
            <div className="banner-not-selected-channel">
                <div className="img">
                    <img src={Banner} />
                    <p>Chọn gian hàng cần quản lý tại menu bên trái</p>
                </div>
                <div className="guide">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 21C16.5228 21 21 16.5228 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21Z" stroke="#1F94FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8.09009 8.00008C8.32519 7.33175 8.78924 6.76819 9.40004 6.40921C10.0108 6.05024 10.729 5.91902 11.4273 6.03879C12.1255 6.15857 12.7589 6.52161 13.2152 7.06361C13.6714 7.60561 13.9211 8.2916 13.9201 9.00008C13.9201 11.0001 10.9201 12.0001 10.9201 12.0001" stroke="#1F94FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11 16H11.01" stroke="#1F94FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Bạn có thể xem thêm hướng dẫn sử dụng phần mềm <a href="#" onClick={(e) => {
                        e.preventDefault();
                        window.shell.openExternal('https://support.sapo.vn/phan-mem-chat-da-san-sapo-gochat')
                    }}> tại đây</a></span>
                </div>
            </div>
        );
    }
}
