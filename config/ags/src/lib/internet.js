import Network from "resource:///com/github/Aylur/ags/service/network.js";
import { execAsync, interval, timeout } from "resource:///com/github/Aylur/ags/utils.js";
import Variable from "resource:///com/github/Aylur/ags/variable.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";

import { QuickSettingsStackMenu } from './quicksettings.js';

const _network_ico = Variable(Network[Network.primary]?.icon_name, {})
const _network_ssid = Variable(Network.primary === "wifi" ? Network.wifi.ssid : Network.wired.internet)
Network.connect("changed", (self) => {
  _network_ico.value = self[self.primary].icon_name
  _network_ssid.value = self.primary === "wifi" ? self.wifi.ssid : self.wired.internet
})

export const WifiDeviceIsAvailable = Variable(false)

const GetAccessPoints = (self=Network) => {
  try {
    WifiDeviceIsAvailable.setValue(true)
    return self.wifi.access_points
  } catch (error) {
    WifiDeviceIsAvailable.setValue(false)
    console.error("No wifi adapter connected")
    return []
  }
}

const _wifi = Variable(GetAccessPoints())
Network.connect("changed", (nt) => {
  _wifi.setValue(GetAccessPoints(nt))
})

/** @param {String} ssid
 *  @param {String} password
*/
const ConnectToWifi = async (ssid, password) => {
  let out = await execAsync(["bash", "-c", [`nmcli dev wifi connect "${ssid}" password "${password}" && echo $?`]])

  return new Promise((resolve, reject) => {
    switch (out) {
      case 'Error: Connection activation failed: Secrets were required, but not provided.':
        reject("Wrong password")
        break
      case `Error: No network with SSID '${ssid}' found.`:
        reject("Connection eror. Wifi not found")
        break
      default:
        resolve("")
        break
    }
  })
  

}

const QuickSettingsWifiScannerPlaceholder = () => {
  let ico = Widget.Icon({
    size: 32,
  })

  let label = Widget.Label("No wifi adapter connected")

  return Widget.Box({
    vertical: true,
    spacing: 0,
    children: [
      ico,
      label
    ] 
  }).hook(Network.wifi, self => {
      if (WifiDeviceIsAvailable.value) {
        if (_wifi.value.length === 0) {
          self.visible = true
          label.label = "No wifi devices nearby"
          ico.icon = "network-wireless-no-route-symbolic"
        } else {
          self.visible = false
        }
      } else {
        self.visible = true
        label.label = "No wifi adapter available"
        ico.icon = "network-wireless-offline-symbolic"
      }
    }
  )
}

export const NetworkIcon = () => Widget.Icon({ 
  icon: _network_ico.bind('value'),
  tooltip_text: _network_ssid.bind('value'),
  size: 16,
})

const WifiItem = (wifi) => {
  if (wifi.ssid === "Unknown") {
    return;
  }

  let btt =  Widget.Button({
    class_name: "quicksettings-wifi-item",
    setup: self => {
      self.child = Widget.Box({
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
    },
  })

  return btt
} 

export const CurrentConnectedWifi = Network.primary === "wifi" ? Network.wifi.bind('ssid') : Network.wired.bind('internet')

export const NetworkToggled = Variable(true)
Network.connect('changed', netw => {
  if (WifiDeviceIsAvailable) {
    NetworkToggled.value = Network.wifi.enabled  
  } else {
    NetworkToggled.value = Network.wired.internet !== 'disconnected'
  }
})

export const WifiScanner = (stack) => {
  /*if (_wifi.value.length !> 0) {
    interval(7000, () => {
      Network.wifi.scan()
    })
  }*/
  return QuickSettingsStackMenu(stack, "WifiScanner", Widget.Box({
    vertical: true,
    class_name: "quicksettings-scanners-box",
    children: [
      QuickSettingsWifiScannerPlaceholder(),
      Widget.Box({
        spacing: 5,
        vertical: true,
        children: _wifi.bind('value').transform(w => w.map(WifiItem))           
      })
    ]
  })) 
}

