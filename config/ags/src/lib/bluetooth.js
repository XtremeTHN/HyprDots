import Bluetooth from "resource:///com/github/Aylur/ags/service/bluetooth.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Variable from "resource:///com/github/Aylur/ags/variable.js";
import { QuickSettingsStackMenu } from "./quicksettings.js";
import { lookUpIcon } from "resource:///com/github/Aylur/ags/utils.js"; 

const _get_ico = () => Bluetooth.enabled === true ? "bluetooth-active-symbolic" : "bluetooth-disabled-symbolic" 
const _bluetooth_ico = Variable(_get_ico())
Bluetooth.connect("notify::enable", (_) => {
  _bluetooth_ico.value = _get_ico()
})

export const BluetoothIcon = () => Widget.Icon({
  size: 16,
  connections: [
    [_bluetooth_ico, self => {
      self.icon = _bluetooth_ico.value
    }]
  ]
})

const BluetoothDevice = (dev) => Widget.Box({
  children: [
    Widget.Icon({
      binds: [
        ["icon", dev, "icon-name", ico => {
          if (!lookUpIcon(ico)) {
            return "bluetooth-active-symbolic"
          }
          return ico
        }]
      ]
    }),
    Widget.Label({
      label: dev.alias,
      xalign: 0,
      hexpand: true,
    }),
    Widget.Label(dev.paired ? "Connected" : "")
  ]
})

export const BluetoothScanner = (stack) => QuickSettingsStackMenu(stack, "BluetoothScanner", Widget.Box({
  class_name: "quicksettings-bluetooth-box",
  vertical: true,
  connections: [
    [Bluetooth, self => {
      self.children = Bluetooth.devices.map(BluetoothDevice)
    }]
  ]
}))
