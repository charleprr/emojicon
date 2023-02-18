<p align="center">
    <img src="https://cdn.discordapp.com/emojis/768872298383933531.png?v=1" width="96"/><br/>
</p>
<h1 align="center">
    Emojicon
</h1>
<p align="center">
    <a href="https://nodejs.org/en/">
        <img alt="NodeJS" src="https://img.shields.io/badge/NodeJS-16.6+-07a31e.svg">
    </a>
    <a href="https://github.com/charlypoirier/emojicon/releases">
        <img alt="Release" src="https://img.shields.io/badge/Release-v2.1.0-1389BF.svg">
    </a>
    <a href="https://github.com/charlypoirier/emojicon/blob/main/LICENSE">
        <img alt="License" src="https://img.shields.io/badge/License-GNU_GPLv3-F56831.svg">
    </a><br/>
    <a href="https://github.com/charlypoirier/emojicon#overview">Overview</a> •
    <a href="https://github.com/charlypoirier/emojicon#installation">Installation</a> •
    <a href="https://github.com/charlypoirier/emojicon#contributing">Contributing</a> •
    <a href="https://github.com/charlypoirier/emojicon#license">License</a>
</p>

## Overview

A Discord bot that converts images into emojis!

<p align="center">
    <img src="https://i.imgur.com/tkdEI4M.png" height="340"/>
</p>

It supports image formats that are supported by [Jimp](https://github.com/oliver-moran/jimp) (`JPEG`, `PNG`, `BMP`, `TIFF` and `GIF`) and works with default emojis, custom emojis, image links and attachments. The size can be customized, up to 30x50 emojis in server channels and 50x200 emojis in direct messages.

[Invite the bot](https://discord.com/api/oauth2/authorize?client_id=591203757287538690&permissions=274878188544&scope=bot+applications.commands) to your server.

## Installation

Run `npm install` to install dependencies.

Create a new `config.json` file at the root of the project directory, as such:

```js
{
    "token": "", // Your bot's token
    "owner": "", // Your user ID (optional)
    "blank": "", // A transparent emoji (optional)
    "logs":  ""  // A Discord channel ID for logs (optional)
}
```

Run `npm start` to start the bot.

## Contributing

I am always looking for improvements, feel free to contribute to this project!<br/>
You can star this repository, send suggestions and ideas, open issues and create pull requests.

## License

Released under the [GNU GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html) License.<br/>
Emoji assets are from [Twemoji](https://github.com/twitter/twemoji) and licensed under [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
