#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_INSTALL_DIR="$HOME/.config/opencode"

print_intro() {
    echo "OctoAgents Framework Installer"
    echo
}

select_install_dir() {
    echo "Install location:"
    echo "  1) Global (~/.config/opencode)"
    echo "  2) Project (./.opencode)"
    echo "  3) Custom path"
    echo
    read -r -p "Select (1-3): " choice
    case "$choice" in
        1) echo "$DEFAULT_INSTALL_DIR" ;;
        2) echo "$(pwd)/.opencode" ;;
        3)
            read -r -p "Enter path: " custom_path
            [[ -z "$custom_path" ]] && echo "$DEFAULT_INSTALL_DIR" || echo "$custom_path"
            ;;
        *) echo "$DEFAULT_INSTALL_DIR" ;;
    esac
}

setup_directories_and_files() {
    local install_dir="$1"
    mkdir -p "$install_dir/agents" "$install_dir/commands" "$install_dir/skills"
    cp "$SCRIPT_DIR/templates/AGENTS.md" "$install_dir/AGENTS.md"
    cp "$SCRIPT_DIR/templates/commands/"*.md "$install_dir/commands/" 2>/dev/null || true
    for skillfile in "$SCRIPT_DIR/templates/skills/"*.md; do
        [[ "$skillfile" != "$SCRIPT_DIR/templates/skills/generic"* ]] && cp "$skillfile" "$install_dir/skills/" 2>/dev/null || true
    done
}

generate_content() {
    local install_dir="$1"
    echo "Generating agents, commands, and skills..."
    echo
    bun run "$SCRIPT_DIR/src/generate.ts" "$install_dir"
}

print_next_steps() {
    echo
    echo "✓ Installation complete!"
    echo
    echo "Next steps:"
    echo "  1. Restart OpenCode"
    echo "  2. Run: opencode agents list"
    echo "  3. Select 'orchestrate' agent"
}

prompt_mcp_integrations() {
    echo "Enable MCP integrations?"
    echo "  1) Context7 (remote)"
    echo "  2) Octocode (local)"
    echo "  3) Peekaboo (local, vision)"
    echo
    read -r -p "Enable Context7 MCP? (y/N): " enable_ctx7
    read -r -p "Enable Octocode MCP? (y/N): " enable_octocode
    read -r -p "Enable Peekaboo MCP? (y/N): " enable_peekaboo

    CTX7_ENABLED=false
    OCTOCODE_ENABLED=false
    PEEKABOO_ENABLED=false
    ctx7_key=""
    github_token=""
    peekaboo_providers=""

    if [[ "$enable_ctx7" =~ ^[Yy] ]]; then
        CTX7_ENABLED=true
        read -r -p "Context7 API Key (optional, press Enter to skip): " ctx7_key
    fi
    if [[ "$enable_octocode" =~ ^[Yy] ]]; then
        OCTOCODE_ENABLED=true
        read -r -p "GitHub Token (required): " github_token
    fi
    if [[ "$enable_peekaboo" =~ ^[Yy] ]]; then
        PEEKABOO_ENABLED=true
        read -r -p "Peekaboo AI Providers (comma-separated, e.g. synthetic/hf:nvidia/Kimi-K2.5-NVFP4): " peekaboo_providers
    fi

    echo "$CTX7_ENABLED|$ctx7_key|$OCTOCODE_ENABLED|$github_token|$PEEKABOO_ENABLED|$peekaboo_providers"
}

write_env_file() {
    local install_dir="$1"
    local ctx7_enabled="$2"
    local ctx7_key="$3"
    local octocode_enabled="$4"
    local github_token="$5"
    local peekaboo_enabled="$6"
    local peekaboo_providers="$7"
    local env_path="$install_dir/.env"

    echo "Writing .env file to $env_path"
    {
        [[ "$ctx7_enabled" == true ]] && echo "CONTEXT7_API_KEY=${ctx7_key:-}" >> "$env_path"
        [[ "$octocode_enabled" == true ]] && echo "GITHUB_TOKEN=${github_token:-}" >> "$env_path"
        [[ "$peekaboo_enabled" == true ]] && echo "PEEKABOO_AI_PROVIDERS=${peekaboo_providers:-synthetic/hf:nvidia/Kimi-K2.5-NVFP4}" >> "$env_path"
    } 2>/dev/null
}

main() {
    print_intro
    INSTALL_DIR="$(select_install_dir)"
    [[ -z "$INSTALL_DIR" ]] && INSTALL_DIR="$DEFAULT_INSTALL_DIR"
    if [[ "$INSTALL_DIR" != "" ]]; then
        setup_directories_and_files "$INSTALL_DIR"
        generate_content "$INSTALL_DIR"
        print_next_steps
    fi

    MCP_OUTPUT="$(prompt_mcp_integrations)"
    IFS='|' read -r CTX7_ENABLED ctx7_key OCTOCODE_ENABLED github_token PEEKABOO_ENABLED peekaboo_providers <<< "$MCP_OUTPUT"
    write_env_file "$INSTALL_DIR" "$CTX7_ENABLED" "$ctx7_key" "$OCTOCODE_ENABLED" "$github_token" "$PEEKABOO_ENABLED" "$peekaboo_providers"
}

main "$@"
