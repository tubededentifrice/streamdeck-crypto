type CryptoTickerConnectionState = 'live' | 'detached' | 'backup' | 'broken';

declare interface CryptoTickerSettings {
  title: string | null;
  exchange: string;
  pair: string;
  fromCurrency: string;
  currency: string | null;
  candlesInterval: string;
  candlesDisplayed: number;
  multiplier: number;
  digits: number;
  highLowDigits: string | null;
  font: string;
  fontSizeBase: number;
  fontSizePrice: number;
  fontSizeHighLow: string | null;
  fontSizeChange: number;
  priceFormat: string;
  backgroundColor: string;
  textColor: string;
  displayHighLow: string;
  displayHighLowBar: string;
  displayDailyChange: string;
  displayConnectionStatusIcon: string;
  alertRule: string | null;
  backgroundColorRule: string | null;
  textColorRule: string | null;
  mode: 'ticker' | 'candles';
}

declare interface CryptoTickerMessageConfig {
  loading: string;
  stale: string;
  noData: string;
  misconfigured: string;
  conversionError: string;
}

declare interface CryptoTickerTickerData {
  pair?: string;
  pairDisplay?: string;
  last?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  volume?: number;
  volumeQuote?: number;
  changeDaily?: number;
  changeDailyPercent?: number;
  conversionRate?: number;
  conversionToCurrency?: string | null;
  conversionError?: boolean;
  lastUpdated?: number;
  connectionState?: CryptoTickerConnectionState | string;
  [key: string]: unknown;
}

declare interface CryptoTickerCandleData {
  ts: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volumeQuote: number;
  [key: string]: unknown;
}

declare interface CryptoTickerNormalizedCandle extends CryptoTickerCandleData {
  index: number;
  timePercent: number;
  openPercent: number;
  closePercent: number;
  highPercent: number;
  lowPercent: number;
  volumePercent: number;
}

declare interface CryptoTickerProviderOptions {
  baseUrl?: string;
  logger?: (...args: unknown[]) => void;
  fallbackPollIntervalMs?: number;
  staleTickerTimeoutMs?: number;
  [key: string]: unknown;
}

declare interface CryptoTickerTickerParams {
  exchange: string;
  symbol: string;
  fromCurrency?: string | null;
  toCurrency?: string | null;
}

declare interface CryptoTickerCandlesParams {
  exchange: string;
  symbol: string;
  interval: string;
  limit?: number;
  fromCurrency?: string | null;
  toCurrency?: string | null;
}

declare interface CryptoTickerSubscriptionHandlers {
  ticker?: (ticker: CryptoTickerTickerData | null) => void;
  onData?: (ticker: CryptoTickerTickerData | null) => void;
  connectionState?: (state: CryptoTickerConnectionState | string | null) => void;
  error?: (error: unknown) => void;
  onError?: (error: unknown) => void;
}

declare interface CryptoTickerSubscriptionHandle {
  unsubscribe: () => void;
  key?: string;
}

declare interface CryptoTickerProviderInterface {
  baseUrl: string;
  logger: (...args: unknown[]) => void;
  getId(): string;
  subscribeTicker(
    params: CryptoTickerTickerParams,
    handlers: CryptoTickerSubscriptionHandlers
  ): CryptoTickerSubscriptionHandle | null | undefined;
  fetchTicker(params: CryptoTickerTickerParams): Promise<CryptoTickerTickerData | null>;
  getCachedTicker?(key: string): CryptoTickerTickerData | null | undefined;
  fetchCandles?(params: CryptoTickerCandlesParams): Promise<CryptoTickerCandleData[] | null>;
  ensureConnection?(): void;
  fetchConversionRate?(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number>;
}

declare type Nullable<T> = T | null;
