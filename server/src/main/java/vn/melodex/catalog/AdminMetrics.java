package vn.melodex.catalog;

public record AdminMetrics(long catalogueRecords, long cachedRecognitionRecords,
                           int cacheLimit, long listings, long demoListings,
                           long databaseBytes) {
}
