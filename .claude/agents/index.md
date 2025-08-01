# Claude Development Agents for DexTrends

This directory contains specialized agent definitions that enhance Claude's capabilities for specific development tasks.

## Available Agents

### Development Agents

#### 1. todo-resolver
**Purpose**: Find and fix TODO/FIXME comments  
**Trigger**: "Find TODOs", "Fix technical debt", "Clean up code comments"  
**Capabilities**:
- Scans entire codebase for TODO patterns
- Prioritizes by file importance
- Implements fixes for high-priority items
- Generates comprehensive reports

#### 2. doc-sync
**Purpose**: Keep documentation synchronized with code  
**Trigger**: "Update docs", "Sync documentation", "Validate CLAUDE.md"  
**Capabilities**:
- Updates CLAUDE.md automatically
- Validates documentation accuracy
- Generates component/API docs
- Tracks pattern changes

#### 3. dep-security
**Purpose**: Manage dependency security and updates  
**Trigger**: "Check security", "Update dependencies", "Audit packages"  
**Capabilities**:
- Identifies vulnerabilities
- Plans safe updates
- Tests compatibility
- Generates security reports

#### 4. work-verifier
**Purpose**: Verify completed work matches original requirements  
**Trigger**: "Verify work", "Check if done", "Validate completion"  
**Capabilities**:
- Extracts requirements from original prompts
- Creates verification checklists
- Identifies incomplete or sidetracked work
- Provides pass/fail assessment with gaps

#### 5. duplicate-checker
**Purpose**: Prevent code duplication and ensure reuse of existing functionality  
**Trigger**: "Check for duplicates", "Before creating new", "Consolidate code"  
**Capabilities**:
- Searches for existing utilities/components before creating new
- Identifies similar functionality across codebase
- Suggests reusing or extending existing code
- Ensures old code removal when replacing

### Design & UX Agents

#### 6. ui-designer
**Purpose**: Create components following DexTrends design language  
**Trigger**: "Design this component", "Make this prettier", "Apply design system"  
**Capabilities**:
- Understands glass morphism, circular elements, gradients
- Follows pastel color palette and rounded aesthetics
- Uses existing design system components
- Maintains visual hierarchy and consistency

#### 7. ux-enhancer  
**Purpose**: Add smooth interactions and delightful animations  
**Trigger**: "Improve UX", "Add animations", "Make this interactive"  
**Capabilities**:
- Implements spring-based, organic animations
- Creates smooth hover and tap states
- Adds appropriate loading and feedback states
- Ensures mobile-optimized touch interactions

## How Claude Uses These Agents

When you ask Claude to perform tasks that match an agent's specialty, it will:

1. **Recognize the task type** from your request
2. **Load the appropriate agent** definition
3. **Follow the agent's workflow** for optimal results
4. **Use agent-specific prompts** for better accuracy

## Example Usage

```
User: "Find all the TODOs and fix the critical ones"
Claude: [Activates todo-resolver agent]
        - Scans with specialized patterns
        - Prioritizes based on location
        - Implements fixes using project conventions

User: "Is our documentation up to date?"
Claude: [Activates doc-sync agent]
        - Compares code with docs
        - Updates outdated sections
        - Validates all examples

User: "Check for security vulnerabilities"
Claude: [Activates dep-security agent]
        - Runs security audit
        - Identifies safe updates
        - Tests compatibility
```

## Creating New Agents

To add a new specialized agent:

1. Create `agent-name.md` in this directory
2. Define:
   - Capabilities
   - Workflow steps
   - Output format
   - Special instructions
3. Add to this index

## Agent Standards

All agents should:
- Follow project conventions (error handling, imports)
- Use existing utilities when available
- Run validation (lint, typecheck, tests)
- Generate actionable output
- Track progress and changes