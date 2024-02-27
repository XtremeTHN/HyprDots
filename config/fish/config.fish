set -g fish_greeting
starship init fish | source

function bind_bang
    switch (commandline -t)[-1]
        case "!"
            commandline -t -- $history[1]
            commandline -f repaint
        case "*"
            commandline -i !
    end
end

function bind_dollar
    switch (commandline -t)[-1]
        case "!"
            commandline -f backward-delete-char history-token-search-backward
        case "*"
            commandline -i '$'
    end
end

function fish_user_key_bindings
    bind ! bind_bang
    bind '$' bind_dollar
end

function backup --argument filename
    cp "$filename" "$filename".bak
end

function NewScript
  $EDITOR "$HOME/.local/share/$argv[1]"
  chmod +x "$HOME/.local/share/$argv[1]"
end

function execAsync
  hyprctl dispatch exec $argv
end

function cpwd
  wl-copy (pwd)
end

alias neofetch="neofetch --kitty --source '~/Pictures/Wallpapers/ori_wallpaper3.jpeg'"
alias icat="kitty +kitten icat"
alias ls="exa --icons"
alias vinegar="io.github.vinegarhq.Vinegar"
alias mpv="mpv --vo=kitty"

alias dotfiles='/usr/bin/git --git-dir=$HOME/.cfg --work-tree=$HOME '

fish_add_path ~/.local/bin
export EDITOR=nvim

set FISH_CONFIG_PATH ~/.config/fish/config.fish
set BOTTLES_PREFIXES ~/.var/app/com.usebottles.bottles/data/bottles/bottles/

direnv hook fish | source
