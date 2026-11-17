# CancerCrafts email DNS setup

Status: all three records and the Resend sending domain are verified. Email verification and password recovery are enabled on the live site, with delivery and browser checks passed. Records below are retained for reference.

Resend Free is provisioned for `mail.cancercrafts.logandunne.com`. DNS for `logandunne.com` is hosted by Cloudflare. Add these records in **Cloudflare → logandunne.com → DNS → Records**. These are public DNS verification values, not API credentials.

| Type | Name (relative to logandunne.com) | Content / target | TTL |
| --- | --- | --- | --- |
| TXT | `resend._domainkey.mail.cancercrafts` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7pBtGxqHDoXZF2h2h8Gq6KHdIxNJulPeoig1393Xz7h0GmdlFXrTNWAPbmyNYFXLaH25+xSRlGoPcUlyr1LPc61zGYMLtjnGNA9TvzsFR/kb0yBnMscKek5nacd5eKMkgURRwshqXemFohYsriv13pY5wqLSEDizBFi2Hu7angQIDAQAB` | Auto |
| CNAME | `rsend.mail.cancercrafts` | `rsend.forge.rmta.net` | Auto |
| CNAME | `send.mail.cancercrafts` | `send.forge.rmta.net` | Auto |

For both CNAME records, select **DNS only** (gray cloud). Keep existing website and mailbox records intact.

Inspect domain status in the [Resend integration dashboard](https://vercel.com/d/dashboard/integrations/resend/icfg_lRPKiC5iHzTAjIAgA9TDVlmR/resources/ir_h3dihfREoEkzbNDK). Keep these records in place so authentication emails continue to work.
