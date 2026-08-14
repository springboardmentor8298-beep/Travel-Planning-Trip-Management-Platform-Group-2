#!/bin/bash
# TripNest Oracle VM Setup Script

echo "Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

echo "Installing Docker & Docker Compose..."
# Remove old docker if exists
sudo apt-get remove -y docker docker-engine docker.io containerd runc
# Install dependencies
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

# Add Docker’s official GPG key
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable Docker without sudo (optional, requires re-login)
sudo usermod -aG docker ubuntu

echo "=========================================================="
echo "Setup Complete!"
echo "Next Steps:"
echo "1. Log out of the VM and log back in (so the 'ubuntu' user can run docker without sudo)"
echo "2. Clone your TripNest repository to the VM:"
echo "   git clone <YOUR_REPO_URL>"
echo "3. cd into the TripNest directory."
echo "4. Create a .env file: echo 'DB_PASSWORD=your_secure_password' > .env"
echo "5. Run: docker compose -f docker-compose.prod.yml up -d --build"
echo "=========================================================="
