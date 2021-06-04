import React, { Component } from 'react';
import { Modal, Form, Input, Button} from 'antd';
import { IconNextDouble, LogoSapo } from '../icons';
import ImageNext from '../images/img1.svg';

export default class GuideComponent extends Component {
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
                            <div className="title">Tìm hiểu 3 bước đơn giản để bắt đầu sử dụng Sapo GO Chat ngay</div>
                            <ul className="menu-guide">
                                <li><span className="stt">1</span> <span>Đăng nhập vào tài khoản Sapo của bạn</span></li>
                                <li><span className="stt">2</span> <span>Lựa chọn gian hàng từ menu bên trái, sau đó đăng nhập vào tài khoản gian hàng trên Sàn TMĐT</span></li>
                                <li><span className="stt">3</span> <span>Cuối cùng, chuyển qua lại giữa các gian hàng để chat với khách</span></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-6 col-12 d-flex justify-content-end flex-column img-next">
                        <img src={ImageNext} />
                    </div>
                </div>
                {
                    this.props.nextApp ? <div className="next-page-button d-flex justify-content-end">
                    <a href="#" className="btn d-flex align-items-center justify-content-center" onClick={(e) => {
                        e.preventDefault();
                        this.props.nextApp();
                    }}>
                        <span>Bắt đầu ngay</span>
                    </a>
                </div> : null
                }
            </div>
        );
    }
}
