import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { setGuildLanguage, getGuildLanguage, getAvailableLanguages, getGlobalDefaultLanguage } from '../../utils/language.js';
import { safeDeferReply, cardFromMessage } from '../../ui/responseHandler.js';

const data = new SlashCommandBuilder()
  .setName("language")
  .setDescription("Set the bot's language for this server")
  .addStringOption((option: any) =>
    option.setName("lang")
      .setDescription("Select a language")
      .setRequired(false)
      .setAutocomplete(true)
  )
  .addStringOption((option: any) =>
    option.setName("action")
      .setDescription("Action to perform")
      .setRequired(false)
      .addChoices(
        { name: "View Current", value: "view" },
        { name: "List Available", value: "list" },
        { name: "Reset to Default", value: "reset" }
      )
  );

export default {
  data: data,
  run: async (client: any, interaction: any) => {
    try {
      const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;

      const sendCard = async (content: string, timeout: number = 5000, fallbackTitle: string = 'Language') => {
        await interaction.editReply({
          components: [cardFromMessage(content, fallbackTitle)],
          flags: MessageFlags.IsComponentsV2
        });
        setTimeout(() => {
          interaction.deleteReply().catch(() => {});
        }, timeout);
      };

      const { hasDjPermission } = await import('../../utils/djRole.js');
      if (!hasDjPermission(interaction)) {
        return sendCard("## ❌ Access Denied\n\nYou don't have permission to change the language!\nOnly the server owner or users with the DJ role can change the bot's language.", 5000, 'Access Denied');
      }

      const action = interaction.options.getString('action');
      const langCode = interaction.options.getString('lang');

      if (action === 'view' || (!action && !langCode)) {
        const currentLang = await getGuildLanguage(interaction.guildId);
        const globalLang = getGlobalDefaultLanguage();
        const availableLangs = getAvailableLanguages();

        const currentLangData = availableLangs.find((l: any) => l.code === currentLang);
        const globalLangData = availableLangs.find((l: any) => l.code === globalLang);

        const currentLangName = currentLangData?.name || currentLang.toUpperCase();
        const globalLangName = globalLangData?.name || globalLang.toUpperCase();

        return sendCard(
          `## ℹ️ Language Information\n\n` +
          `**Current Server Language:** ${currentLangName} (${currentLang})\n` +
          `**Global Default Language:** ${globalLangName} (${globalLang})\n\n` +
          `**Available Languages:** ${availableLangs.length}\n\n` +
          `To reset to global default, use \`/language action:reset\``,
          10000,
          'Language Information'
        );
      }

      if (action === 'list') {
        const availableLangs = getAvailableLanguages();

        const langList = availableLangs
          .map((lang: any) => `• **${lang.name}** (\`${lang.code}\`)`)
          .join('\n');

        return sendCard(
          `## 📚 Available Languages\n\n` +
          `Select a language from the list below:\n\n` +
          `**Available Languages:**\n${langList}`,
          15000,
          'Available Languages'
        );
      }

      if (action === 'reset') {
        const globalLang = getGlobalDefaultLanguage();
        const result = await setGuildLanguage(interaction.guildId, globalLang);

        if (!result.success) {
          return sendCard(`## ❌ Failed to Set Language\n\n${result.error || 'Unknown error'}`, 5000, 'Language Error');
        }

        const availableLangs = getAvailableLanguages();
        const langData = availableLangs.find((l: any) => l.code === globalLang);
        const langName = langData?.name || globalLang.toUpperCase();

        return sendCard(
          `## ✅ Language Changed\n\n` +
          `Server language has been changed to: **${langName}**\n\n` +
          `The bot will now use this language for all command responses in this server.\n\n` +
          `**Note:** Command descriptions will remain in the default language, but all responses will be in **${langName}**.`,
          10000,
          'Language Changed'
        );
      }

      if (langCode) {
        const availableLangs = getAvailableLanguages();
        const langExists = availableLangs.some((l: any) => l.code === langCode);

        if (!langExists) {
          return sendCard(`## ❌ Language Not Found\n\nThe language \`${langCode}\` does not exist.`, 5000, 'Language Not Found');
        }

        const result = await setGuildLanguage(interaction.guildId, langCode);

        if (!result.success) {
          return sendCard(`## ❌ Failed to Set Language\n\n${result.error || 'Unknown error'}`, 5000, 'Language Error');
        }

        const langData = availableLangs.find((l: any) => l.code === langCode);
        const langName = langData?.name || langCode.toUpperCase();

        return sendCard(
          `## ✅ Language Changed\n\n` +
          `Server language has been changed to: **${langName}**\n\n` +
          `The bot will now use this language for all command responses in this server.\n\n` +
          `**Note:** Command descriptions will remain in the default language, but all responses will be in **${langName}**.`,
          10000,
          'Language Changed'
        );
      }
    } catch (error) {
      console.error('Error in language command:', error);

      try {
        await interaction.editReply({
          components: [cardFromMessage(`## ❌ Language Error\n\n${error.message}`, 'Language Error')],
          flags: MessageFlags.IsComponentsV2
        });

        setTimeout(() => {
          interaction.deleteReply().catch(() => {});
        }, 5000);
      } catch (fallbackError) {
        await interaction.editReply({
          content: `❌ An error occurred: ${error.message}`
        });
      }
    }
  },
  autocomplete: async (interaction: any) => {
    const availableLangs = getAvailableLanguages();
    const focusedValue = interaction.options.getFocused().toLowerCase();

    const filtered = availableLangs
      .filter((lang: any) =>
        lang.code.toLowerCase().includes(focusedValue) ||
        lang.name.toLowerCase().includes(focusedValue)
      )
      .slice(0, 25)
      .map((lang: any) => ({
        name: `${lang.name} (${lang.code})`,
        value: lang.code
      }));

    await interaction.respond(filtered);
  }
};
