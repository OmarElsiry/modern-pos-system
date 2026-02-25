import { BackupService } from '../../../src/services/BackupService';
import { initializeDatabase, closeDatabase } from '../../../src/database/connection';
import * as fs from 'fs';
import * as path from 'path';

describe('BackupService', () => {
  const testDbPath = path.join(__dirname, 'test-backup.db');
  const testBackupDir = path.join(__dirname, 'test-backups');
  let backupService: BackupService;

  beforeEach(() => {
    // Clean up any existing test files
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    if (fs.existsSync(testBackupDir)) {
      fs.rmSync(testBackupDir, { recursive: true, force: true });
    }

    // Initialize test database
    initializeDatabase(testDbPath);
    backupService = new BackupService(testDbPath, testBackupDir);
  });

  afterEach(() => {
    // Clean up
    try {
      closeDatabase();
    } catch (error) {
      // Ignore errors if database is already closed
    }

    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    if (fs.existsSync(testBackupDir)) {
      fs.rmSync(testBackupDir, { recursive: true, force: true });
    }
  });

  describe('createBackup', () => {
    it('should create a backup file successfully', async () => {
      const result = await backupService.createBackup();

      expect(result.success).toBe(true);
      expect(result.backupPath).toBeDefined();
      expect(fs.existsSync(result.backupPath!)).toBe(true);
    });

    it('should create backup directory if it does not exist', async () => {
      expect(fs.existsSync(testBackupDir)).toBe(true);
    });

    it('should fail if database file does not exist', async () => {
      closeDatabase();
      fs.unlinkSync(testDbPath);

      const result = await backupService.createBackup();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database file not found');
    });

    it('should generate unique backup filenames with timestamps', async () => {
      const result1 = await backupService.createBackup();
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const result2 = await backupService.createBackup();

      expect(result1.backupPath).not.toBe(result2.backupPath);
    });
  });

  describe('restoreBackup', () => {
    it('should restore database from backup file', async () => {
      // Create a backup
      const backupResult = await backupService.createBackup();
      expect(backupResult.success).toBe(true);

      // Restore from backup
      const restoreResult = await backupService.restoreBackup(backupResult.backupPath!);

      expect(restoreResult.success).toBe(true);
    });

    it('should fail if backup file does not exist', async () => {
      const nonExistentPath = path.join(testBackupDir, 'non-existent.db');
      const result = await backupService.restoreBackup(nonExistentPath);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Backup file not found');
    });
  });

  describe('getAvailableBackups', () => {
    it('should return empty array when no backups exist', () => {
      const backups = backupService.getAvailableBackups();
      expect(backups).toEqual([]);
    });

    it('should return list of backup files', async () => {
      await backupService.createBackup();
      await backupService.createBackup();

      const backups = backupService.getAvailableBackups();

      expect(backups.length).toBe(2);
      expect(backups[0]).toContain('pos-backup-');
    });

    it('should return backups sorted by date (most recent first)', async () => {
      const result1 = await backupService.createBackup();
      await new Promise(resolve => setTimeout(resolve, 10));
      const result2 = await backupService.createBackup();

      const backups = backupService.getAvailableBackups();

      expect(backups[0]).toBe(result2.backupPath);
      expect(backups[1]).toBe(result1.backupPath);
    });
  });

  describe('getBackupDirectory', () => {
    it('should return the backup directory path', () => {
      const dir = backupService.getBackupDirectory();
      expect(dir).toBe(testBackupDir);
    });
  });

  describe('stopAutomaticBackup', () => {
    it('should stop scheduled backups without errors', () => {
      expect(() => backupService.stopAutomaticBackup()).not.toThrow();
    });
  });
});
