import multiDither from "multidither";
import * as Utils from "./libs/utils";
import * as Emoji from "./libs/emoji";
import * as Image from "./libs/image";
import * as Log from "./libs/log";
import Discord from "discord.js";

const client = new Discord.Client({
  partials: [Discord.Partials.Channel],
  intents: [
    Discord.IntentsBitField.Flags.GuildMessages,
    Discord.IntentsBitField.Flags.Guilds,
    Discord.IntentsBitField.Flags.DirectMessages,
  ],
});

const locks = new Set<Discord.Snowflake>();
const cooldowns = new Map<Discord.Snowflake, number>();

/**
 * Emojicon's help message and
 * configuration file.
 */
import helpMessage from "./help.json";
import config from "./config.json";

const dither = new multiDither.FloydSteinbergDither(
  undefined,
  new multiDither.ColorPalette(Emoji.list.map(e => e.color)),
);

client.on("messageCreate", async (message: Discord.Message) => {
  // Debug command for the owner (e!js <code_here> // @Emojicon)
  if (message.author.id == config.owner && message.content.startsWith("e!js")) {
    let output: any;
    try {
      output = eval(message.content.slice(5));
    } catch (e) {
      output = e.message;
    }
    const splitted = Utils.splitMessage(`**Result**: ${output}`);
    splitted.forEach(e => message.channel.send(e));
    return;
  }

  // Block unwanted requests
  if (message.author.bot) return;
  if (locks.has(message.channel.id)) return;
  if (!message.content.match(new RegExp(`^<@!?${client.user.id}>`))) return;

  // Check if the user has a cooldown
  if (cooldowns.get(message.author.id) > Date.now()) {
    const seconds = Math.ceil((cooldowns.get(message.author.id) - Date.now()) / 1000);
    message.channel.send("`⏰ Cooldown! " + seconds + " seconds remaining.`");
    return;
  }

  // Check for permissions
  let blankEmoji = Emoji.customBlankEmoji;

  if (message.guild) {
    const permissions = (message.channel as Discord.TextChannel).permissionsFor(message.guild.members.me);
    if (!permissions.has(Discord.PermissionFlagsBits.SendMessages)) {
      return;
    }
    if (!permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis)) {
      blankEmoji = Emoji.defaultBlankEmoji;
    }
  }

  // Parse message arguments
  let url: string;
  let w: number;
  let h: number;
  let large = true;

  const attachment = message.attachments.first();
  const args = message.content.replace(/  /g, " ").split(" ");
  args.shift();

  if (attachment) {
    url = attachment.url;
  } else if (args.length > 0) {
    const string = args.shift();
    if (string.match(/^<?https?:/)) {
      url = string.replace(/^(<)|(>)$/g, "");
    } else {
      const mentions = [...message.mentions.members?.values()];
      if (mentions && mentions[1]) {
        url = mentions[1].displayAvatarURL({ extension: "png" });
      } else {
        const emoji = Emoji.parse(string);
        if (emoji) {
          url = emoji.imageUrl;
          large = false;
        } else {
          message.channel.send(helpMessage);
          return Log.send(`📰 Helped ${message.author.tag}`);
        }
      }
    }
  } else {
    message.channel.send(helpMessage);
    return Log.send(`📰 Helped ${message.author.tag}`);
  }

  w = parseInt(args.shift());
  h = parseInt(args.shift());

  // Check size arguments
  if (w > 50) {
    message.channel.send("`📐 Too large! (width ≤ 50)`");
    return;
  } else if (h > 200) {
    message.channel.send("`📐 Too tall! (height ≤ 200)`");
    return;
  }

  // Set default values
  w = !w || w < 1 ? (large ? 25 : 18) : w;
  h = !h || h < 1 ? Image.SIZE_AUTO : h;

  // Image checks
  let image: any;
  let channel: any = message.channel;
  try {
    // Open the image and resize it
    image = await Image.open(url, w, h);

    dither.img = image;
    image = dither.dither("", false);

    // Check if height limit is exceeded after resizing
    if (image.bitmap.height > 200) {
      channel.send("`📐 Too tall!`");
      return;
    }

    // Check if response should be sent in private
    if ((w > 30 || image.bitmap.height > 50) && message.guild) {
      channel.send("`📨 Big one! Sending it directly to you...`");
      channel = message.author;
    }

    // Lock the channel to block incoming requests
    locks.add(message.channel.id);

    // Set a 10s cooldown
    cooldowns.set(message.author.id, Date.now() + 10 * 1000);
  } catch (e) {
    const errorEmbed = new Discord.EmbedBuilder();
    if (e.message.includes("MIME")) {
      errorEmbed.setDescription("❌ This filetype is not supported");
    } else {
      errorEmbed.setDescription("❌ Sorry, something went wrong");
      Log.send(`❌ ${e.message}`);
    }
    message.channel.send({ embeds: [errorEmbed] });
  }

  /**
   * For every pixel in the image, find the emoji
   * with the closest color to it.
   *
   * @see emojis.json
   */
  let res = "";
  let trailingBlanks = new RegExp(`(${blankEmoji})+$`, "g");
  for (let y = 0; y < image.bitmap.height; ++y) {
    for (let x = 0; x < image.bitmap.width; ++x) {
      let color = Image.toRGBA(image.getPixelColor(x, y));
      res += Emoji.closest(color);
    }
    res = res.replace(trailingBlanks, "") + "\u200B\n";
  }

  // Send the messages without getting rate-limited
  try {
    const batches = Utils.splitMessage(res);
    if (batches.length == 1) {
      await channel.send(res);
    } else {
      for (const batch of batches) {
        await channel.send(batch);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (e) {
    const errorEmbed = new Discord.EmbedBuilder();
    if (e.code === 50007) {
      errorEmbed.setDescription("❌ Please, allow direct messages from server members");
    } else {
      errorEmbed.setDescription("❌ Sorry, something went wrong");
      Log.send(`❌ ${e.message}`);
    }
    message.channel.send({ embeds: [errorEmbed] });
  }

  locks.delete(message.channel.id);

  const size = `🎨 ${image.bitmap.width}x${image.bitmap.height}`;
  const user = `👤 ${message.author.tag}`;

  if (message.guild) {
    const server = `📰 ${message.guild.name}`;
    Log.send(`${size}\` \`${user}\` \`${server}`);
  } else {
    Log.send(`${size}\` \`${user}`);
  }
});

client.on("ready", () => {
  client.user.setActivity("with emojis, ping me!");
  setInterval(() => {
    client.user.setActivity("with emojis, ping me!");
  }, 60000);
  if (config.logs && config.logs !== "") {
    Log.setChannel(client.channels.cache.get(config.logs) as Discord.TextChannel);
  }
  Log.send(`✔️ Connected in ${client.guilds.cache.size} servers`);
});

client.on("warn", warning => Log.send(`⚠️ ${warning}`));
client.on("error", error => Log.send(`❌ ${error}`));
client.on("shardError", error => Log.send(`💥 ${error}`));
client.on("shardDisconnect", () => Log.send(`🔌 Disconnected`));
client.on("invalidated", () => Log.send(`⛔ Session invalidated`));
client.on("rateLimit", () => Log.send(`🐌 Rate-limited`));
client.on("guildCreate", guild => Log.send(`➕ Joined '${guild.name}' (${guild.memberCount} members)`));
client.on("guildDelete", guild => Log.send(`➖ Left '${guild.name}' (${guild.memberCount} members)`));

client.login(config.token);
