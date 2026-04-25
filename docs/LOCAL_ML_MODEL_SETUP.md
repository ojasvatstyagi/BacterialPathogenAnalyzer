# Local ML Model Server Deployment Guide — AIMS Kochi

This guide covers deploying the Bacterial Pathogen Analyzer ML backend (Flask/Python) to the AIMS campus local server so the mobile app can perform colony image analysis on-premise.

## 1. Prerequisites

Before starting, ensure the local server meets these requirements:

| Resource | Minimum | Recommended |
|---|---|---|
| RAM | 8 GB | 16 GB |
| CPU | 4 Cores | 8 Cores |
| Disk | 20 GB | 50 GB |
| OS | Ubuntu 22.04 | Ubuntu 22.04 LTS |

**Required software** (install if not present):
```bash
sudo apt update && sudo apt install -y python3 python3-pip python3-venv git
```

**Network:** Port **5000** must be accessible on the local network so mobile devices can reach the API. Confirm this with your network administrator.

---

## 2. Application Setup

### Step 1 — Get the code onto the server

If the server has internet access, clone the repository:
```bash
git clone https://github.com/ojasvatstyagi/BacterialPathogenAnalyzer.git
```

Otherwise, copy the project folder from a USB drive or internal file share.

### Step 2 — Navigate to the backend directory

```bash
cd BacterialPathogenAnalyzer/server/backend
```

### Step 3 — Create and activate a Python virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 4 — Install dependencies

```bash
pip install -r requirements.txt
```

> ⚠️ TensorFlow (used by the ML model) is large and may take several minutes to download. Ensure the server has a stable internet connection for this step.

### Step 5 — Verify it runs

```bash
python app.py
```

You should see output like:
```
 * Running on http://0.0.0.0:5000
```

Press `Ctrl+C` to stop — the next section sets it up to run permanently.

---

## 3. Running as a System Service (Permanent / Auto-start)

To keep the ML server running 24/7 and auto-restart on reboot:

### Step 1 — Create the service file

```bash
sudo nano /etc/systemd/system/bacterial_app.service
```

### Step 2 — Paste the following configuration

> ⚠️ Replace `ubuntu` with the actual Linux username on your server, and update the path if you cloned the repo to a different location.

```ini
[Unit]
Description=Bacterial Pathogen Analyzer ML Backend
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/BacterialPathogenAnalyzer/server/backend
Environment="PATH=/home/ubuntu/BacterialPathogenAnalyzer/server/backend/venv/bin"
ExecStart=/home/ubuntu/BacterialPathogenAnalyzer/server/backend/venv/bin/gunicorn --workers 2 --bind 0.0.0.0:5000 --timeout 120 app:app
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### Step 3 — Enable and start the service

```bash
sudo systemctl daemon-reload
sudo systemctl enable bacterial_app
sudo systemctl start bacterial_app
```

### Step 4 — Verify the service is running

```bash
sudo systemctl status bacterial_app
```

You should see `Active: active (running)`. You can also test the API directly:
```bash
curl http://localhost:5000/health
```

---

## 4. Connecting the Mobile App

Update the app's `.env` file in the root of the project:

```env
EXPO_PUBLIC_API_URL=http://<SERVER_IP>:5000
```

> **Note:** Mobile devices must be connected to the AIMS local Wi-Fi network for the application to reach this server. Ask the IT team to assign a **static IP** to this server so the address never changes.

---

## 5. Maintenance Commands

| Task | Command |
|---|---|
| View live logs | `sudo journalctl -u bacterial_app -f` |
| Check service status | `sudo systemctl status bacterial_app` |
| Restart the server | `sudo systemctl restart bacterial_app` |
| Stop the server | `sudo systemctl stop bacterial_app` |

### Updating the ML model or code

```bash
cd ~/BacterialPathogenAnalyzer/server/backend
git pull
source venv/bin/activate
pip install -r requirements.txt   # only if dependencies changed
sudo systemctl restart bacterial_app
```
