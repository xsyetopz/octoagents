#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_INSTALL_DIR="$HOME/.config/opencode"

echo "OctoAgents Framework Installer"
echo

echo "Install location:"
echo "  1) Global (~/.config/opencode)"
echo "  2) Project (./.opencode)"
echo "  3) Custom path"
echo
read -r -p "Select (1-3): " choice
case "$choice" in
    1) INSTALL_DIR="$DEFAULT_INSTALL_DIR" ;;
    2) INSTALL_DIR="$(pwd)/.opencode" ;;
    3)
        read -r -p "Enter path: " custom_path
        if [[ -z "$custom_path" ]]; then
            INSTALL_DIR="$DEFAULT_INSTALL_DIR"
        else
            INSTALL_DIR="$custom_path"
        fi
        ;;
    *) INSTALL_DIR="$DEFAULT_INSTALL_DIR" ;;
esac

if [[ -z "$INSTALL_DIR" ]]; then
    echo "[ERROR] Invalid install directory. Defaulting to $DEFAULT_INSTALL_DIR"
    INSTALL_DIR="$DEFAULT_INSTALL_DIR"
fi

echo "[DEBUG] INSTALL_DIR is: $INSTALL_DIR"

echo "Installing to: $INSTALL_DIR"
echo

mkdir -p "$INSTALL_DIR/agents"
mkdir -p "$INSTALL_DIR/commands"
mkdir -p "$INSTALL_DIR/skills"
cp "$SCRIPT_DIR/templates/AGENTS.md" "$INSTALL_DIR/AGENTS.md"
cp "$SCRIPT_DIR/templates/commands/"*.md "$INSTALL_DIR/commands/" 2>/dev/null || true

for skillfile in "$SCRIPT_DIR/templates/skills/"*.md; do
    if [[ "$skillfile" != "$SCRIPT_DIR/templates/skills/generic"* ]]; then
        cp "$skillfile" "$INSTALL_DIR/skills/" 2>/dev/null || true
    fi
done

echo "Generating agents, commands, and skills..."
echo

bun run "$SCRIPT_DIR/src/generate.ts" "$INSTALL_DIR"

echo
echo "✓ Installation complete!"
echo
echo "Next steps:"
echo "  1. Restart OpenCode"
echo "  2. Run: opencode agents list"
echo "  3. Select 'orchestrate' agent"
