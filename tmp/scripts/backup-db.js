/**
 * MongoDB Backup Script
 *
 * This script creates a backup of your MongoDB database using mongodump.
 * It can be scheduled to run periodically using a cron job or Windows Task Scheduler.
 *
 * Requirements:
 * - MongoDB tools installed (mongodump)
 * - Proper environment variables set
 *
 * Usage:
 * - node backup-db.js
 */

require("dotenv").config({ path: "../.env" });
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

// Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const BACKUP_DIR = path.join(__dirname, "../backups");
const MAX_BACKUPS = 7; // Keep last 7 backups

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`Created backup directory: ${BACKUP_DIR}`);
}

// Create timestamp for backup folder name
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

// Extract database name from URI
const dbName = MONGODB_URI.split("/").pop().split("?")[0];

// Build mongodump command
const mongodumpCmd = `mongodump --uri="${MONGODB_URI}" --out="${backupPath}"`;

console.log(`Starting backup of database '${dbName}'...`);

// Execute mongodump
exec(mongodumpCmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`Backup failed: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`Backup stderr: ${stderr}`);
  }

  console.log(`Backup completed successfully to ${backupPath}`);

  // Clean up old backups
  cleanupOldBackups();
});

/**
 * Remove old backups, keeping only the most recent ones
 */
function cleanupOldBackups() {
  fs.readdir(BACKUP_DIR, (err, files) => {
    if (err) {
      console.error(`Error reading backup directory: ${err.message}`);
      return;
    }

    // Filter for backup folders and sort by creation time (oldest first)
    const backupFolders = files
      .filter((file) => file.startsWith("backup-"))
      .map((file) => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).birthtime,
      }))
      .sort((a, b) => a.time - b.time);

    // If we have more backups than our limit, remove the oldest ones
    if (backupFolders.length > MAX_BACKUPS) {
      const foldersToDelete = backupFolders.slice(
        0,
        backupFolders.length - MAX_BACKUPS
      );

      foldersToDelete.forEach((folder) => {
        try {
          // Recursively remove the directory
          fs.rmSync(folder.path, { recursive: true, force: true });
          console.log(`Removed old backup: ${folder.name}`);
        } catch (err) {
          console.error(
            `Error removing old backup ${folder.name}: ${err.message}`
          );
        }
      });
    }
  });
}
