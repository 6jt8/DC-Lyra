import { config } from '../config.js';

export function hasDjPermission(interaction: any): boolean {
  if (interaction.guild.ownerId === interaction.user.id) return true;
  if (interaction.member.permissions?.has?.('Administrator')) return true;
  const djRoleName = config.djRole;
  if (!djRoleName) return false;
  if (interaction.member.roles?.cache?.some?.((r: any) => r.name === djRoleName || r.id === djRoleName)) return true;
  return false;
}

export function buildDjError(title?: string, message?: string): { title: string; message: string; note: string } {
  return {
    title: title || '## ❌ Access Denied',
    message: message || 'You do not have permission to use this command.',
    note: `This command requires the **${config.djRole || 'DJ'}** role or Administrator permission.`
  };
}
