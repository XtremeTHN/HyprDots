import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { User, Uptime } from "./variables.js";
import ControlCenter from "./controlcenter.js";
import { execAsync } from "resource:///com/github/Aylur/ags/utils.js";
import { CurrentConnectedWifi, NetworkToggled, WifiScanner } from "./internet.js";
import { BluetoothScanner, IsBluetoothEnabled } from "./bluetooth.js";
import { GlobalVolumeMixer, AudioMixer, AudioIsEnabled, AudioMixersCount } from "./audio.js";
import { Performance, CurrentPowerMode, IsPowerProfilesAvailable } from "./profiles.js";
import { Logger } from "./log.js";

import Bluetooth from "resource:///com/github/Aylur/ags/service/bluetooth.js";
import Network from "resource:///com/github/Aylur/ags/service/network.js";

const QuickSettingsButton = ({ stack, active, icon, cb, label, subtitle="", target="", icon_size=16 }) => {
  let logger = new Logger("QuickSettingsButton", target)

  let ovr_child = []
  if (cb == undefined) {
    cb = () => {
      logger.log("Dummy callback")
    }
  }
  let childs = [
    Widget.Label({
      xalign: 0,
      label,
      css: "font-weight: 600;",
      hexpand: true,
    })
  ]

  if (subtitle !== "") {
    childs.push(Widget.Label({
      label: subtitle,
      css: "font-size: x-small;",
      xalign: 0,
    }))
  }

  if (target !== "") {
    logger.log("target not null")
    ovr_child.push(Widget.Button({
        class_name: "quicksettings-button-right",
        hpack: 'end',
        hexpand: false,
        on_primary_click: () => {
          stack.shown = target
          logger.log(`showing self`)
        },
        child: Widget.Icon({
          icon: "go-next-symbolic"
        })
      })
    )
  }
  
  let button = Widget.Button({
      class_name: "quicksettings-button",
      on_primary_click: cb,
      child: Widget.Box({
        spacing: 10,
        children: [
          Widget.Icon({
            size: icon_size,
            icon
          }),
          Widget.Box({
            vertical: subtitle !== "",
            vpack: 'center',
            spacing: 0,
            children: childs 
          })
        ]
      })
  })
  
  if (active !== undefined) {
    button.hook(active, self => {
      self.toggleClassName("active", active.value)
    })
  }

  return Widget.Overlay({
    child: button,
    overlays: ovr_child
  })
}


const Title = (string) => {
  return string.at(0)?.toUpperCase() + string.slice(1)
}

const QuickSettingsTop = () => Widget.Box({
  spacing: 10,
  children: [
    Widget.Icon({
      icon: ControlCenter.config.userPhoto.bind('value'),
      size: 32,
    }),
    Widget.Box({
      vertical: true,
      spacing: 0,
      hexpand: true,
      children: [ 
        Widget.Label({
          label: Title(User),
          xalign: 0,
        }),
        Widget.Label({
          class_name: "quicksettings-uptime",
          xalign: 0,
          label: Uptime.bind('value') 
        })
      ]
    }),
    Widget.Button({
      class_name: "quicksettings-circular-button",
      child: Widget.Icon({
        size: 20,
        icon: "system-shutdown-symbolic"
      }),
      on_primary_click: () => {
        execAsync(['shutdown', 'now'])
      }
    }) 
  ]
})

/** @param {Widget.Stack} stack
  *
**/
const QuickSettingsMainBox = (stack) => Widget.Box({
  spacing: 10,
  children: [
    Widget.Box({
      vertical: true,
      spacing: 10,
      children: [
        QuickSettingsButton({
          stack, active: NetworkToggled, cb: Network.toggleWifi,
          icon: "network-wireless-symbolic",
          label: "Internet", subtitle: CurrentConnectedWifi, 
          target: "WifiScanner"
        }),
        QuickSettingsButton({
          stack, active: AudioIsEnabled,
          icon: "audio-volume-high-symbolic",
          label: "Audio mixer", subtitle: AudioMixersCount.bind('value'),
          target: "AudioMixer"
        })
      ]
    }),
    Widget.Box({
      vertical: true,
      spacing: 10,
      children: [
        QuickSettingsButton({
          stack, active: IsBluetoothEnabled, cb: Bluetooth.toggle, 
          icon: "bluetooth-active-symbolic",
          label: "Bluetooth", target: "BluetoothScanner"
        }),
        QuickSettingsButton({
          stack, active: IsPowerProfilesAvailable,
          icon: "power-profile-balanced-symbolic",
          label: "Power Mode", subtitle: CurrentPowerMode,
          target: "PowerProfiles"
        })
      ]
    })
  ]
})

const QuickSettingsSectionTop = (stack) => Widget.Box({
  spacing: 10,
  class_name: "quicksettings-section-top",
  children: [
    Widget.Button({
      class_name: "quicksettings-circular-button",
      css: "padding-right: 12px;",
      hexpand: false, vexpand: false,
      child: Widget.Icon({
        icon: "go-previous-symbolic",
        size: 16,
      }),
      on_primary_click: () => {
        stack.shown = "Main"
      }
    }),
    Widget.Label({
      label: "Return",
      css: "font-size: large",
    })
  ]
})

export const QuickSettingsStackMenu = (stack, name, child) => Widget.Revealer({
  reveal_child: false,
  transition: "slide_up",
  transition_duration: 350,
  child
}).hook(stack, self => {
  let show = stack.shown === name
  self.reveal_child = show
}, 'notify::shown')


const QuickSettingsWifiScanner = (stack) => Widget.Box({
  vertical: true,
  spacing: 20,
  children: [
    QuickSettingsSectionTop(stack),
    WifiScanner(stack) 
  ]
})

const QuickSettingsBluetoothScanner = (stack) => Widget.Box({
  vertical: true,
  spacing: 20,
  children: [
    QuickSettingsSectionTop(stack),
    BluetoothScanner(stack)
  ]
})

const QuickSettingsAudioMixer = (stack) => Widget.Box({
  vertical: true,
  spacing: 20,
  hexpand: true,
  children: [
    QuickSettingsSectionTop(stack),
    AudioMixer(stack)
  ]
})

const QuickSettingsPowerProfiles = (stack) => Widget.Box({
  vertical: true,
  spacing: 20,
  hexpand: true,
  children: [
    QuickSettingsSectionTop(stack),
    Performance(stack)
  ]
})


export default () => {
   return Widget.Window({
    name: "quicksettings",
    visible: false,
    class_name: "quicksettings-window",
    child: Widget.Box({
      class_name: "quicksettings",
      spacing: 10,
      vertical: true,
      children: [
        QuickSettingsTop(),
        Widget.Stack({
          vexpand: false, hexpand: false,
          transition: "slide_left_right",
          setup: self => {
            self.items = [
              ["Main", QuickSettingsMainBox(self)],
              ["WifiScanner", QuickSettingsWifiScanner(self)],
              ["BluetoothScanner", QuickSettingsBluetoothScanner(self)],
              ["AudioMixer", QuickSettingsAudioMixer(self)],
              ["PowerProfiles", QuickSettingsPowerProfiles(self)]
            ]
          }
        }),
        GlobalVolumeMixer()
      ]
    }),
    anchor: ["top", "right"],
    margins: [5,20,0,0]
  })
}
