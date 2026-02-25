import { ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { IpcChannels } from './types';
import { getDatabase, closeDatabase, initializeDatabase } from '../../src/database/connection';

export function setupBackupHandlers() {
    const dbPath = path.join(process.cwd(), 'pos-database.db');
    const backupDir = path.join(process.cwd(), 'backups');

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    ipcMain.handle('db:backup:create', async () => {
        try {
            if (!fs.existsSync(dbPath)) {
                return { success: false, error: 'Database file not found' };
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `pos-backup-${timestamp}.db`;
            const backupPath = path.join(backupDir, backupFileName);

            const wasInitialized = getDatabase() !== null;
            if (wasInitialized) {
                closeDatabase();
            }

            fs.copyFileSync(dbPath, backupPath);

            if (wasInitialized) {
                initializeDatabase(dbPath);
            }

            return { success: true, backupPath };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('db:backup:restore', async (_, backupPath: string) => {
        try {
            if (!fs.existsSync(backupPath)) {
                return { success: false, error: 'Backup file not found' };
            }

            const wasInitialized = getDatabase() !== null;
            if (wasInitialized) {
                closeDatabase();
            }

            const currentBackupPath = `${dbPath}.before-restore`;
            if (fs.existsSync(dbPath)) {
                fs.copyFileSync(dbPath, currentBackupPath);
            }

            try {
                fs.copyFileSync(backupPath, dbPath);
                if (wasInitialized) {
                    initializeDatabase(dbPath);
                }
                if (fs.existsSync(currentBackupPath)) {
                    fs.unlinkSync(currentBackupPath);
                }
                return { success: true };
            } catch (error) {
                if (fs.existsSync(currentBackupPath)) {
                    fs.copyFileSync(currentBackupPath, dbPath);
                    fs.unlinkSync(currentBackupPath);
                }
                throw error;
            }
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('db:backup:list', async () => {
        try {
            if (!fs.existsSync(backupDir)) return [];
            const files = fs.readdirSync(backupDir);
            return files
                .filter(file => file.startsWith('pos-backup-') && file.endsWith('.db'))
                .map(file => path.join(backupDir, file))
                .sort()
                .reverse();
        } catch (error) {
            return [];
        }
    });
}
