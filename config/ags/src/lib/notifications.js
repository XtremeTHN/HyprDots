import Notifications from 'resource:///com/github/Aylur/ags/service/notifications.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { lookUpIcon } from 'resource:///com/github/Aylur/ags/utils.js';
import { execAsync } from 'resource:///com/github/Aylur/ags/utils.js';

import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import GLib from 'gi://GLib';
// import AgsCircularProgress from 'types/widgets/circularprogress';

/**
 * 
 * @param {Number} maxTime
 * @param {*} progress 
 */
const updateCircularProgressByTime = (maxTime, progress) => {
    let currentTime = 0 // milisegundos
    let interval = setInterval(() => {
        let currentValue = progress.value // valor fraccional actual de la barra

        let newValue = currentTime / maxTime
        currentTime += 50

        progress.value = newValue

        if (currentValue >= 1.0) {
            interval.destroy()
        }
    }, 48)

}

/** @param {import('resource:///com/github/Aylur/ags/service/notifications.js').Notification} n */
const NotificationIcon = ({ app_entry, app_icon, image }) => {
    if (image) {
        return Widget.Box({
            css: `
                background-image: url("${image}");
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
            `,
        });
    }

    let icon = 'dialog-information-symbolic';
    if (lookUpIcon(app_icon))
        icon = app_icon;

    if (app_entry && lookUpIcon(app_entry))
        icon = app_entry;

    return Widget.Icon(icon);
};

/** @param {import('resource:///com/github/Aylur/ags/service/notifications.js').Notification} n */
export const Notification = n => {
    const icon = Widget.Box({
        vpack: 'start',
        class_name: 'icon',
        child: NotificationIcon(n),
    });

    const title = Widget.Box({
        children: [
            Widget.Label({
                class_name: 'title',
                xalign: 0,
                hexpand: true,
                justification: 'left',
                max_width_chars: 24,
                truncate: 'end',
                wrap: true,
                label: n.summary,
                use_markup: true,
            }),
            Widget.CircularProgress({
                class_name: "notification-time-progress",
                rounded: true,
                vexpand: false,
                child: Widget.Button({
                    child: Widget.Icon({
                        icon: "window-close-symbolic",
                        size: 16,
                    })
                }),
                setup: (self) => {
                    updateCircularProgressByTime(5000, self)
                }
            })
        ]
    })

    const body = Widget.Label({
        class_name: 'body',
        hexpand: true,
        use_markup: true,
        xalign: 0,
        justification: 'left',
        label: n.body,
        wrap: true,
    });

    const actions = Widget.Box({
        class_name: 'actions',
        children: n.actions.map(({ id, label }) => Widget.Button({
            class_name: 'action-button',
            on_clicked: () => n.invoke(id),
            hexpand: true,
            child: Widget.Label(label),
        })),
    });

    return Widget.Box({
        class_name: `notification ${n.urgency}`,
        vertical: true,
        vexpand: true,
        children: [
            Widget.Box({
                children: [
                    icon,
                    Widget.Box({
                        vertical: true,
                        children: [
                            title,
                            body,
                        ],
                    }),
                ],
            }),
            actions,
        ],
    })
};

export const SendNotification = (title, msg) => {
  execAsync(['notify-send', title, msg])
}

export const SendNotificationWithActions = (title, msg, ...actions) => {
  let cmd = ['notify-send', title, msg]
  for (const action of actions) {
    cmd.push(...['-A',action])
  }
  return execAsync(cmd)
}

export const NotificationPopupWindow = Widget.Window({
    name: 'notifications',
    anchor: ['top', 'right'],
    child: Widget.Box({
        class_name: 'notifications',
        vertical: true,
        children: Notifications.bind('popups').transform(popups => {
            return popups.map(Notification);
        }),
    }),
});

Notifications.popupTimeout = 5000
