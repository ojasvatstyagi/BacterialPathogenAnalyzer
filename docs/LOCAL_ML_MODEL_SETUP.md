# Local Server Deployment Guide (AIMS Kochi)

This document outlines the complete process to deploy the Bacterial Pathogen Analyzer ML backend to your local campus server. 

## 1. Prerequisites (For the IT Department)

Before starting, ensure the local server meets these requirements:
- **OS**: Linux (Ubuntu Server 22.04 LTS or similar Debian-based recommended).
- **RAM**: Minimum 8GB (Running Supabase Docker alongside the ML Model requires sufficient memory).
- **Network**: Port **5000** must be open on the local firewall to allow the mobile devices to reach the API.
- **Tools**: Ensure `python3`, `pip`, `venv`, and `git` are installed.

## 2. Server Configuration

Connect to the server via SSH (e.g., `ssh admin@<LOCAL_SERVER_IP>`) and run the following setup commands:

### A. System Updates & Tools

```bash
sudo apt update && sudo apt install -y python3-pip python3-venv git
```

### B. Application Setup

Clone the repository to the server. (If the repo is private, use a Personal Access Token or generate an SSH key on the server).

```bash
# Clone Repository
git clone https://github.com/ojasvatstyagi/BacterialPathogenAnalyzer.git
cd BacterialPathogenAnalyzer/server/backend

# Create and Activate Virtual Environment
python3 -m venv venv
source venv/bin/activate
```

### C. Installation

Install the machine learning dependencies. 

```bash
# Install TensorFlow and other dependencies
pip install tensorflow
pip install -r requirements.txt
```

## 3. Persistence (Systemd Service)

To keep the ML model server running 24/7 in the background and ensure it automatically restarts on server reboots:

1.  **Create Service File**: 
    ```bash
    sudo nano /etc/systemd/system/bacterial_app.service
    ```
    
2.  **Add Configuration Content** (Update `User` and `WorkingDirectory` paths if your username is not `ubuntu`):

    ```ini
    [Unit]
    Description=Gunicorn instance serving ML Flask app
    After=network.target

    [Service]
    User=ubuntu
    Group=www-data
    WorkingDirectory=/home/ubuntu/BacterialPathogenAnalyzer/server/backend
    Environment="PATH=/home/ubuntu/BacterialPathogenAnalyzer/server/backend/venv/bin"
    ExecStart=/home/ubuntu/BacterialPathogenAnalyzer/server/backend/venv/bin/gunicorn --workers 2 --bind 0.0.0.0:5000 --timeout 120 app:app

    [Install]
    WantedBy=multi-user.target
    ```

3.  **Enable & Start the Service**:
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable bacterial_app
    sudo systemctl start bacterial_app
    ```

## 4. Connecting the Mobile App

Once the ML server is running, update the React Native frontend to point to this new local endpoint.

In your local development `.env` (and subsequently your EAS Secrets for building), update the API URL to point to the server's local IP:

```env
EXPO_PUBLIC_API_URL=http://<LOCAL_SERVER_IP>:5000
```

*Note: Mobile devices must be connected to the campus local network for the application to reach the server.*

## 5. Maintenance Commands

If you need to push a model update, check logs, or view errors, you can use these commands on the server:

- **View Live Error Logs**: `sudo journalctl -u bacterial_app -f`
- **Restart the Server manually**: `sudo systemctl restart bacterial_app`
- **Check Server Status**: `sudo systemctl status bacterial_app`
- **Update Code**:
  ```bash
  cd ~/BacterialPathogenAnalyzer/server/backend
  git pull
  source venv/bin/activate
  pip install -r requirements.txt # only if dependencies changed
  sudo systemctl restart bacterial_app
  ```
