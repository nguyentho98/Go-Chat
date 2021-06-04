import React, { Component } from 'react';
import { Modal, Form, Input, Button} from 'antd';
import { IconNextDouble, LogoSapo } from '../icons';
import ImageNext from '../images/img1.svg';

export default class NextPageComponent extends Component {
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
            <div id="next-page" className="container">
                <div className="row">
                    <div className="col-md-6 col-12">
                        <div className="logo">
                            <img src={LogoSapo} />
                        </div>
                        <div className="content">
                            <div className="title">Ứng dụng quản lý chat đa sàn</div>
                            <ul className="menu-splash-screen">
                                <li>Quản lý tập trung tất cả tin nhắn từ các gian hàng TMĐT tại một nơi</li>
                                <li>Nhận thông báo ngay lập tức khi khách nhắn tin đến gian hàng</li>
                                <li>Quản lý Kênh Người Bán của nhiều gian hàng trên một phần mềm</li>
                                <li>Dễ dàng quản lý kho, đơn hàng, khách hàng tập trung với phần mềm Sapo</li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-6 col-12 d-flex justify-content-end flex-column img-next">
                        <img src={ImageNext} />
                    </div>
                </div>
                <div className="next-page-button d-flex justify-content-end">
                    <a href="#" className="btn d-flex align-items-center justify-content-center" onClick={(e) => {
                        e.preventDefault();
                        this.props.nextApp();
                    }}>
                        <span>Tiếp tục</span>
                        <img src={IconNextDouble} />
                    </a>
                </div>
            </div>
        );
    }
}
