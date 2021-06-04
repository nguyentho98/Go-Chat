import React, { Component } from 'react';
import { Modal, Form, Input, Button} from 'antd';

export default class FormLinkAdmin extends Component {
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
    handleOk = e => {
        this.setState({
            visible: false,
        });
    };

    handleCancel = e => {
        this.setState({
            visible: false,
        });
    };
    render = () => {
        return (
            <Modal
                title="Nhập link Admin Sapo"
                visible={this.props.visible}
                onOk={this.handleOk}
                footer={null}
                className={"modal-link-admin"}
            >
                <Form
                    onFinish={this.props.saveLinkAdmin}
                    initialValues={{
                        link: this.props.linkAdmin
                    }}
                >
                    <Form.Item
                        label="Nhập link"
                        name="link"
                        rules={[{ required: true, message: 'Không được để trống' }]}
                    >
                        <Input />
                    </Form.Item>
                    <div className="text-right">
                        <Button type="primary" loading={this.state.loading} htmlType="submit" >
                            Tiếp tục
                        </Button>
                    </div>
                </Form>
            </Modal>
        );
    }
}
