# Local Supabase Deployment Guide — AIMS Kochi

This guide is for the AIMS IT department to deploy a self-hosted instance of Supabase on the campus local server. This replaces the cloud-based Supabase tier, keeping all lab data internally secure and eliminating external dependencies.

## 1. System Requirements

The server should be running Linux (Ubuntu Server 22.04 LTS recommended) with the following minimum specifications:

| Resource | Minimum | Recommended |
|---|---|---|
| RAM | 4 GB | 8 GB |
| CPU | 2 Cores | 4 Cores |
| Disk | 20 GB | 50 GB |
| OS | Ubuntu 22.04 | Ubuntu 22.04 LTS |

**Required software:**
- Docker Engine (v24+) and Docker Compose (v2) — [Install Guide](https://docs.docker.com/engine/install/ubuntu/)

> ⚠️ **Important:** Ask your network administrator to assign a **static IP address** to this server. The mobile app is configured with the server's IP — if it changes, the app will stop working.

---

## 2. Setting Up the Supabase Instance

The Supabase Docker configuration is in the `supabase-local/` directory of the repository.

### Step 1 — Copy files to the server

Transfer the `supabase-local/` directory to your server (via `git clone`).

### Step 2 — Generate secure credentials

```bash
cd supabase-local
sh ./utils/generate-keys.sh
```

This prints your `POSTGRES_PASSWORD`, `JWT_SECRET`, `ANON_KEY`, and `SERVICE_ROLE_KEY`. **Save this output** — you'll need it in the next step.

### Step 3 — Configure the environment file

```bash
cp .env.example .env
nano .env
```

Update the following values with what was generated above:

```env
POSTGRES_PASSWORD=<generated-value>
JWT_SECRET=<generated-value>
ANON_KEY=<generated-value>
SERVICE_ROLE_KEY=<generated-value>
DASHBOARD_USERNAME=supabase
DASHBOARD_PASSWORD=<set-a-strong-password>
```

Also update the URL variables to match your server's static IP:

```env
SUPABASE_PUBLIC_URL=http://<SERVER_IP>:8000
API_EXTERNAL_URL=http://<SERVER_IP>:8000
```

### Step 4 — Start all services

```bash
docker compose up -d
```

Wait about 30 seconds for all containers to become healthy, then verify:

```bash
docker compose ps
```

All containers should show `healthy` or `running`. The services that start are:

- `supabase-db` — PostgreSQL database
- `supabase-auth` — Authentication API
- `supabase-rest` — Database REST API
- `supabase-storage` — File storage for colony images
- `supabase-kong` — API gateway (port 8000)
- `supabase-studio` — Management dashboard (port 3000)
- And 4 supporting services

### Stopping the stack

```bash
# Always use --remove-orphans to clean up properly
docker compose down --remove-orphans
```

---

## 3. Initializing the Database Schema

This step is required **only once** on a fresh installation.

1. Open a browser and go to the Studio dashboard: `http://<SERVER_IP>:3000`
2. Log in with the `DASHBOARD_USERNAME` and `DASHBOARD_PASSWORD` you set in the `.env` file.
3. In the left sidebar, click **SQL Editor**.
4. Click **New query**.
5. Open the `supabase-local/schema.sql` file, copy all its contents, and paste into the editor.
6. Click **Run**.

This creates the `analyses` table, row-level security policies, the `colony-images` storage bucket, and all bucket permissions.

---

## 4. Connecting the Mobile App

Once the server is running, update the app's `.env` file (in the root of the project) with the server's IP and the `ANON_KEY`:

```env
EXPO_PUBLIC_SUPABASE_URL=http://<SERVER_IP>:8000
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

> **Note:** Mobile devices running the app must be connected to the AIMS local Wi-Fi network to communicate with this server.

---

## 5. Maintenance

```bash
# View logs for a specific service
docker compose logs -f supabase-auth

# Restart a single service
docker compose restart supabase-auth

# Full reset — WARNING: destroys ALL data
./reset.sh
```

To back up the database:
```bash
docker exec supabase-db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql
```
