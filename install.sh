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

generate_agent() {
    local name=$1
    local description=$2
    local mode=$3
    local model=$4
    local temperature=$5
    local top_p=$6
    local steps=$7
    local color=$8
    local template_path="$SCRIPT_DIR/templates/agents/${name}.md"
    local output_path="$INSTALL_DIR/agents/${name}.md"

    if [[ ! -f "$template_path" ]]; then
        echo "Warning: Template not found for $name, skipping..."
        return
    fi

    sed -e "s|{{description}}|$description|g" \
        -e "s|{{mode}}|$mode|g" \
        -e "s|{{model}}|$model|g" \
        -e "s|{{temperature}}|$temperature|g" \
        -e "s|{{top_p}}|$top_p|g" \
        -e "s|{{steps}}|$steps|g" \
        -e "s|{{color}}|$color|g" \
        "$template_path" > "$output_path"

    if [[ -z "$top_p" ]]; then
        sed -i.bak '/^top_p:/d' "$output_path" && rm "${output_path}.bak"
    fi

    echo "Created: $output_path"
}

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

echo "Generating agents..."
echo

bun run "$SCRIPT_DIR/src/generate.ts" "$INSTALL_DIR"

echo
echo "✓ Installation complete!"
echo
echo "Next steps:"
echo "  1. Restart OpenCode"
echo "  2. Run: opencode agents list"
echo "  3. Select 'orchestrate' agent"
