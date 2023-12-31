import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import Widget from 'resource:///com/github/Aylur/ags/widget.js';

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
