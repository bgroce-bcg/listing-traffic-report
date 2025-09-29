Create git worktrees

Usage: `/worktree <feature-name> [count]`

## Examples
- `/worktree homepage` - Creates single worktree
- `/worktree homepage 3` - Creates 3 numbered worktrees for design options

## Implementation

```bash
#!/bin/bash

worktree_command() {
    local feature_name="$1"
    local count="$2"
    
    # Validate feature name is provided
    if [ -z "$feature_name" ]; then
        echo "Error: Feature name is required"
        echo "Usage: /worktree <feature-name> [count]"
        return 1
    fi
    
    # Ensure .worktrees directory exists
    mkdir -p .worktrees
    
    # If no count provided, create single worktree
    if [ -z "$count" ]; then
        local worktree_path=".worktrees/$feature_name"
        
        # Check if worktree directory already exists
        if [ -d "$worktree_path" ]; then
            echo "Error: Worktree directory '$worktree_path' already exists"
            return 1
        fi
        
        # Create the worktree
        echo "Creating worktree: $worktree_path"
        echo "Branch: $feature_name"
        
        git worktree add -b "$feature_name" "$worktree_path"
        
        if [ $? -eq 0 ]; then
            echo "✅ Worktree created successfully!"
            echo "📁 Path: $worktree_path"
            echo "🌿 Branch: $feature_name"
            echo ""
            echo "To switch to this worktree:"
            echo "cd $worktree_path"
        else
            echo "❌ Failed to create worktree"
            return 1
        fi
    else
        # Create multiple numbered worktrees for design exploration
        echo "🎨 Creating $count design worktrees for '$feature_name'..."
        echo ""
        
        local created_count=0
        local failed_count=0
        
        for ((i=1; i<=count; i++)); do
            local branch_name="${feature_name}-${i}"
            local dir_name="${feature_name}-${i}"
            local worktree_path=".worktrees/$dir_name"
            
            # Check if worktree directory already exists
            if [ -d "$worktree_path" ]; then
                echo "⚠️  Skipping $worktree_path (already exists)"
                ((failed_count++))
                continue
            fi
            
            # Create the worktree
            echo "Creating worktree $i/$count: $worktree_path"
            
            git worktree add -b "$branch_name" "$worktree_path"
            
            if [ $? -eq 0 ]; then
                echo "✅ Created: $worktree_path (branch: $branch_name)"
                ((created_count++))
            else
                echo "❌ Failed to create: $worktree_path"
                ((failed_count++))
            fi
            echo ""
        done
        
        # Summary
        echo "📊 Summary:"
        echo "✅ Created: $created_count worktrees"
        if [ $failed_count -gt 0 ]; then
            echo "❌ Failed/Skipped: $failed_count worktrees"
        fi
        echo ""
        echo "💡 Your design options are ready in .worktrees/"
        echo "🔄 Switch between them with: cd .worktrees/$feature_name-[1-$count]"
    fi
}

# Execute the command
worktree_command "$@"
```