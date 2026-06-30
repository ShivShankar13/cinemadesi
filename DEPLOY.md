# Deploying the CinemaDesi backend to a VPS

End-to-end: GitHub → GHCR → your VPS via SSH on every push to `main`.

```
┌──────────┐  push  ┌──────────────┐  build/push  ┌──────┐  pull+up   ┌─────┐
│ your laptop ├──────▶│ GitHub Actions ├──────────▶ │ GHCR ├──────────▶ │ VPS │
└──────────┘        └──────────────┘              └──────┘            └─────┘
```

You'll do this once. After that, every `git push origin main` to backend files redeploys automatically.

---

## 0. Prereqs

- A VPS (Hetzner, DigitalOcean, Contabo, etc.) running **Ubuntu 22.04+** with SSH access
- A domain (optional but recommended — needed for HTTPS later)
- GitHub repo for this project pushed to your account

---

## 1. Bootstrap the VPS (~5 min, one-time)

SSH into your VPS as root (or a sudoer):

```bash
ssh root@<vps-ip>
```

### 1a. Create a deploy user (don't deploy as root)

```bash
adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

### 1b. Install Docker

```bash
# Official Docker convenience script
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy
```

Log out and back in as `deploy`:

```bash
exit
ssh deploy@<vps-ip>
```

Verify:
```bash
docker --version
docker compose version
```

### 1c. Create the app directory + env file

```bash
sudo mkdir -p /opt/cinemadesi
sudo chown deploy:deploy /opt/cinemadesi
cd /opt/cinemadesi
```

Create `/opt/cinemadesi/.env` and paste in the values from `deploy/.env.example`:

```bash
nano .env
```

Fill in real values for every key. Save and exit (Ctrl+O, Enter, Ctrl+X).

Lock it down:
```bash
chmod 600 .env
```

### 1d. Open firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 8080/tcp     # remove this once Caddy/Nginx fronts the API
sudo ufw enable
```

---

## 2. Set up the SSH key GitHub will use

On **your laptop**:

```bash
# A new key, just for CI — don't reuse your personal one
ssh-keygen -t ed25519 -C "github-actions-cinemadesi" -f ~/.ssh/cinemadesi_deploy -N ""
```

This makes two files:
- `~/.ssh/cinemadesi_deploy`        — **private**, goes into GitHub secrets
- `~/.ssh/cinemadesi_deploy.pub`    — **public**, install on the VPS

Install the public key on the VPS:

```bash
ssh-copy-id -i ~/.ssh/cinemadesi_deploy.pub deploy@<vps-ip>
```

Test it works without password:
```bash
ssh -i ~/.ssh/cinemadesi_deploy deploy@<vps-ip> 'echo ok'
# → ok
```

Print the private key (you'll copy this into a GitHub secret):
```bash
cat ~/.ssh/cinemadesi_deploy
```

Copy the whole output including the `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----` lines.

---

## 3. Create a GHCR personal access token

GitHub Container Registry needs a token for the VPS to pull images.

1. Go to https://github.com/settings/tokens/new
2. Note: `cinemadesi GHCR pull`
3. Expiration: 1 year (set a calendar reminder to rotate)
4. Scopes: only `read:packages`
5. Generate → copy the `ghp_…` token

If you want your image to be **private**, that's the default for GHCR. To make it public:
- After your first successful push (step 5 below), go to https://github.com/users/<your-username>/packages/container/cinemadesi-api → Package settings → Change visibility → Public.
- Public means anyone can pull but only you can push — fine for portfolio projects.

---

## 4. Add GitHub Secrets

Go to your repo on GitHub:

```
Settings → Secrets and variables → Actions → New repository secret
```

Add each of these:

| Secret name      | Value                                                                |
|------------------|----------------------------------------------------------------------|
| `VPS_HOST`       | Your VPS IP, e.g. `159.65.12.34`                                     |
| `VPS_USER`       | `deploy`                                                             |
| `VPS_PORT`       | `22` (or whatever SSH port you use)                                  |
| `VPS_SSH_KEY`    | Paste the entire `cinemadesi_deploy` private key from step 2          |
| `GHCR_TOKEN`     | The `ghp_…` token from step 3                                        |

You **don't** need to add `JWT_SECRET`, `MAIL_PASSWORD`, etc. — those live in `/opt/cinemadesi/.env` on the VPS, never in GitHub. Cleanest separation: secrets that *the deploy* needs are in GitHub; secrets that *the app* needs are on the VPS.

---

## 5. First deploy

### 5a. Commit the new files

You should now have these in git:

```
.github/workflows/deploy-backend.yml
backend/cinemadesi-api/Dockerfile
backend/cinemadesi-api/.dockerignore
deploy/docker-compose.yml
deploy/.env.example
DEPLOY.md
```

Push them:
```bash
git add .github backend/cinemadesi-api/Dockerfile backend/cinemadesi-api/.dockerignore deploy DEPLOY.md
git commit -m "deploy: dockerfile + ci/cd pipeline + vps compose"
git push origin main
```

### 5b. Watch the build

Go to your repo → **Actions** tab → "Build & deploy backend" workflow.

You'll see two jobs:
1. **build** — compiles the JAR, builds the Docker image, pushes to GHCR (~3-5 min first time, ~1 min after that thanks to layer caching)
2. **deploy** — SCPs `docker-compose.yml` to the VPS and runs `docker compose pull && up -d`

If both go green: your API is live at `http://<vps-ip>:8080`.

Quick check from your laptop:
```bash
curl http://<vps-ip>:8080/api/v1/health
# → {"status":"UP"}
```

---

## 6. Domain + HTTPS (recommended, ~10 min)

Skip if you're fine with raw IP + HTTP for now.

### 6a. Point DNS at your VPS

In your DNS provider (Cloudflare, Namecheap, etc.):

```
Type    Name           Value          Proxy
A       api            <vps-ip>       off (DNS only)
```

Wait ~5 min for DNS to propagate. Test:
```bash
dig +short api.your-domain.com
# should return your VPS IP
```

### 6b. Install Caddy (cleanest TLS option)

On the VPS:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | \
  sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | \
  sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

Edit `/etc/caddy/Caddyfile`:

```
api.your-domain.com {
    reverse_proxy localhost:8080
}
```

```bash
sudo systemctl reload caddy
```

Caddy auto-fetches a Let's Encrypt cert and renews it forever. Test:
```bash
curl https://api.your-domain.com/api/v1/health
```

### 6c. Lock down the API port

Now that Caddy is in front, take 8080 off the public internet:

In `/opt/cinemadesi/docker-compose.yml`, change:
```yaml
    ports:
      - "8080:8080"
```
to:
```yaml
    ports:
      - "127.0.0.1:8080:8080"
```

Then `docker compose up -d` and `sudo ufw delete allow 8080/tcp`.

### 6d. Update env vars

In `/opt/cinemadesi/.env`:
```
FRONTEND_BASE_URL=https://your-frontend-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

`docker compose up -d` to pick them up.

---

## Daily workflow

Just push. The pipeline runs on any commit to `main` that touches `backend/**`.

```bash
# Edit some backend code…
git add .
git commit -m "feat: add lists pagination"
git push origin main
```

Watch GitHub Actions → green → deployed. About 90 seconds end-to-end after the first run.

---

## Troubleshooting

### Build fails

Check the **build** job logs in GitHub Actions. Most common:
- Maven dependency resolution issue → re-run the workflow
- A code change broke compilation → fix and push again

### Deploy fails — "permission denied (publickey)"

The `VPS_SSH_KEY` secret is wrong. Re-paste the **private** key (the file without `.pub`), including the BEGIN/END lines.

### Deploy fails — health check times out

SSH into the VPS:
```bash
ssh deploy@<vps-ip>
cd /opt/cinemadesi
docker compose logs --tail=200 api
```

Common causes:
- `JWT_SECRET` too short (< 32 bytes) — Spring will throw at startup
- DB connection failing — check `DATABASE_URL`, `DB_USERNAME`, `DB_PASSWORD` in `.env`
- Flyway migration error — usually a schema-vs-existing-data mismatch

### "Connection refused" hitting the public URL

- Firewall: `sudo ufw status` — make sure 8080 (or 443 if using Caddy) is allowed
- Caddy down: `sudo systemctl status caddy`
- API container not running: `docker compose ps`

### Want to roll back to a specific commit

On the VPS:
```bash
cd /opt/cinemadesi
# Find the SHA you want from GitHub Actions (e.g. "abc1234")
API_TAG=sha-abc1234 docker compose up -d api
```

To pin a rollback permanently, set `API_TAG=sha-abc1234` in `/opt/cinemadesi/.env`.

### Image is private — VPS can't pull

The `Deploy on VPS` step in the pipeline runs `docker login ghcr.io` for you. If it fails, the `GHCR_TOKEN` secret is missing or expired. Generate a new PAT (step 3) and update the secret.

---

## What this gives you

- Zero-downtime deploys (compose rotates the container; the previous one stays running until the new one is healthy)
- Per-commit image tags for rollbacks
- Postgres data persists across redeploys (named volume `cinemadesi-db-data`)
- HTTPS with auto-renewing certs (Caddy)
- Health-checked container (compose restarts it if it crashes)
- 10MB × 3 log rotation per container (no accidental disk fill)

---

## What this does NOT give you (yet)

- **Database backups** — set up `pg_dump` cron + offsite copy (or use a managed DB)
- **Frontend deploy** — Vercel handles that side; see Vercel's "import from GitHub" flow
- **Monitoring/alerting** — Spring Boot Actuator is exposed at `/actuator/health`; hook it into UptimeRobot or BetterStack for alerts
- **Rate limiting** — add Caddy's `rate_limit` directive or Spring Bucket4j when you have real traffic
