import React, { Component } from 'react';
import { Modal, Form, Input, Button} from 'antd';
import { IconNextDouble, LogoSapo, LogoSapo1 } from '../icons';
import ImageNext from '../images/img1.svg';

export default class NextPage2Component extends Component {
    constructor(props) {
        super(props);
        this.state = {
            domain_shop: localStorage.getItem("alias_admin"),
            focusInput: false
        };
    }
    componentDidMount = async () => {
        // document.querySelector('[name="domain_shop"]').value = localStorage.getItem("alias_admin");
        this.setState({
            domain_shop: localStorage.getItem("alias_admin")
        }, () => {
            document.querySelector('[name="domain_shop"]').focus();
        })
    }
    componentWillUnmount = () => {

    }
    componentWillReceiveProps = (nextProps) => {

    }
    submitForm = async (e) => {
        try{
            e.preventDefault();
            let domain = document.querySelector('[name="domain_shop"]');
            if(domain.value){
                if(domain.value.indexOf('.') > -1){
                    this.props.changeErrorAlias('Sai định dạng');
                    return
                }
                localStorage.setItem('alias_admin', domain.value);
                domain = domain.value.replace('https://', '').replace('http://', '');
                this.props.loginAdmin({
                    domain: `https://${domain}.mysapo.vn`,
                    alias: domain
                })
            } else {
                this.props.notification({
                    type: 'warning',
                    message: 'Địa chỉ web của cửa hàng',
                    description: 'Bạn phải điền địa chỉ web của hàng Sapo'
                })
            }
        } catch(err){

        }
    }
    componentWillUnmount = () => {
        this.props.handleLoadingButton(false);
    }

    render = () => {
        return (
            <div id="page-alias-sapo">
                <div id="next-link-admin" className="container">
                    <div className="col-lg-12 col-md-12 col-sm-8 col-xs-12 login-wrapper col-md-offset-1 col-lg-offset-1 col-sm-offset-2">
                        <div className="row">
                            <div className="area-login">
                                <div className="col-md-6 col-sm-12 col-xs-12">
                                    <div className={ this.props.errorAlias ? "form-login form-alias-error" : "form-login"}>
                                        <form ref={(ref) => this.form = ref} onSubmit={this.submitForm}>
                                            <div className="login-logo text-left">
                                                <img src={LogoSapo1} alt="sapo" />
                                            </div>
                                            <div className="title">Đăng nhập</div>
                                            <p style={{marginBottom: "20px"}}>Tiếp tục đến cửa hàng của bạn</p>
                                            <div className={this.state.focusInput ? "link-input text-left focus" : "link-input text-left"}>
                                                <input placeholder="Địa chỉ web của cửa hàng" value={this.state.domain_shop} name="domain_shop" onChange={(e) => {
                                                    this.setState({domain_shop: e.target.value})
                                                    if(this.props.errorAlias) this.props.changeErrorAlias(null);
                                                }} onBlur={(e) => this.setState({focusInput: false})}
                                                    onFocus={() => this.setState({ focusInput: true })}
                                                />
                                                {/* <div className="label">
                                                {this.state.domain_shop ? this.state.domain_shop : 'myshop'}.mysapo.vn
                                                </div> */}
                                                <div className="label">
                                                .mysapo.vn
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between" style={{marginTop: "6px", color: "#0084FF", marginBottom: "23px"}}>
                                                <p className="error">
                                                    { this.props.errorAlias }
                                                </p>
                                                <p className="text-right">
                                                <a href="#" onClick={(e) => {
                                                    e.preventDefault();
                                                    window.shell.openExternal('https://www.sapo.vn/dang-nhap-kenh-ban-hang.html');
                                                }}>Bạn quên cửa hàng?</a></p>
                                            </div>
                                            <div className="d-flex justify-content-center">
                                                <button type="button" className={this.props.loadingWebViewAdmin ? "btn-login loading" : "btn-login"} onClick={this.submitForm}>
                                                    { this.props.loadingWebViewAdmin ? ' Đang tải...' : 'Tiếp tục'}
                                                </button>
                                            </div>
                                            <div className="reseller-infos">
                                                <p style={{marginBottom: "40px"}}>Bạn mới sử dụng Sapo? <a href="#" onClick={(e) => {
                                                    e.preventDefault();
                                                    window.shell.openExternal('https://www.sapo.vn/quan-ly-ban-hang-online.html');
                                                }}>Bắt đầu</a></p>
                                                <p>Tổng đài hỗ trợ khách hàng: <strong>1800 6750</strong></p>

                                                <p>
                                                    Hỗ trợ khách hàng các ngày trong tuần từ thứ 2 đến Chủ nhật <br></br> <span >(từ 8h00 – 22h00 hàng ngày)</span>
                                                </p>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
