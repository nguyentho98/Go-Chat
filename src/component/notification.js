import React from 'react';
import { IconClose } from '../icons';

// notify trên giao diện báo có tin nhắn mới. => import sẵn vào app sau đó dùng inject html.
function NotificationComponent() {
    return (
        <div className="ant-notification ant-notification-bottomRight notification">
            <div className="notification-content">
            </div>
            <div style={{display: "none"}} className="notification-close" onClick={() => {
                document.querySelector('.notification .notification-close').style.display = "none";
                document.querySelector('.notification .notification-content').innerHTML = "";
            }}
            >
                <img src={IconClose}  alt="img" />
            </div>
        </div>
    );
}

export default React.memo(NotificationComponent);

// export default class NotificationComponent extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//
//         };
//     }
//     componentDidMount = async () => {
//
//     }
//     componentWillUnmount = () => {
//
//     }
//     componentWillReceiveProps = (nextProps) => {
//
//     }
//     render = () => {
//         return (
//             <div className="notification-item">
//                 <div className="notification-header">
//                     <div className="icon">
//                         <img src={this.props.icon ? this.props.icon : LogoSapo2} />
//                     </div>
//                     <div className="title">{this.props.title ? this.props.title : 'Gochat'}</div>
//                     <div className="time">Bây giờ</div>
//                 </div>
//                 <div className="notification-content">
//                      <h3>{this.props.subtitle}</h3>
//                     <div>
//                     {this.props.content}
//                     </div>
//                 </div>
//                 <div className="notification-bottom">
//                     <img src={IconArrowRight1} />
//                 </div>
//             </div>
//         );
//     }
// }
