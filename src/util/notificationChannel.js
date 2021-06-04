import moment from 'moment';
import {IconArrowRight1} from '../icons';

// bắn notify ở góc trái màn hình bên trong app khi có tin nhắn mới
export const notificationChannel = (options = {}) => {
    try {
        let {group, icon, subtitle, title, content, duration, time, event} = options;
        group = group ? group : Date.now();
        duration = duration ? duration * 1000 : 3000;

        let notify_group = document.querySelector(`.notification-group[data-group="${group}"]`);
        let item = document.createElement("div");
        item.setAttribute("class", "notification-item");
        item.insertAdjacentHTML("beforeend", `
        <div class="notification-header">
            <div class="icon">
                <img src=${icon} />
            </div>
            <div class="title">${title}</div>
            <div class="time">${moment(time).fromNow()}</div>
        </div>
      `)
        item.insertAdjacentHTML("beforeend", `
      <div class="notification-content">
          <h3>${subtitle}</h3>
          <div>
          ${content}
          </div>
      </div>
      `)
        item.insertAdjacentHTML("beforeend", `
      <div class="notification-bottom">
        <img src=${IconArrowRight1} />
      </div>
      `);

        if (notify_group) {
            let list_items = notify_group.querySelectorAll(".notification-item");
            let top = 0;
            let width = notify_group.clientWidth;
            item.style.zIndex = list_items.length + 1;
            list_items.forEach((notify, i) => {
                if (i > 3) return;
                top += 7;
                width -= 14;
                notify.style.top = `${top}px`;
                notify.style.width = `${width}px`;
                notify.style.zIndex = list_items.length - i;
            });
            notify_group.prepend(item);
        } else {
            notify_group = document.createElement("div");
            notify_group.setAttribute("class", "notification-group");
            notify_group.setAttribute("data-group", group);
            notify_group.append(item);
            document.querySelector(".notification-content").append(notify_group)
        }
        document.querySelector('.notification-close').style.display = "block";

        if (event) item.addEventListener("click", () => {
            event();
            item.parentElement.remove();
            if (document.querySelectorAll(".notification .notification-item").length === 0) {
                document.querySelector('.notification .notification-close').style.display = "none";
            }
        });

        let document_groups = document.querySelectorAll(`.notification-group`);
        if (document_groups.length > 3) {
            for (let i = 0; i < document_groups.length - 3; i++) {
                try {
                    document_groups[i].remove();
                } catch (err) {
                }
            }
        }

        setTimeout(() => {
            try {
                if (item.parentElement.querySelectorAll(".notification-item").length === 1) {
                    item.parentElement.remove();
                } else {
                    item.remove();
                }
                if (document.querySelectorAll(".notification .notification-item").length === 0) {
                    document.querySelector('.notification .notification-close').style.display = "none";
                }
            } catch (err) {

            }
        }, duration)

    } catch (err) {
        console.log(err);
    }
};