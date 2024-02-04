import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { QuickSettingsStackMenu } from "./quicksettings.js";
import Variable from "resource:///com/github/Aylur/ags/variable.js";
import { interval } from "resource:///com/github/Aylur/ags/utils.js";

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
  className 
}).hook(Audio, self => {
    if (!Audio.speaker)
      return;

    const vol = Audio.speaker?.volume * 100;

    self.icon = _audio_icon()
        
    self.tooltip_text = `Volume ${Math.floor(vol)}%`;

})

export const AudioIsEnabled = Variable(false)
interval(1000, () => {
  AudioIsEnabled.value = Audio.apps.length > 0
  Audio.connect('notify::apps', () => {
    AudioIsEnabled.value = Audio.apps.length > 0
  })
})

const DEFAULT_MIXER_COUNT="No mixers"
export const AudioMixersCount = Variable(DEFAULT_MIXER_COUNT)
Audio.connect('notify', () => {
  AudioMixersCount.value = `${Audio.apps.length > 0 ? Audio.apps.length : "No"} mixers`
})

/** @param {import('resource:///com/github/Aylur/ags/service/audio.js').Stream} stream*/
const AudioMixerItem = (stream) => Widget.Box({
  class_name: "quicksettings-audio-mixer-item",
  spacing: 10,
  children: [
    Widget.Icon({
      icon: stream.icon_name,
      vpack: 'center',
      size: 52,
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
        }).hook(stream, self => {
          self.value = stream.volume
        }, 'notify::volume')
      ]
    }) 
  ]
})

export const IncrementVolume = () => {
  Audio.speaker.volume += 0.10
}

export const DecreaseVolume = () => {
  Audio.speaker.volume -= 0.10
}

export const AudioMixer = (stack) => QuickSettingsStackMenu(stack, "AudioMixer", Widget.Box({
  vertical: true,
  children: Audio.bind('apps').transform(v => v.map(AudioMixerItem)) 
}))

export const GlobalVolumeMixer = () => Widget.Box({
  vertical: true,
  class_name: 'quicksettings-global-volume-mixer',
  // css: 'background-color: @theme_bg_color',
  children: [
    Widget.Box({
      vertical: true,
      children: [
        Widget.Label({
          label: 'Volume',
          class_name: 'quicksettings-global-volume-mixer-label',
          xalign: 0,
        }),
        Widget.Slider({
          draw_value: false,
          class_name: "quicksettings-global-volume-mixer-slider",
          hexpand: true,
          on_change: ({ value }) => {
            Audio.speaker.volume = value
          }
        }).hook(Audio.speaker, (self) => {
          self.value = Audio.speaker?.volume
        }, 'notify::volume')
      ]
    }),
    Widget.Box({
      vertical: true,
      children: [
        Widget.Label({
          label: 'Microphone',
          class_name: 'quicksettings-global-volume-mixer-label',
          xalign: 0,
        }),
        Widget.Slider({
          draw_value: false,
          class_name: "quicksettings-global-volume-mixer-slider",
          hexpand: true,
          on_change: ({ value }) => {
            Audio.microphone.volume = value
          }
        }).hook(Audio.microphone, (self) => {
          self.value = Audio.microphone.volume
        }, 'notify::volume')
      ]
    })
  ]
})