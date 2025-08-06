# Base image
FROM node:21-slim

# Set working directory early
WORKDIR /home/user

# Install essential tools
RUN apt-get update && \
    apt-get install -y curl git bash && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy helper script
COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

# Create the Next.js app directly in current dir
RUN npx --yes create-next-app@15.3.4 . --yes

# Install shadcn UI components
RUN npx --yes shadcn@2.6.3 init --yes -b neutral --force && \
    npx --yes shadcn@2.6.3 add --all --yes
