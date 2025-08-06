cat > compile_page.sh << 'EOF'
#!/bin/bash

# This script pre-builds the Next.js app during Docker build
# so that the first startup is faster and pages are precompiled.

echo "Building Next.js app..."

cd /home/user || exit 1

# Run the Next.js production build
npx next build

echo "Build complete."
EOF
