import Network from "resource:///com/github/Aylur/ags/service/network.js";
import { execAsync, interval, timeout } from "resource:///com/github/Aylur/ags/utils.js";
import Variable from "resource:///com/github/Aylur/ags/variable.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";

import { QuickSettingsStackMenu } from './quicksettings.js';

const _network_ico = Variable(Network[Network.primary]?.icon_name, {})
Network.connect("changed", (self) => {
  _network_ico.value = self[self.primary].icon_name
})

const _wifi = Variable(Network.wifi.access_points)
Network.connect("changed", (nt) => {
  _wifi.setValue(nt.wifi.access_points)
})

export const NetworkIcon = () => Widget.Icon({
  connections: [
    [_network_ico, (self) => {
      self.icon = _network_ico.value
    }]
  ],
  size: 16,
})

const WifiItem = (wifi) => {
  if (wifi.ssid === "Unknown") {
    return;
  }

  let btt =  Widget.Button({
    class_name: "quicksettings-wifi-item",
    child: Widget.Box({
      children: [
        Widget.Box({
          spacing: 5,
          children: [
            Widget.Icon(wifi.iconName),
            Widget.Label({
              label: wifi.ssid,
              xalign: 0,
              hexpand: true,
            }),
            Widget.Label(wifi.active ? "Connected" : "")
          ]
        })
      ]
    })
  })

  return btt
} 


export const WifiScanner = (stack) => {
  interval(7000, () => {
    Network.wifi.scan()
  })
  return QuickSettingsStackMenu(stack, "WifiScanner", Widget.Box({
      vertical: true,
      spacing: 5,
      class_name: "quicksettings-wifi-box",
      connections: [
        [_wifi, self => {
          console.log("mapping wifi")
          self.children = _wifi.value.map(WifiItem)
        }], 
      ]
    })) 
}

