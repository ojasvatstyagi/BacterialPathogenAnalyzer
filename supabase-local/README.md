# Supabase Local — AIMS Kochi Deployment

This is the self-hosted Supabase Docker setup for the **Bacterial Pathogen Analyzer** running on the AIMS Kochi local network. It has been streamlined from the official Supabase Docker distribution to include only the services required for this application.

## Services Included

| Service | Container | Purpose |
|---|---|---|
| **Studio** | `supabase-studio` | Web dashboard for managing the database and storage |
| **Kong** | `supabase-kong` | API gateway — single entry point for all services (port 8000) |
| **Auth** | `supabase-auth` | Email/password-based user authentication (auto-confirm enabled) |
| **PostgREST** | `supabase-rest` | Auto-generated REST API from the PostgreSQL schema |
| **Realtime** | `realtime-dev.supabase-realtime` | Required by Kong — handles live DB event broadcasting |
| **Storage** | `supabase-storage` | File storage for colony plate images |
| **imgproxy** | `supabase-imgproxy` | Image resizing and transformation for stored images |
| **postgres-meta** | `supabase-meta` | REST API for managing Postgres (used by Studio) |
| **PostgreSQL** | `supabase-db` | The primary database |
| **Supavisor** | `supabase-pooler` | Required by Kong — Postgres connection pooler |

## Quick Start

### Prerequisites
- Docker Desktop (or Docker Engine + Docker Compose plugin)
- The app's `.env` file configured (see `.env.example`)

### First-Time Setup

1. **Copy and configure the environment file:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set at minimum:
   - `POSTGRES_PASSWORD` — a strong password
   - `JWT_SECRET` — a random 32+ character string
   - `ANON_KEY` / `SERVICE_ROLE_KEY` — generate with `sh ./utils/generate-keys.sh`

2. **Start all services:**
   ```bash
   docker compose up -d
   ```

3. **Verify all containers are healthy:**
   ```bash
   docker compose ps
   ```
   All containers should show `healthy` or `running`.

### Daily Usage

```bash
# Start
docker compose up -d

# Stop (--remove-orphans cleans up any stale containers)
docker compose down --remove-orphans

# View logs
docker compose logs -f

# Full reset (WARNING: destroys all data)
./reset.sh
```

## Accessing Services

| Service | URL | Credentials |
|---|---|---|
| **Studio Dashboard** | `http://<server-ip>:3000` | `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` from `.env` |
| **API Gateway** | `http://<server-ip>:8000` | Used by the mobile app |

## Utilities

| Script | Purpose |
|---|---|
| `utils/generate-keys.sh` | Generate `JWT_SECRET`, `ANON_KEY`, and `SERVICE_ROLE_KEY` |
| `utils/db-passwd.sh` | Change the Postgres password safely |
| `reset.sh` | Completely wipe all data and restart fresh |

## Data Persistence

All data is stored in Docker named volumes and persists across restarts:
- **Database**: `supabase_db-config` volume → PostgreSQL data
- **Colony Images**: `supabase_storage-data` volume → uploaded plate images

To back up data, use `docker volume` commands or `pg_dump` for the database.

## Important Notes

### Security
- Change all default passwords in `.env` before the first run.
- The API gateway (port 8000) and Studio (port 3000) should only be accessible within the AIMS local network — do not expose these ports to the internet.
- Regenerate `JWT_SECRET`, `ANON_KEY`, and `SERVICE_ROLE_KEY` using `utils/generate-keys.sh` for each fresh installation.

### IP Address
The mobile app's `.env` must point to this server's **static local IP address**. Ask the IT team to assign a static IP to this server to avoid reconfiguring the app every time the IP changes.
