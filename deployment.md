# AWS EC2 Deployment Guide

This document outlines the complete process used to deploy the Bacterial Pathogen Analyzer backend to an AWS EC2 instance.

## 1. Infrastructure Setup (AWS Console)

1.  **Launch Instance**:
    - **Region**: ap-south-1 (Mumbai) [or your region]
    - **OS**: Ubuntu Server 22.04 LTS (HVM), SSD Volume Type.
    - **Instance Type**: `t2.micro` (Free Tier eligible, 1GB RAM).

2.  **Key Pair**:
    - Created a `.pem` key pair (e.g., `server-key.pem`).

3.  **Network Settings (Security Groups)**:
    - **SSH**: Port 22 (Source: Anywhere 0.0.0.0/0).
    - **API**: Custom TCP, Port **5000** (Source: Anywhere 0.0.0.0/0).
    - _Note: Port 5000 must be manually added; it is not open by default._

## 2. SSH Connection & Key Permissions (Windows Fix)

**Issue**: Windows file permissions often cause `Load key "server-key.pem": Permission denied` errors when using OpenSSH directly from Downloads.

**Solution (The Notepad Workaround)**:
Instead of fighting Windows ACLs, we used a fresh file in the `.ssh` directory which inherits correct permissions by default.

1.  Open the original `server-key.pem` in **Notepad**.
2.  Copy the entire content (starting with `-----BEGIN RSA PRIVATE KEY-----`).
3.  Open a terminal and navigate to your user's SSH folder:
    ```powershell
    cd C:\Users\Cipher\.ssh\
    ```
4.  Create a new file using Notepad:
    ```powershell
    notepad my_clean_key.pem
    ```
5.  **Paste** the key content into this new file, Save, and Close.
6.  **Connect** using this new, clean key:
    ```powershell
    ssh -i "C:\Users\Cipher\.ssh\my_clean_key.pem" ubuntu@<YOUR_AWS_PUBLIC_IP>
    ```

## 3. Server Configuration (Inside SSH)

Run these checks and commands to set up the environment.

### A. System Updates & Tools

```bash
sudo apt update && sudo apt install -y python3-pip python3-venv git
```

### B. Swap Memory (Critical for t2.micro)

The `t2.micro` only has 1GB RAM, which is insufficient for installing/running TensorFlow. We created a 1GB Swap file to prevent "No space left on device" and OOM crashes.

```bash
# Clean up any failed attempts first
sudo swapoff /swapfile
sudo rm /swapfile

# Create 1GB Swap (Optimized for 8GB Disk)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### C. Application Setup

```bash
# Clone Repository
git clone https://github.com/ojasvatstyagi/BacterialPathogenAnalyzer.git
cd BacterialPathogenAnalyzer/server/backend

# Virtual Environment
python3 -m venv venv
source venv/bin/activate
```

### D. Installation (Space-Saving Mode)

To avoid filling the disk, we installed packages without caching.

```bash
# Clean cache first
pip cache purge

# Install TensorFlow explicitly
pip install tensorflow --no-cache-dir

# Install other dependencies
pip install -r requirements.txt --no-cache-dir
```

## 4. Persistence (Systemd Service)

To keep the server running 24/7 in the background:

1.  **Create Service File**: `sudo nano /etc/systemd/system/bacterial_app.service`
2.  **Content**:

    ```ini
    [Unit]
    Description=Gunicorn instance serving Flask app
    After=network.target

    [Service]
    User=ubuntu
    Group=www-data
    WorkingDirectory=/home/ubuntu/BacterialPathogenAnalyzer/server/backend
    Environment="PATH=/home/ubuntu/BacterialPathogenAnalyzer/server/backend/venv/bin"
    ExecStart=/home/ubuntu/BacterialPathogenAnalyzer/server/backend/venv/bin/gunicorn --workers 1 --bind 0.0.0.0:5000 --timeout 120 app:app

    [Install]
    WantedBy=multi-user.target
    ```

3.  **Enable & Start**:
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable bacterial_app
    sudo systemctl start bacterial_app
    ```

## 5. Maintenance Commands

- **View Logs**: `sudo journalctl -u bacterial_app -f`
- **Restart Server**: `sudo systemctl restart bacterial_app`
- **Check Status**: `sudo systemctl status bacterial_app`
- **Update Code**:
  ```bash
  cd ~/BacterialPathogenAnalyzer/server/backend
  git pull
  sudo systemctl restart bacterial_app
  ```
