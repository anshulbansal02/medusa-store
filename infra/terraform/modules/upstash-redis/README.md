# Upstash Redis Module

Creates one Upstash Redis database for a single environment.

Defaults are conservative for v1:

- Upstash Global database
- Singapore primary region: `ap-southeast-1`
- no read regions initially
- TLS enabled
- eviction disabled
- auto-scale disabled
- `$20` monthly budget guardrail, which is the current Upstash API minimum
