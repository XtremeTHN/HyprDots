import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import { Workspaces } from './hyprfuncs.js';
import { Time } from './variables.js';
import { AudioIcon } from './audio.js';
import { NetworkIcon } from './internet.js';
import { BluetoothIcon } from './bluetooth.js';

/**
 * @param {String} wmName
 * @param {Number} maxLength
*/ 
const truncateWindowName = (wmName, maxLength=32) => {
  if (wmName.length > maxLength) {
    return wmName.slice(0, maxLength) + '...';
  } else {
    return wmName
  }
}

const WindowName = () => Widget.Label({
  class_name: "topbar-active-window",
  connections: [
    [Hyprland, self => {
      self.label = truncateWindowName(Hyprland.active.client.title.length === 0 ? `Workspace ${Hyprland.active.workspace.id}` : Hyprland.active.client.title)
    }]
  ]
})

const TopBarContentLeft = () => Widget.Box({
  hpack: "start",
  class_name: "topbar-widgets-left",
  children: [
    WindowName()
  ]
})

const TopBarContentCenter = () => Widget.Box({
  class_name: "topbar-widgets-center",
  children: [
    Workspaces()
  ],
})

const TopBarContentRight = () => Widget.Box({
  spacing: 10,
  class_name: "topbar-widgets-right",
  children: [
    Widget.Box({hexpand:true}),
    Widget.Label({
      binds: [
        ['label', Time, 'value']
      ]
    }),
    Widget.Box({
      spacing: 5,
      children: [
        AudioIcon(),
        NetworkIcon(),
        BluetoothIcon()
      ]
    })
  ]
})

const TopBarContent = () => Widget.CenterBox({
  class_name: "topbar-main-box",
  start_widget: TopBarContentLeft(),
  center_widget: TopBarContentCenter(),
  end_widget: TopBarContentRight()
})

export default () => Widget.Window({
  name: "topbar",
  class_name: "topbar-window",
  child: TopBarContent(),
  anchor: ['top', 'left', 'right'],
  layer: 'top',
  exclusivity: "exclusive",
  margins: [5,20,0,20]
})
