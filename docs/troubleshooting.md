# Troubleshooting

## Connection states

| State      | What it indicates                      | First checks                                                 |
| ---------- | -------------------------------------- | ------------------------------------------------------------ |
| `LIVE`     | Direct WebSocket updates are arriving. | No action needed.                                            |
| `DETACHED` | Direct REST polling is supplying data. | Check whether exchange WebSockets are blocked.               |
| `BACKUP`   | The ticker proxy is supplying data.    | Check direct exchange API reachability and provider status.  |
| `BROKEN`   | No usable data source is available.    | Verify the pair, network, firewall/VPN, and provider status. |

YFinance is proxy-backed and therefore does not enter `LIVE` or direct-REST `DETACHED` mode.

## Diagnostic checklist

1. Confirm general internet access.
2. Verify the selected provider and pair in the property inspector.
3. Check whether a VPN, proxy, DNS filter, or corporate firewall blocks exchange REST/WebSocket endpoints.
4. Compare a Binance or Bitfinex pair with YFinance or another provider to isolate the path.
5. Check exchange status pages for outages or rate limiting.
6. Inspect Stream Deck plugin logs. Production logging is intentionally sparse unless a development build enables it.

When the renderer has a valid cached value, it shows that value with a stale marker rather than replacing it with zero. A conversion error means the base ticker arrived but no valid conversion rate was available.
