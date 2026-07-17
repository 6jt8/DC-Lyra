import {
  SlashCommandBuilder,
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  MediaGalleryBuilder,
  MessageFlags
} from 'discord.js';
import { config } from '../../config.js';
import * as fs from 'fs';
import * as path from 'path';
import { getLang } from '../../utils/language.js';
import { getEmoji, getButtonEmoji } from '../../emoji/emoji.js';
import { safeDeferReply, stripLeadingIcons } from '../../ui/responseHandler.js';
import { getCommandMentionMap, getCommandRef } from '../../music/player-store.js';

const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Get information about the bot and its commands")
  .addStringOption((option: any) =>
    option.setName("category")
      .setDescription("Select a category to view")
      .setRequired(false)
      .addChoices(
        { name: "🏠 Main Menu", value: "main" },
        { name: "🎵 Music Commands", value: "music" },
        { name: "📋 Playlist Commands", value: "playlist" },
        { name: "💜 Basic Commands", value: "basic" },
        { name: "🔧 Utility Commands", value: "utility" }
      )
  );

function getCommandCategory(commandName: string): string {
  const commandsDir = path.resolve(__dirname, '../../commands');
  const categoryFolders = ['basic', 'music', 'playlist', 'utility'];

  for (const folder of categoryFolders) {
    const folderPath = path.join(commandsDir, folder);
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      if (files.some((file: string) => file.replace('.js', '') === commandName)) {
        return folder;
      }
    }
  }

  return 'basic';
}

function groupCommandsByCategory(client: any) {
  const grouped: Record<string, any[]> = {
    music: [],
    playlist: [],
    basic: [],
    utility: []
  };

  client.commands.forEach((cmd: any, name: string) => {
    const category = getCommandCategory(name);
    if (grouped[category]) {
      grouped[category].push(cmd);
    } else {
      grouped.basic.push(cmd);
    }
  });

  return grouped;
}

function formatUptime(secondsTotal: number): string {
  const days = Math.floor(secondsTotal / (3600 * 24));
  const hours = Math.floor((secondsTotal % (3600 * 24)) / 3600);
  const minutes = Math.floor((secondsTotal % 3600) / 60);
  const seconds = Math.floor(secondsTotal % 60);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function getPingStatus(ping: number): string {
  if (ping <= 90) return `${getEmoji('success')} Excellent`;
  if (ping <= 180) return `${getEmoji('success')} Good`;
  if (ping <= 280) return `${getEmoji('warning')} Stable`;
  return `${getEmoji('error')} High`;
}

function getCategoryMeta(lang: any, categoryKey: string) {
  const fallback: Record<string, { name: string; description: string }> = {
    music: { name: 'Music Commands', description: 'Control music playback and settings' },
    playlist: { name: 'Playlist Commands', description: 'Manage your playlists' },
    basic: { name: 'Basic Commands', description: 'General bot information and utilities' },
    utility: { name: 'Utility Commands', description: 'Additional utility features' }
  };

  const langCategory = lang?.help?.categories?.[categoryKey] || {};
  const fallbackCategory = fallback[categoryKey] || fallback.basic;

  return {
    name: langCategory.name || fallbackCategory.name,
    description: langCategory.description || fallbackCategory.description
  };
}

function createNavigationButton(label: string, customId: string, emojiKey: string, style: any, disabled: boolean = false) {
  const button = new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(stripLeadingIcons(label))
    .setStyle(style)
    .setDisabled(disabled);

  const emoji = getButtonEmoji(emojiKey);
  if (emoji) button.setEmoji(emoji);

  return button;
}

function buildTabsRow(activeKey: string) {
  const styleFor = (key: string) => activeKey === key ? ButtonStyle.Danger : ButtonStyle.Secondary;

  return new ActionRowBuilder().addComponents(
    createNavigationButton('Overview', 'help_tab_overview', 'home', styleFor('overview')),
    createNavigationButton('Music', 'help_tab_music', 'music', styleFor('music')),
    createNavigationButton('Playlist', 'help_tab_playlist', 'playlist', styleFor('playlist')),
    createNavigationButton('Basic', 'help_tab_basic', 'basic', styleFor('basic')),
    createNavigationButton('Utility', 'help_tab_utility', 'utility', styleFor('utility'))
  );
}

function buildControlsRow(backCustomId: string) {
  return new ActionRowBuilder().addComponents(
    createNavigationButton('Back', backCustomId, 'home', ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('help_close')
      .setLabel('Close')
      .setStyle(ButtonStyle.Danger)
  );
}

function buildCommandSelect(categoryKey: string, commands: any[]) {
  const options = commands
    .slice(0, 25)
    .map((cmd: any) => ({
      label: `/${cmd.data.name}`,
      description: (cmd.data.description || 'No description').slice(0, 100),
      value: cmd.data.name
    }));

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`help_select_${categoryKey}`)
      .setPlaceholder('Select a command for detailed info')
      .addOptions(options)
  );
}

function buildCard(title: string, sections: string[], actionRows: any[] = [], banner: any = null) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents((textDisplay: any) => textDisplay.setContent(`## ${title}`));

  if (banner) {
    container
      .addSeparatorComponents((separator: any) => separator)
      .addMediaGalleryComponents(banner);
  }

  for (const section of sections) {
    container
      .addSeparatorComponents((separator: any) => separator)
      .addTextDisplayComponents((textDisplay: any) => textDisplay.setContent(section));
  }

  if (actionRows.length) {
    container
      .addSeparatorComponents((separator: any) => separator)
      .addActionRowComponents(actionRows);
  }

  return container;
}

function buildHelpBanner(): any {
  const bannerUrl = String(config.helpBannerUrl || '').trim();
  if (!bannerUrl) return null;

  try {
    new URL(bannerUrl);
  } catch (_) {
    return null;
  }

  return new MediaGalleryBuilder().addItems(
    (mediaItem: any) => mediaItem
      .setURL(bannerUrl)
      .setDescription('Help Banner')
  );
}

function buildRotatingCommandHint(commandMentionMap?: Map<string, string>): string {
  const rotating = ['play', 'queue', 'search', 'history', 'filters', 'trackinfo', 'stats', 'support'];
  const start = Math.floor(Date.now() / 30000) % rotating.length;
  const picks = [
    rotating[start],
    rotating[(start + 1) % rotating.length],
    rotating[(start + 2) % rotating.length],
    rotating[(start + 3) % rotating.length],
    rotating[(start + 4) % rotating.length]
  ];

  const refs = picks.map((name) => getCommandRef(name, commandMentionMap));
  return `${getEmoji('search')} Try: ${refs.join(' • ')}`;
}

function buildMainBody(client: any, lang: any, groupedCommands: any, commandMentionMap?: Map<string, string>): string[] {
  const botName = client.user?.username || 'Lyra';
  const totalCommands = client.commands.size;
  const totalServers = client.guilds.cache.size;
  const totalUsers = client.guilds.cache.reduce((acc: number, guild: any) => acc + (guild.memberCount || 0), 0);
  const uptime = formatUptime(process.uptime());
  const ping = client.ws.ping;

  const musicMeta = getCategoryMeta(lang, 'music');
  const playlistMeta = getCategoryMeta(lang, 'playlist');
  const basicMeta = getCategoryMeta(lang, 'basic');
  const utilityMeta = getCategoryMeta(lang, 'utility');
  const pingStatus = getPingStatus(ping);

  return [
    [
      `### ${getEmoji('commands')} Overview`,
      `• Commands: **${totalCommands}**`,
      `• Servers: **${totalServers}**`,
      `• Users: **${totalUsers.toLocaleString()}**`,
      `• Uptime: **${uptime}**`,
      `• Ping: **${ping}ms** (${pingStatus})`
    ].join('\n'),
    [
      `### ${getEmoji('folder')} Categories`,
      `• ${getEmoji('music')} ${musicMeta.name}: **${groupedCommands.music.length}**`,
      `• ${getEmoji('playlist')} ${playlistMeta.name}: **${groupedCommands.playlist.length}**`,
      `• ${getEmoji('basic')} ${basicMeta.name}: **${groupedCommands.basic.length}**`,
      `• ${getEmoji('utility')} ${utilityMeta.name}: **${groupedCommands.utility.length}**`
    ].join('\n'),
    `${getEmoji('home')} Select a tab below to view commands.`,
    buildRotatingCommandHint(commandMentionMap)
  ];
}

function getCategorySections(categoryKey: string) {
  const map: Record<string, { title: string; keys: string[] }[]> = {
    music: [
      { title: 'Playback', keys: ['play', 'search', 'pause', 'resume', 'skip', 'stop', 'seek', 'volume', 'np', 'trackinfo', 'voteskip', 'join', 'leave', 'previous', 'loop', 'forceskip', 'rewind', 'forward', 'restart', 'bassboost', 'speed'] },
      { title: 'Queue', keys: ['queue', 'shuffle', 'move', 'remove', 'jump', 'clear', 'skipto', 'lock', 'unlock'] },
      { title: 'Effects', keys: ['filters', 'autoplay', 'equalizer'] },
      { title: 'Other', keys: ['grab', 'summon', 'disconnect'] }
    ],
    playlist: [
      { title: 'Manage', keys: ['createplaylist', 'deleteplaylist', 'myplaylists', 'allplaylists'] },
      { title: 'Songs', keys: ['addsong', 'deletesong', 'showsongs'] },
      { title: 'Playback', keys: ['playcustomplaylist', 'savequeue'] }
    ],
    basic: [
      { title: 'General', keys: ['help', 'ping', 'stats', 'support'] }
    ],
    utility: [
      { title: 'Server', keys: ['language', '247'] },
      { title: 'Music Tools', keys: ['history'] }
    ]
  };

  return map[categoryKey] || [];
}

function renderCategoryTree(categoryKey: string, commands: any[], commandMentionMap?: Map<string, string>): string {
  const sections = getCategorySections(categoryKey);
  const commandMap = new Map(commands.map((cmd: any) => [cmd.data.name, cmd]));
  const consumed = new Set<string>();
  const lines: string[] = [];

  for (const section of sections) {
    const found = section.keys.filter((name) => commandMap.has(name));
    if (!found.length) continue;
    found.forEach((name) => consumed.add(name));

    lines.push(`**${section.title} (${found.length})**`);
    lines.push(found.map((name) => getCommandRef(name, commandMentionMap)).join('  '));
    lines.push('');
  }

  const extra = commands
    .map((cmd: any) => cmd.data.name)
    .filter((name: string) => !consumed.has(name));

  if (extra.length) {
    lines.push(`**Extra (${extra.length})**`);
    lines.push(extra.map((name) => getCommandRef(name, commandMentionMap)).join('  '));
  }

  return lines.length ? lines.join('\n').trim() : '`No commands available.`';
}

function buildCategoryBody(lang: any, groupedCommands: any, categoryKey: string, commandMentionMap?: Map<string, string>): string[] {
  const categoryMeta = getCategoryMeta(lang, categoryKey);
  const commands = groupedCommands[categoryKey] || [];
  const sortedCommands = [...commands].sort((a: any, b: any) => a.data.name.localeCompare(b.data.name));
  const tree = sortedCommands.length
    ? renderCategoryTree(categoryKey, sortedCommands, commandMentionMap)
    : '`No commands available in this category.`';

  return [
    `${categoryMeta.description}`,
    `### ${getEmoji('folder')} Commands\n${tree}`,
    `${getEmoji('search')} Select a command below to view details.`
  ];
}

function buildCommandDetailsBody(lang: any, categoryKey: string, command: any, commandMentionMap?: Map<string, string>): string[] {
  const categoryMeta = getCategoryMeta(lang, categoryKey);
  const json = command.data.toJSON();
  const commandRef = getCommandRef(json.name, commandMentionMap);
  const options = (json.options || [])
    .map((opt: any) => `• \`${opt.name}\`: ${opt.description || 'No description'}`)
    .join('\n');

  return [
    `${getEmoji('commands')} **/${json.name}**\n${json.description || 'No description available.'}`,
    [
      `### ${getEmoji(categoryKey)} Category`,
      `• ${categoryMeta.name}`,
      `• Run: ${commandRef}`
    ].join('\n'),
    `### ${getEmoji('settings')} Options\n${options || '`No options for this command.`'}`
  ];
}

function buildExpiredBody(client: any): string[] {
  const sample = ['help', 'ping', 'stats', 'support', 'play'].map((c) => `\`${c}\``).join(', ');
  return [
    `${getEmoji('warning')} **This interaction expired**\nRun the command again to open a fresh help panel.`,
    `${getEmoji('commands')} Quick commands: ${sample}`
  ];
}

function sendHelpResponse(interaction: any, components: any[]) {
  const response = {
    components,
    flags: MessageFlags.IsComponentsV2
  };

  if (interaction.deferred || interaction.replied) {
    return interaction.editReply(response);
  }

  if (interaction.isButton?.() || interaction.isStringSelectMenu?.()) {
    return interaction.update(response);
  }

  return interaction.reply(response);
}

async function showMainMenu(client: any, interaction: any) {
  const lang = await getLang(interaction.guildId).catch(() => ({}));
  const groupedCommands = groupCommandsByCategory(client);
  const commandMentionMap = await getCommandMentionMap(client, interaction);
  const banner = buildHelpBanner();
  const card = buildCard(
    `${getEmoji('help')} ${client.user?.username || 'Lyra'} Help Section`,
    buildMainBody(client, lang, groupedCommands, commandMentionMap),
    [buildTabsRow('overview')],
    banner
  );

  return sendHelpResponse(interaction, [card]);
}

async function showCategoryPage(client: any, interaction: any, categoryKey: string) {
  const lang = await getLang(interaction.guildId).catch(() => ({}));
  const groupedCommands = groupCommandsByCategory(client);
  const commandMentionMap = await getCommandMentionMap(client, interaction);
  const banner = buildHelpBanner();
  const safeCategory = ['music', 'playlist', 'basic', 'utility'].includes(categoryKey) ? categoryKey : 'basic';
  const categoryCommands = [...(groupedCommands[safeCategory] || [])].sort((a: any, b: any) => a.data.name.localeCompare(b.data.name));
  const actionRows: any[] = [buildTabsRow(safeCategory)];
  if (categoryCommands.length) {
    actionRows.push(buildCommandSelect(safeCategory, categoryCommands));
  }
  actionRows.push(buildControlsRow('help_back_overview'));

  const card = buildCard(
    `${getEmoji(safeCategory)} ${getCategoryMeta(lang, safeCategory).name}`,
    buildCategoryBody(lang, groupedCommands, safeCategory, commandMentionMap),
    actionRows,
    banner
  );

  return sendHelpResponse(interaction, [card]);
}

async function showCommandDetails(client: any, interaction: any, categoryKey: string, commandName: string) {
  const lang = await getLang(interaction.guildId).catch(() => ({}));
  const groupedCommands = groupCommandsByCategory(client);
  const commandMentionMap = await getCommandMentionMap(client, interaction);
  const banner = buildHelpBanner();
  const safeCategory = ['music', 'playlist', 'basic', 'utility'].includes(categoryKey) ? categoryKey : 'basic';
  const categoryCommands = [...(groupedCommands[safeCategory] || [])].sort((a: any, b: any) => a.data.name.localeCompare(b.data.name));
  const command = categoryCommands.find((cmd: any) => cmd.data.name === commandName);

  if (!command) {
    return showCategoryPage(client, interaction, safeCategory);
  }

  const actionRows: any[] = [
    buildTabsRow(safeCategory),
    buildCommandSelect(safeCategory, categoryCommands),
    buildControlsRow(`help_back_cat_${safeCategory}`)
  ];

  const card = buildCard(
    `${getEmoji('commands')} Command Details`,
    buildCommandDetailsBody(lang, safeCategory, command, commandMentionMap),
    actionRows,
    banner
  );

  return sendHelpResponse(interaction, [card]);
}

async function showExpired(client: any, interaction: any) {
  const banner = buildHelpBanner();
  const card = buildCard(
    'Bot Information',
    buildExpiredBody(client),
    [],
    banner
  );

  return sendHelpResponse(interaction, [card]);
}

async function renderFromSelection(client: any, interaction: any, selectedCategory: string) {
  if (selectedCategory === 'main' || selectedCategory === 'home' || selectedCategory === 'overview') {
    return showMainMenu(client, interaction);
  }

  return showCategoryPage(client, interaction, selectedCategory);
}

async function handleComponent(client: any, interaction: any) {
  const customId = interaction.customId;

  if (customId === 'help_close') {
    return showExpired(client, interaction);
  }

  if (customId === 'help_back_main' || customId === 'help_back_overview' || customId === 'help_home') {
    return showMainMenu(client, interaction);
  }

  if (customId.startsWith('help_back_cat_')) {
    const category = customId.replace('help_back_cat_', '');
    return showCategoryPage(client, interaction, category);
  }

  if (customId.startsWith('help_tab_')) {
    const tab = customId.replace('help_tab_', '');
    return renderFromSelection(client, interaction, tab);
  }

  if (customId.startsWith('help_cat_')) {
    const category = customId.replace('help_cat_', '');
    return showCategoryPage(client, interaction, category);
  }

  if (customId === 'help_category_select') {
    const selectedCategory = interaction.values[0];
    return renderFromSelection(client, interaction, selectedCategory);
  }

  if (customId.startsWith('help_select_')) {
    const category = customId.replace('help_select_', '');
    const commandName = interaction.values[0];
    return showCommandDetails(client, interaction, category, commandName);
  }
}

export default {
  data: data,
  helpers: {
    showMainMenu,
    showCategoryPage,
    showCommandDetails,
    showExpired,
    renderFromSelection,
    handleComponent,
    groupCommandsByCategory
  },
  run: async (client: any, interaction: any) => {
    try {
      const deferred = await safeDeferReply(interaction);
      if (!deferred && !interaction.deferred && !interaction.replied) return;
      const selectedCategory = interaction.options.getString('category') || 'main';

      return renderFromSelection(client, interaction, selectedCategory);
    } catch (e) {
      console.error('Error in help command:', e);

      try {
        const errorCard = buildCard(
          'Help Error',
          ['❌ Failed to load the help interface. Please try again.']
        );

        return interaction.editReply({
          components: [errorCard],
          flags: MessageFlags.IsComponentsV2
        });
      } catch (_) {
        return interaction.editReply({ content: '❌ Failed to load help.' });
      }
    }
  },
};
