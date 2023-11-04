import { TextChannel } from "discord.js";

/**
 * The Discord channel dedicated to logs.
 */
let logChannel: TextChannel = null;

export function setChannel(channel: TextChannel) {
  logChannel = channel;
}

/**
 * Logs a message to the log channel.
 */
export function send(message: string) {
  logChannel?.send("`" + message + "`");
}
