import Bluetooth from "resource:///com/github/Aylur/ags/service/bluetooth.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Variable from "resource:///com/github/Aylur/ags/variable.js";
import { QuickSettingsStackMenu } from "./quicksettings.js";
import { lookUpIcon, subprocess } from "resource:///com/github/Aylur/ags/utils.js"; 

// Start scanning
const blue_proc = subprocess("bluetooth_scan", (out) => {
  return
}, undefined, undefined)

const _get_ico = () => Bluetooth.enabled === true ? "bluetooth-active-symbolic" : "bluetooth-disabled-symbolic" 
const _bluetooth_ico = Variable(_get_ico())
Bluetooth.connect("notify::enable", (_) => {
  _bluetooth_ico.value = _get_ico()
})

const QuickSettingsBluetoothScannerPlaceholder = () => {
  let ico = Widget.Icon({
    size: 32,
  })

  let label = Widget.Label()

  return Widget.Box({
    vertical: true,
    spacing: 0,
    children: [
      ico,
      label
    ] 
  }).hook(Bluetooth, self => {
    if (Bluetooth.enabled) {
      if (Bluetooth.devices.length) {
        self.visible = true
        label.label = "No bluetooth devices nearby"
        ico.icon = "bluetooth-disabled-symbolic"
      } else {
        self.visible = false
      }
    } else {
      self.visible = true
      label.label = "Bluetooth disabled"
      ico.icon = "bluetooth-disabled-symbolic"
    }
  })
}


export const BluetoothIcon = () => Widget.Icon({
  icon: _bluetooth_ico.bind("value"),
  size: 16
})

/** @param {import('types/service/bluetooth.js').BluetoothDevice} dev */
const BluetoothDevice = (dev) => Widget.Box({
  children: [
    Widget.Icon({
      icon: dev.bind('icon_name').transform(ico => {
        if (!lookUpIcon(ico)) {
          return "bluetooth-active-symbolic"
        }
        return ico
      }) 
    }),
    Widget.Label({
      label: dev.alias,
      xalign: 0,
      hexpand: true,
    }),
    Widget.Box({
      vertical: true,
      children: [
        Widget.Switch({
          hpack: 'end',
          hexpand: false,
          active: dev.bind("connected"),
          visible: dev.bind('connecting').transform(p=> !p),
          setup: self => self.on('notify::active', () => {
            dev.setConnection(self.active)
          })
        }),
 
      ],
    })
  ]
})

export const IsBluetoothEnabled = Variable(Bluetooth.enabled)
Bluetooth.connect('changed', blue => {
  IsBluetoothEnabled.value = blue.enabled
})

export const BluetoothScanner = (stack) => QuickSettingsStackMenu(stack, "BluetoothScanner", Widget.Box({
  class_name: "quicksettings-scanners-box",
  vertical: true,
  children: [
    QuickSettingsBluetoothScannerPlaceholder(),
    Widget.Box({
      spacing: 5,
      children: Bluetooth.bind('devices').transform(d => d.map(BluetoothDevice))
    })
  ]
}))
