#!/bin/bash
# Setup script for watch-inboxes
# Installs Homebrew and fswatch if needed, then runs the watch script

set -e

echo "🔧 Setting up inbox watcher..."
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "📦 Homebrew not found in PATH. Setting up..."
    echo ""

    # Check if homebrew already exists in /opt
    if [ -d "/opt/homebrew" ]; then
        echo "✓ Found Homebrew in /opt/homebrew"
        echo "  Adding to PATH..."
        echo ""

        # Add to PATH
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"

        echo "✓ Homebrew added to PATH"
        echo ""
    # Check if homebrew exists in Downloads
    elif [ -d "/Users/joseph.dawson/Downloads/homebrew" ]; then
        echo "✓ Found Homebrew in Downloads folder"
        echo "  Moving to /opt/homebrew (requires sudo password)..."
        echo ""

        sudo mv /Users/joseph.dawson/Downloads/homebrew /opt/homebrew
        sudo chown -R $(whoami) /opt/homebrew

        echo "✓ Homebrew moved to /opt/homebrew"
        echo ""

        # Add to PATH
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"

        echo "✓ Homebrew added to PATH"
        echo ""
    else
        echo "❌ Homebrew not found in /opt/homebrew or Downloads"
        echo ""
        echo "Please download Homebrew and place it in your Downloads folder, or install via:"
        echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
else
    echo "✓ Homebrew already installed: $(brew --version | head -1)"
    echo ""
fi

# Check if fswatch is installed
if ! command -v fswatch &> /dev/null; then
    echo "📦 Installing fswatch..."
    echo ""
    brew install fswatch
    echo "✓ fswatch installed"
    echo ""
else
    echo "✓ fswatch already installed: $(fswatch --version | head -1)"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup complete! Starting inbox watcher..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run the watch script
exec ./scripts/watch-inboxes.sh
