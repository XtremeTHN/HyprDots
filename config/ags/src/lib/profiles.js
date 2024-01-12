import PowerProfiles from 'resource:///com/github/Aylur/ags/service/powerprofiles.js'
import Widget from 'resource:///com/github/Aylur/ags/widget.js'

import { QuickSettingsStackMenu } from './quicksettings.js';
import Variable from 'resource:///com/github/Aylur/ags/variable.js';

const Profile = (profile_name) => Widget.Button({
  class_name: "quicksettings-powerprofiles-item",
  on_primary_click: () => {
    PowerProfiles.active_profile = profile_name.Profile
  },
  child: Widget.Box({
    children: [
      Widget.Label({
        label: profile_name.Profile,
        xalign: 0,
        hexpand: true, 
      }),
      Widget.Icon({
        icon: "emblem-ok-symbolic",
        visible: PowerProfiles.bind('active_profile').transform(p => p === profile_name.Profile) 
      })
    ],
  })
})

export const CurrentPowerMode = PowerProfiles.bind('active_profile')

export const IsPowerProfilesAvailable = Variable(PowerProfiles.profiles.length > 0)
PowerProfiles.connect("changed", power => {
  IsPowerProfilesAvailable.value = power.profiles.length > 0
})

/**
 * @param {Widget.Stack} stack
*/
export const Performance = (stack) => QuickSettingsStackMenu(stack, "PowerProfiles", Widget.Box({
  vertical: true,
  setup: self => {
    self.children = PowerProfiles.profiles.map(Profile)
  }
}))
