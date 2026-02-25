export interface BackupResult {
  success: boolean;
  backupPath?: string;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  error?: string;
}

/**
 * BackupService - Refactored to use window.electronAPI (IPC)
 */
export class BackupService {
  /**
   * Create a backup of the database
   */
  async createBackup(): Promise<BackupResult> {
    if (!(window as any).electronAPI) return { success: false, error: 'Electronic only feature' };
    return await (window as any).electronAPI.backup.create();
  }

  /**
   * Restore database from a backup file
   */
  async restoreBackup(backupPath: string): Promise<RestoreResult> {
    if (!(window as any).electronAPI) return { success: false, error: 'Electronic only feature' };
    return await (window as any).electronAPI.backup.restore(backupPath);
  }

  /**
   * Get list of available backups
   */
  async getAvailableBackups(): Promise<string[]> {
    if (!(window as any).electronAPI) return [];
    return await (window as any).electronAPI.backup.list();
  }
}
