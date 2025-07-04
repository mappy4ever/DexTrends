# Claude Code Hooks

This directory contains hooks that run before and after Claude Code operations.

## Available Hooks

- **pre-bash.sh** - Runs before executing bash commands
- **post-bash.sh** - Runs after executing bash commands
- **pre-write.sh** - Runs before writing files
- **post-write.sh** - Runs after writing files
- **pre-edit.sh** - Runs before editing files
- **post-edit.sh** - Runs after editing files (if needed)

## Hook Arguments

### pre-bash.sh / post-bash.sh
- `$1` - The command being executed
- `$2` - Exit code (post-bash only)

### pre-write.sh / post-write.sh
- `$1` - File path
- `$2` - File content (pre-write only)

### pre-edit.sh
- `$1` - File path
- `$2` - Old content
- `$3` - New content

## Exit Codes

- Exit 0: Allow the operation to proceed
- Exit 1: Block the operation (pre-hooks only)

## Making Hooks Executable

```bash
chmod +x .claude-code/hooks/*.sh
```

## Examples

The provided hooks include examples of:
- Blocking dangerous commands
- Warning about sensitive operations
- Auto-formatting code
- Creating backups
- Validating file content

Customize these hooks based on your project needs!