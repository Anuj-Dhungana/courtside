## StreamFree fallback streams

Streamed remains CourtSide's primary stream provider. Event pages request
streams through the server-side `/api/events/[id]/streams` route; StreamFree is
queried only when the primary provider returns no usable, validated sources.
StreamFree is never called directly by browser code and does not replace event
discovery or the existing Watch page.

The fallback caches each category's live catalog for 20 seconds with a 60-second
hard expiry using the existing Redis/in-memory cache and in-flight request
coalescing. Individual StreamFree stream details use the same short cache. A
fallback candidate must have playable sources, the same StreamFree category,
matching home and away teams after accent/punctuation normalization, and a
reasonable kickoff timestamp. Ambiguous or low-confidence matches are rejected.

The provider has no API key requirement in its current documentation. Its API
page asks clients to cache live catalogs; it does not state a required public
attribution in the documentation reviewed for this integration. CourtSide keeps
its existing third-party stream disclaimer and does not claim ownership or
licensing of external broadcasts.
