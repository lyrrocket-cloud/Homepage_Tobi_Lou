#!/bin/bash
set -e

echo "📦 Installing dependencies..."
pnpm install

echo "🔨 Building production..."
pnpm run build

echo "✅ Build complete!"
