# Collapse Feature Documentation

**Purpose**: Consolidate all markdown files in a feature documentation directory into a single comprehensive README.md file.

## Requirements
- **Argument Required**: This command requires a feature name as an argument (e.g., `/colapse-docs api-integration`)
- If no argument is provided, stop execution and prompt the user for the feature name

## Execution Steps

1. **Validate Directory**
   - Check that `docs/feature-documentation/$ARGUMENTS` exists
   - If the directory doesn't exist, inform the user and list available feature directories
   - Stop execution if invalid

2. **Read and Analyze Documentation**
   - Read all `.md` files in `docs/feature-documentation/$ARGUMENTS`
   - Understand the feature's purpose, implementation, and key components
   - Prepare to answer questions about any aspect of the feature

3. **Consolidate Documentation**
   - Create a comprehensive `README.md` that includes:
     - Feature overview and purpose
     - Implementation details from all source files
     - Code examples and references
     - Any diagrams or technical specifications
   - Organize content logically with clear headings
   - Preserve all important information from the original files

4. **Clean Up**
   - Remove all other `.md` files in the directory (keeping only `README.md`)
   - Confirm successful consolidation with a summary of what was merged