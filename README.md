# Melodex

Melodex is a Java music discovery and marketplace prototype with a Spring Boot website/API and a native Java Android app. Both clients use the same PostgreSQL catalogue and recognition endpoint. The catalogue starts with demonstration releases; successful Shazam matches and MusicBrainz search results are saved as searchable track metadata. Each imported or recognized release receives a clearly marked fictional demo offer, so the prototype does not show a blank marketplace card. Audio recordings are not saved.

The website and Android app include light/dark themes and English (US), English (UK), Vietnamese, Spanish, French, Japanese, Korean, and Simplified Chinese settings. Prices are entered and stored in VND, then converted using Frankfurter reference rates and rounded to whole currency units for display. This is for browsing only; requests do not take payment.

## Catalogue and buyer tools

The website separates the large recording catalogue from the smaller set of marketplace listings. **Advanced search** at `/search` searches the local MusicBrainz snapshot by artist, track title, or release title. **Shop records** at `/marketplace` searches actual available listings and supports format, condition, year, price, seller, and text filters, along with price, artist, title, date, and year sorting. Search results are paginated. Genre, country, and barcode filters are not shown because those fields are not present in the imported snapshot.

Visitors can save catalogue recordings to a browser-local wantlist, put available offers in a browser-local cart, and submit a demo purchase request. The selected listing is then marked as requested and appears in the purchase history under the buyer name saved in Buyer Settings. Demo offers are fictional and visibly labelled; new catalogue matches can receive a demo digital offer to make the browse-to-cart flow testable. There are no buyer accounts, payment processing, seller payouts, or shipping arrangements.

## Project layout

- `server/` — Spring Boot website, JSON API, catalogue, and Shazam recognition integration.
- `android-app/` — native Android client written in Java.
- `Jenkinsfile` and `scripts/` — CI/CD pipeline and AWS Systems Manager deployment helper.
- `Dockerfile`, `compose.yaml`, and `compose.aws.yaml` — local and EC2 container definitions; NGINX is the web entry point.
- `infra/terraform/` — AWS network, EC2, RDS PostgreSQL, ECR, IAM, Secrets Manager, and CloudWatch resources.
- `server/build/libs/` in the ZIP — a prebuilt server JAR ready for Docker Compose; `artifacts/` contains the Android debug APK.

## Local development

Install JDK 21, Android SDK 36, and Docker Desktop with Docker Compose. The private archive contains `application-private.properties`; on a fresh GitHub checkout, copy `application-private.properties.example` to that name and set the RapidAPI key. The private file is ignored by Git and excluded from Docker build contexts.

The ZIP includes a prebuilt server JAR at the path Docker expects. This command rebuilds it if needed, then starts the Compose stack:

```powershell
.\gradlew.bat :server:bootJar
docker compose up --build
```

Open <http://localhost:8080>. Compose starts PostgreSQL, the Java service, and NGINX. To run Java directly from the host, start only the database with `docker compose up -d db`, then run `.\gradlew.bat :server:bootRun`.

To build the Android APK:

```powershell
.\gradlew.bat :android-app:app:assembleDebug
```

The APK is written to `android-app/app/build/outputs/apk/debug/app-debug.apk`. The app defaults to `http://10.0.2.2:8080` for an Android emulator. For a physical phone, set `API_BASE_URL` in `gradle.properties` to the computer's LAN address.

## CI/CD flow

GitHub remains the source repository. A Jenkins multibranch job checks the `main` branch every five minutes, runs Gradle backend checks and builds the Android APK, then builds an immutable Docker image and pushes it to Amazon ECR. Jenkins deploys the image to the AWS test EC2 instance through Systems Manager Run Command. The remote deploy script loads database credentials from the test RDS secret and the Shazam key from AWS Secrets Manager, starts Docker Compose, and checks `/api/health`. Jenkins pauses for approval before deploying the exact same image tag to production.

Use a Jenkins GitHub credential to read the repository. The Jenkins EC2 instance uses its IAM role for ECR and Systems Manager; do not add AWS access keys to Jenkins or the repository. The pipeline uses polling so Jenkins needs no public webhook port. Before the first app build, start an interactive Systems Manager session to the `jenkins_instance_id` output and review/accept the Android SDK licenses, then install API 36 and build tools 36.0.0:

```bash
sudo -u jenkins /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --sdk_root=/opt/android-sdk --licenses
sudo -u jenkins /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --sdk_root=/opt/android-sdk 'platform-tools' 'platforms;android-36' 'build-tools;36.0.0'
```

## Music catalogue data

The site can search a full local snapshot of MusicBrainz's canonical track metadata, alongside the songs recognized by Shazam and the project's demo releases. To load the latest snapshot, start the Compose stack and run:

```powershell
.\scripts\import-musicbrainz-catalog.ps1
```

The importer downloads the official compressed snapshot (about 2.25 GiB for the 2026-11-17 release), verifies its SHA-256 checksum, and loads the canonical track metadata into PostgreSQL before creating local text-search indexes. That release contains 32,809,489 rows. The imported table currently occupies about 13 GiB in PostgreSQL. Keep additional disk space available before refreshing it because the old catalogue remains in place while the replacement is downloaded and indexed. MusicBrainz refreshes the CC0 snapshot twice a month. The canonical data groups equivalent recording versions into representative entries, so it gives the demo a very broad searchable music metadata catalogue; it is not a catalogue of audio files or Shazam fingerprints. [MusicBrainz canonical dataset](https://musicbrainz.org/doc/Canonical_MusicBrainz_data), [download page](https://metabrainz.org/datasets/derived-dumps), [CC0 data license](https://musicbrainz.org/doc/About/Data_License).

If the snapshot has not been imported or a search has no local match, the server also uses the free MusicBrainz Recording API. API requests include a descriptive User-Agent and respect its one-request-per-second limit. [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API), [search API](https://musicbrainz.org/doc/MusicBrainz_API/Search), [rate limits](https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting).

Frankfurter provides the no-key exchange-rate endpoint. Rates are cached by the server for 12 hours; if the service is unavailable, the app continues to show VND. [Frankfurter](https://frankfurter.dev/).

## AWS environment

The Terraform plan creates the three Ubuntu EC2 servers described in the brief: Jenkins/build, test, and production. It also creates separate private RDS PostgreSQL databases for test and production, a private ECR repository, runtime-secret references, Systems Manager access, and CloudWatch memory/disk metrics plus a production CPU alarm. NGINX serves the website on the production instance. Jenkins and test access are restricted to the `admin_cidr` provided during Terraform planning; there is no inbound SSH rule.

Terraform files do not create AWS resources until you run `terraform apply`. Creating the EC2 and RDS resources incurs AWS charges. Set your own public IPv4 CIDR before applying:

```powershell
cd infra/terraform
Copy-Item terraform.tfvars.example terraform.tfvars
# Edit admin_cidr to your public address with /32, then:
terraform init
terraform plan
terraform apply
```

After apply, configure Jenkins at the `jenkins_url` output as a multibranch pipeline pointing at this GitHub repository and using `Jenkinsfile`. Then, from the project root, upload the local RapidAPI key to the secret placeholder created by Terraform:

```powershell
.\scripts\publish-shazam-secret.ps1
```

The command sends the private key to AWS Secrets Manager; the Jenkins deployment retrieves it at runtime and does not place it in the container image. A developer's `application-private.properties` is for the local app only.

## Deployment and recovery notes

- The project uses Java/Spring Boot and a native Android app, following the later implementation choice. It does not yet provide the brief's Django/React Native iOS client.
- The marketplace uses fictional sample records and fictional demo offers. Accounts, real orders, payment processing, seller payouts, and shipping are not implemented.
- Shazam is used for audio recognition; its private recognition catalogue is not copied into the project database. MusicBrainz is a separate free, searchable metadata source; its local results are cached on demand and do not contain audio fingerprints.
- The infrastructure opens production HTTP on port 80 for the class demo. Add a domain and TLS termination before using it publicly.
- To roll back, rerun `scripts/deploy-ssm.sh production <previous-ECR-image-uri>` from Jenkins or an AWS CLI session with the appropriate IAM permissions. Keep at least the prior image tag in ECR.
- Keep Terraform state private. Do not commit `terraform.tfvars`, state files, or `application-private.properties`.
