# Melodex

Melodex is a Java music discovery and marketplace website built with Spring Boot. Visitors can identify tracks from a browser audio sample, explore the catalogue, and browse seller listings. The responsive website is designed for desktop and mobile screens.

The catalogue is stored in Neon PostgreSQL and includes the migrated FMA metadata snapshot, curated records, and tracks identified with Shazam. Searches read the database; the website does not query an external catalogue source. Recognition adds track metadata, while uploaded or recorded audio is not stored. Seller listings and buyer requests are stored separately, so a catalogue track does not automatically represent stock for sale.

## Features

- Identify music from an audio clip or an eight-second browser recording.
- Search known tracks by title and artist, with release-year and format filters where offers exist.
- Browse seller offers separately from the track catalogue; filter and sort by title, artist, seller, format, condition, year, and price.
- Use browser wantlists, collections, saved searches, cart, buyer settings, and purchase requests.
- Use English, Vietnamese, Spanish, French, Japanese, Korean, and Simplified Chinese, with rounded display currency conversion from VND.
- Change light and dark appearance on the website.
- View source IDs, external references, demo declarations, listing counts, cache capacity, and database size in the protected `/admin` dashboard.

Catalogue entries and seller listings are stored separately; a track can exist without an offer. Buyer requests are recorded for the seller workflow.

## Project layout

- `server/` — Spring Boot website, API, Shazam integration, database access, and page templates.
- `compose.yaml`, `Dockerfile`, and `infra/nginx.conf` — local website deployment using Docker Compose and NGINX, with PostgreSQL hosted by Neon.
- `Jenkinsfile` — Jenkins continuous integration: checks the Gradle project, builds the runnable JAR, and archives it.
- `scripts/` — first-run Neon setup and the one-command local launcher.
- `infra/terraform/` and `compose.aws.yaml` — optional AWS deployment configuration. Applying it creates chargeable resources; it is not needed for local development.

## Local setup

Install Docker Desktop with its Linux container engine. Clone the project, open PowerShell in its folder, and run:

```powershell
.\scripts\run.ps1
```

On the first run, the setup asks for the pooled PostgreSQL connection URI from Neon’s **Connect → Pooled connection** panel. The input is hidden and the script writes the connection to `.env`, which is ignored by Git. The URI should belong to a database role with permission to create the application schema and read/write its tables. Each teammate enters the same shared application-role connection once on their own computer. Do not commit `.env` or send the database owner’s credentials in the repository.

After setup, the launcher verifies the Compose configuration, builds the Java server inside Docker, and starts the web application and NGINX. Open <http://localhost:8080>. Later runs reuse the local `.env` and do not ask for the Neon connection again. To start manually after setup, use `docker compose up --build`.

The database lives in Neon, not in a local PostgreSQL container. Copies of the site configured with the same Neon connection read and write the same cloud records: recognized track metadata, seller listings, and purchase requests appear to the other users after refresh. Browser-only items such as saved searches, cart contents, collection, and wantlist remain on the browser that created them. Keep `.env`, connection URLs, the Shazam RapidAPI key, and administrator credentials out of Git. Optional Shazam and admin settings can be added to `.env` on each machine.

On startup, Spring creates the current application tables and seeds the example records. The shared Neon database has already been populated with 106,639 catalogue records, 8 seller listings, and 3 purchase requests. It contains metadata only; no audio or cover art is imported. The catalogue snapshot includes FMA metadata, licensed under CC BY 4.0, alongside curated and recognized tracks.

## Database and deployment

Neon is the application's PostgreSQL host. The website uses a pooled TLS connection so multiple local instances can share the database. Docker builds and runs the application; GitHub stores the source; Jenkins can run CI separately. Neon has usage and storage limits, so writes may be unavailable if the project reaches its plan quota.

AWS is an optional deployment target in the existing Terraform configuration. EC2, ECR, Jenkins, and related services can incur charges; no AWS resources are created by building or running the local Compose stack. Review the AWS cost before applying Terraform. Neon is a database host and can replace PostgreSQL’s location, but it does not replace Jenkins, Docker, or GitHub.

## Jenkins (local CI)

Jenkins is open-source software and can run locally without a Jenkins hosting fee. Start the optional Jenkins container with `docker compose --profile ci up -d jenkins`, then open <http://localhost:8081>. For first setup, run `docker exec melodex-jenkins-1 cat /var/jenkins_home/secrets/initialAdminPassword` in PowerShell and enter the result on the unlock screen. Install the suggested plugins and create your own administrator account. Create a Pipeline job using **Pipeline script from SCM**, Git, the project repository URL, branch `main`, and script path `Jenkinsfile`. The pipeline polls GitHub, runs `:server:check` and `:server:bootJar`, and archives the JAR. Jenkins is bound to localhost and does not expose an internet-facing service. A hosted Jenkins service or a cloud VM could add charges.

## Recognition cache

`CATALOGUE_CACHE_MAX_ENTRIES` sets the default maximum of 5,000 disposable Shazam recognition records. Before adding a new track, the server removes the oldest eligible recognition records when the cache is over its limit. Records tied to non-demo listings or purchase requests are preserved. Demo-only offers may be removed with an evicted track. This limit controls the recognition cache; it does not guarantee that any hosted database provider’s storage quota can never be reached.

## Admin access

`/admin` opens a separate administrator sign-in page, then the monitoring dashboard. The local default is `admin` / `password123`; `ADMIN_USERNAME` and `ADMIN_PASSWORD` can override it. Change the default before any public deployment. The dashboard refreshes automatically and shows catalogue records, Shazam references, source IDs, demo and total listing counts, recognition-cache usage, and PostgreSQL database size.
