const Discord = require('discord.js')
const multiDither = require('multidither')
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILDS] })

const Emoji = require('./libs/emoji')
const Image = require('./libs/image')
const Log = require('./libs/log')
const helpMessage = require('./help.json')

/**
 * Emojicon's configuration file.
 * @see README.md
 */
const config = require('./config.json')

const dither = new multiDither.FloydSteinbergDither(undefined, new multiDither.ColorPalette(
    Emoji.list.map(e => e.color)
))

client.on('messageCreate', async m => {

    // Debug command for the owner (e!js <code_here>)
    if (m.author.id == config.owner && m.content.startsWith('e!js')) {
        let output
        try { output = eval(m.content.slice(5)) }
        catch (e) { output = e.message }
        return m.channel.send(`**Result**: ${output}`, { split: { char: ' ', maxLength: 2000 } })
    }

    // Block unwanted requests
    if (m.author.bot) return
    if (m.channel.lock) return
    if (!m.content.match(new RegExp(`^<@!?${client.user.id}>`))) return

    // Check if the user has a cooldown
    if (m.author.cooldown > Date.now()) {
        const seconds = Math.ceil((m.author.cooldown - Date.now()) / 1000)
        return m.channel.send('`⏰ Cooldown! ' + seconds + ' seconds remaining.`')
    }

    // Check for permissions
    if (m.guild) {
        const permissions = m.channel.permissionsFor(m.guild.me)
        if (!permissions.has('SEND_MESSAGES')) return
        if (permissions.has('USE_EXTERNAL_EMOJIS') && config.blank) {
            Emoji.BLANK = config.blank
        } else {
            Emoji.BLANK = ':heavy_minus_sign:'
        }
    } else {
        Emoji.BLANK = config.blank
    }

    // Parse message arguments
    let url, w, h
    let large = true

    const attachment = m.attachments.first()
    const args = m.content.replace(/  /g, ' ').split(' ')
    args.shift()

    if (attachment) {
        url = attachment.url
    } else if (args.length > 0) {
        const string = args.shift()
        if (string.match(/^<?https?:/)) {
            url = string.replace(/^(<)|(>)$/g, '')
        } else {
            const mentions = [...m.mentions.members.values()]
            if (mentions[1]) {
                url = mentions[1].displayAvatarURL({ format: "png" })
            } else {
                const emoji = Emoji.parse(string)
                if (emoji) {
                    url = emoji.imageUrl
                    large = false
                } else {
                    m.channel.send(helpMessage)
                    return Log.send(`📰 Helped ${m.author.tag}`)
                }
            }
        }
    } else {
        m.channel.send(helpMessage)
        return Log.send(`📰 Helped ${m.author.tag}`)
    }

    w = parseInt(args.shift())
    h = parseInt(args.shift())

    // Check size arguments
    if (w > 50) return m.channel.send('`📐 Too large! (width ≤ 50)`')
    else if (h > 200) return m.channel.send('`📐 Too tall! (height ≤ 200)`')

    // Set default values
    w = (!w || w < 1) ? (large ? 25 : 18) : w
    h = (!h || h < 1) ? Image.AUTO : h

    // Image checks
    let image
    let channel = m.channel
    try {

        // Open the image and resize it
        image = await Image.open(url, w, h)


        dither.img = image
        image = dither.dither('', false)


        // Check if height limit is exceeded after resizing
        if (image.bitmap.height > 200) return channel.send('`📐 Too tall!`')

        // Check if response should be sent in private
        if ((w > 30 || image.bitmap.height > 50) && m.guild) {
            channel.send('`📨 Big one! Sending it directly to you...`')
            channel = m.author
        }

        // Lock the channel to block incoming requests
        channel.lock = true

        // Set a 10s cooldown
        m.author.cooldown = Date.now() + 10 * 1000

    } catch (e) {
        const errorEmbed = new Discord.MessageEmbed()
        if (e.message.includes('MIME')) {
            errorEmbed.setDescription('❌ This filetype is not supported')
        } else {
            errorEmbed.setDescription('❌ Sorry, something went wrong')
            Log.send(`❌ ${e.message}`)
        }
        m.channel.send({ embeds: [errorEmbed] })
    }

    /**
     * ✨ This is where the magic happens ✨
     *
     * For every pixel in the image, find the emoji
     * with the closest color to it.
     *
     * @see emojis.json
     */
    let res = ''
    let trailingBlanks = new RegExp(`(${Emoji.BLANK})+$`, 'g')
    for (let y = 0; y < image.bitmap.height; ++y) {
        for (let x = 0; x < image.bitmap.width; ++x) {
            let color = Image.toRGBA(image.getPixelColor(x, y))
            res += Emoji.closest(color)
        }
        res = res.replace(trailingBlanks, '') + '\u200B\n'
    }

    // Send the messages without getting rate-limited
    try {
        const batches = Discord.Util.splitMessage(res, { maxLength: 2000 })
        if (batches.length == 1) {
            await channel.send(res)
        } else {
            for (const batch of batches) {
                await channel.send(batch)
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }
    } catch (e) {
        const errorEmbed = new Discord.MessageEmbed()
        if (e.code === 50007) {
            errorEmbed.setDescription('❌ Please, allow direct messages from server members')
        } else {
            errorEmbed.setDescription('❌ Sorry, something went wrong')
            Log.send(`❌ ${e.message}`)
        }
        m.channel.send({ embeds: [errorEmbed] })
    }

    channel.lock = false

    const size = `🎨 ${image.bitmap.width}x${image.bitmap.height}`
    const user = `👤 ${m.author.tag}`

    if (m.guild) {
        const server = `📰 ${m.guild.name}`
        Log.send(`${size}\` \`${user}\` \`${server}`)
    } else {
        Log.send(`${size}\` \`${user}`)
    }

})

client.on('ready', () => {
    client.user.setActivity('with emojis, ping me!')
    setInterval(() => {
        client.user.setActivity('with emojis, ping me!')
    }, 60000)
    if (config.logs && config.logs !== '') {
        Log.channel = client.channels.cache.get(config.logs)
    }
    Log.send(`✔️ Connected in ${client.guilds.cache.size} servers`)
})

client.on('warn', (warning) =>      Log.send(`⚠️ ${warning}`))
client.on('error', (error) =>       Log.send(`❌ ${error}`))
client.on('shardError', (error) =>  Log.send(`💥 ${error}`))
client.on('shardDisconnect', () =>  Log.send(`🔌 Disconnected`))
client.on('invalidated', () =>      Log.send(`⛔ Session invalidated`))
client.on('rateLimit', () =>        Log.send(`🐌 Rate-limited`))
client.on('guildCreate', (guild) => Log.send(`➕ Joined '${guild.name}' (${guild.memberCount} members)`))
client.on('guildDelete', (guild) => Log.send(`➖ Left '${guild.name}' (${guild.memberCount} members)`))

client.login(config.token)
