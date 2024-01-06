import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { QuickSettingsStackMenu } from "./quicksettings.js";

const _audio_icon = () => {
    const vol = Audio.speaker?.volume * 100;
    const icon = [
        [101, 'overamplified'],
        [67,  'high'],
        [34,  'medium'],
        [1,   'low'],
        [0,   'muted'],
    ].find(([threshold]) => threshold <= vol)[1];
    if (icon === undefined) {
        return "audio-volume-muted-symbolic"
    }
    return `audio-volume-${icon}-symbolic`;
}

export const AudioIcon = (className="") => Widget.Icon({
  size: 16,
  className,
  connections: [
    [Audio, self => {
        if (!Audio.speaker)
          return;

        const vol = Audio.speaker?.volume * 100;

        self.icon = _audio_icon()
        
        self.tooltip_text = `Volume ${Math.floor(vol)}%`;

    }]
  ]
})

/** @param {import('resource:///com/github/Aylur/ags/service/audio.js').Stream} stream*/
const AudioMixerItem = (stream) => Widget.Box({
  class_name: "quicksettings-audio-mixer-item",
  children: [
    Widget.Icon({
      icon: stream.icon_name,
      vpack: 'center',
      size: 64,
    }),
    Widget.Box({
      vertical: true,
      children: [
        Widget.Label({
          label: stream.name,
          xalign: 0,
          css: 'padding-left: 10px;' 
        }),
        Widget.Slider({
          hexpand: true,
          draw_value: false,
          on_change: ({ value }) => {
            stream.volume = value
          },
          connections: [
            [stream, (self) => {
              self.value = stream.volume
            }, 'notify::volume'],
          ]
        })
      ]
    }),
    Widget.Label({
      binds: [
        ['label', stream, 'volume']
      ]
    })
  ]
})

export const AudioMixer = (stack) => QuickSettingsStackMenu(stack, "AudioMixer", Widget.Box({
  connections: [
    [Audio, self => {
      self.children = Audio.apps.map(AudioMixerItem)
    }]
  ]
}))
