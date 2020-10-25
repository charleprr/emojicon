/**
 * The Discord channel dedicated to logs.
 *
 * @param {Channel} channel
 */
module.exports.channel = null;

/**
 * Logs a message to the log channel.
 *
 * @param {String} message
 * @param {DiscordAttachment} [attachment]
 */
module.exports.send = (message, attachment) => {
    module.exports.channel?.send('`'+message+'`', attachment);
};