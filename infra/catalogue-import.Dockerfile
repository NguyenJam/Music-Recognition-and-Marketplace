FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY infra/catalogue-import-requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY scripts/import_musicbrainz_catalog.py /app/import_musicbrainz_catalog.py

ENTRYPOINT ["python", "/app/import_musicbrainz_catalog.py"]
