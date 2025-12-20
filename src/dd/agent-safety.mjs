/**
 * Agent Safety Layer
 * 
 * Provides optional checkpoint/rollback mechanisms for AI agents
 * making significant changes. This is a LIBRARY - it only adds
 * overhead when explicitly invoked for major operations.
 * 
 * Constitutional Invariants Enforced:
 * 1. No destructive operation without available rollback path
 * 2. Every mutation must be reversible or auditable
 * 3. Partial failures must not corrupt state
 */

import { execSync, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHECKPOINT_PREFIX = "agent-checkpoint-";
const LOG_FILE = ".dd/agent-safety-log.json";

/**
 * Check if git is available and we're in a repo
 */
function isGitAvailable() {
  try {
    execFileSync("git", ["rev-parse", "--git-dir"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if there are uncommitted changes to stash
 */
function hasUncommittedChanges() {
  try {
    const status = execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" });
    return status.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Create a checkpoint before a major operation
 * 
 * @param {string} description - Human-readable description of the operation
 * @returns {{ id: string, created: boolean, message: string }}
 */
export function createCheckpoint(description) {
  const id = `${CHECKPOINT_PREFIX}${Date.now()}`;
  
  if (!isGitAvailable()) {
    return { 
      id, 
      created: false, 
      message: "Git not available - checkpoint skipped" 
    };
  }

  if (!hasUncommittedChanges()) {
    return { 
      id, 
      created: false, 
      message: "No uncommitted changes to checkpoint" 
    };
  }

  try {
    // Create stash with descriptive message
    const stashMessage = `${id}: ${description}`;
    execFileSync("git", ["stash", "push", "-m", stashMessage], { stdio: "ignore" });
    
    // Log the checkpoint
    logCheckpoint(id, description, "created");
    
    return { 
      id, 
      created: true, 
      message: `Checkpoint created: ${id}` 
    };
  } catch (error) {
    return { 
      id, 
      created: false, 
      message: `Failed to create checkpoint: ${error.message}` 
    };
  }
}

/**
 * Restore from a checkpoint
 * 
 * @param {string} checkpointId - The checkpoint ID to restore
 * @returns {{ restored: boolean, message: string }}
 */
export function restoreCheckpoint(checkpointId) {
  if (!isGitAvailable()) {
    return { restored: false, message: "Git not available" };
  }

  try {
    // Find the stash with this checkpoint ID
    const stashList = execFileSync("git", ["stash", "list"], { encoding: "utf8" });
    const lines = stashList.split("\n");
    
    let stashRef = null;
    for (const line of lines) {
      if (line.includes(checkpointId)) {
        // Extract stash reference (e.g., "stash@{0}")
        const match = line.match(/^(stash@\{\d+\})/);
        if (match) {
          stashRef = match[1];
          break;
        }
      }
    }

    if (!stashRef) {
      return { restored: false, message: `Checkpoint not found: ${checkpointId}` };
    }

    // Pop the stash to restore
    execFileSync("git", ["stash", "pop", stashRef], { stdio: "inherit" });
    
    // Log the restoration
    logCheckpoint(checkpointId, "restored", "restored");
    
    return { restored: true, message: `Restored from checkpoint: ${checkpointId}` };
  } catch (error) {
    return { restored: false, message: `Failed to restore: ${error.message}` };
  }
}

/**
 * List all agent checkpoints
 * 
 * @returns {Array<{ id: string, description: string, stashRef: string }>}
 */
export function listCheckpoints() {
  if (!isGitAvailable()) {
    return [];
  }

  try {
    const stashList = execFileSync("git", ["stash", "list"], { encoding: "utf8" });
    const lines = stashList.split("\n").filter(Boolean);
    
    const checkpoints = [];
    for (const line of lines) {
      if (line.includes(CHECKPOINT_PREFIX)) {
        const refMatch = line.match(/^(stash@\{\d+\})/);
        const idMatch = line.match(new RegExp(`(${CHECKPOINT_PREFIX}\\d+)`));
        const descMatch = line.match(new RegExp(`${CHECKPOINT_PREFIX}\\d+: (.+)$`));
        
        if (refMatch && idMatch) {
          checkpoints.push({
            stashRef: refMatch[1],
            id: idMatch[1],
            description: descMatch ? descMatch[1] : "No description",
          });
        }
      }
    }
    
    return checkpoints;
  } catch {
    return [];
  }
}

/**
 * Clean up old checkpoints
 * 
 * @param {number} keepLast - Number of recent checkpoints to keep
 * @returns {{ removed: number, kept: number }}
 */
export function cleanupCheckpoints(keepLast = 5) {
  const checkpoints = listCheckpoints();
  
  if (checkpoints.length <= keepLast) {
    return { removed: 0, kept: checkpoints.length };
  }

  // Remove oldest checkpoints (they have higher stash indices)
  const toRemove = checkpoints.slice(keepLast);
  let removed = 0;

  // Remove from highest index first to avoid shifting
  for (const checkpoint of toRemove.reverse()) {
    try {
      execFileSync("git", ["stash", "drop", checkpoint.stashRef], { stdio: "ignore" });
      removed++;
    } catch {
      // Ignore errors - stash might have been manually removed
    }
  }

  return { removed, kept: keepLast };
}

/**
 * Wrap an async operation with automatic checkpoint/rollback
 * 
 * USE THIS FOR MAJOR CHANGES ONLY - adds ~200ms overhead
 * 
 * @param {Function} operation - Async function to execute
 * @param {Object} options - Options
 * @param {string} options.description - Description of the operation
 * @param {string[]} [options.files] - Files that will be affected
 * @returns {Promise<{ success: boolean, result?: any, error?: Error, checkpointId?: string }>}
 */
export async function withSafetyCheckpoint(operation, options = {}) {
  const description = options.description || "Unnamed operation";
  
  // Create checkpoint before operation
  const checkpoint = createCheckpoint(description);
  
  try {
    // Execute the operation
    const result = await operation();
    
    // If successful and checkpoint was created, we can optionally drop it
    // For now, we keep it as an audit trail
    logCheckpoint(checkpoint.id, description, "completed");
    
    return { 
      success: true, 
      result, 
      checkpointId: checkpoint.id,
      checkpointCreated: checkpoint.created,
    };
  } catch (error) {
    // Operation failed - offer rollback if checkpoint exists
    logCheckpoint(checkpoint.id, description, "failed", error.message);
    
    if (checkpoint.created) {
      console.error(`\n❌ Operation failed: ${error.message}`);
      console.error(`💾 Checkpoint available: ${checkpoint.id}`);
      console.error(`   To restore: framework checkpoint restore ${checkpoint.id}`);
      console.error(`   Or manually: git stash pop\n`);
    }
    
    return { 
      success: false, 
      error, 
      checkpointId: checkpoint.id,
      checkpointCreated: checkpoint.created,
    };
  }
}

/**
 * Log checkpoint activity for audit trail
 */
function logCheckpoint(id, description, action, errorMessage = null) {
  try {
    const ddDir = ".dd";
    if (!fs.existsSync(ddDir)) {
      fs.mkdirSync(ddDir, { recursive: true });
    }

    const logPath = path.join(ddDir, "agent-safety-log.json");
    let log = [];
    
    if (fs.existsSync(logPath)) {
      try {
        log = JSON.parse(fs.readFileSync(logPath, "utf8"));
      } catch {
        log = [];
      }
    }

    log.push({
      timestamp: new Date().toISOString(),
      checkpointId: id,
      description,
      action,
      error: errorMessage,
    });

    // Keep only last 100 entries
    if (log.length > 100) {
      log = log.slice(-100);
    }

    fs.writeFileSync(logPath, JSON.stringify(log, null, 2) + "\n");
  } catch {
    // Silently ignore logging failures - don't break the operation
  }
}

/**
 * Get the safety log for audit purposes
 * 
 * @returns {Array}
 */
export function getAuditLog() {
  try {
    const logPath = ".dd/agent-safety-log.json";
    if (fs.existsSync(logPath)) {
      return JSON.parse(fs.readFileSync(logPath, "utf8"));
    }
  } catch {
    // Ignore
  }
  return [];
}

