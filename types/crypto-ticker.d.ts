type CryptoTickerConnectionState = 'live' | 'detached' | 'backup' | 'broken';

// Error types for better error handling
declare class CryptoTickerError extends Error {
  constructor(message: string, cause?: unknown);
  readonly cause?: unknown;
}

declare class ProviderConnectionError extends CryptoTickerError {
  constructor(providerId: string, message: string, cause?: unknown);
  readonly providerId: string;
}

declare class TickerFetchError extends CryptoTickerError {
  constructor(exchange: string, symbol: string, message: string, cause?: unknown);
  readonly exchange: string;
  readonly symbol: string;
}

declare class ConversionError extends CryptoTickerError {
  constructor(fromCurrency: string, toCurrency: string, message: string, cause?: unknown);
  readonly fromCurrency: string;
  readonly toCurrency: string;
}

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

// Base ticker data with required fields
declare interface CryptoTickerTickerDataBase {
  readonly pair: string;
  readonly pairDisplay?: string;
  readonly lastUpdated: number;
  readonly connectionState?: CryptoTickerConnectionState;
}

// Ticker data with price information (successful fetch)
declare interface CryptoTickerTickerDataWithPrice extends CryptoTickerTickerDataBase {
  readonly last: number;
  readonly high?: number;
  readonly low?: number;
  readonly open?: number;
  readonly close?: number;
  readonly volume?: number;
  readonly volumeQuote?: number;
  readonly changeDaily?: number;
  readonly changeDailyPercent?: number;
  readonly conversionRate?: number;
  readonly conversionToCurrency?: string | null;
  readonly conversionError?: false;
  [key: string]: unknown;
}

// Ticker data with conversion error
declare interface CryptoTickerTickerDataWithError extends CryptoTickerTickerDataBase {
  readonly conversionError: true;
  readonly conversionToCurrency: string;
  [key: string]: unknown;
}

// Union type for all ticker data states
declare type CryptoTickerTickerData =
  | CryptoTickerTickerDataWithPrice
  | CryptoTickerTickerDataWithError
  | (CryptoTickerTickerDataBase & Record<string, unknown>);

declare interface CryptoTickerCandleData {
  readonly ts: number;
  readonly open: number;
  readonly close: number;
  readonly high: number;
  readonly low: number;
  readonly volumeQuote: number;
  readonly [key: string]: unknown;
}

declare interface CryptoTickerNormalizedCandle extends CryptoTickerCandleData {
  readonly index: number;
  readonly timePercent: number;
  readonly openPercent: number;
  readonly closePercent: number;
  readonly highPercent: number;
  readonly lowPercent: number;
  readonly volumePercent: number;
}

declare interface CryptoTickerProviderOptions {
  readonly baseUrl?: string;
  readonly logger?: (...args: readonly unknown[]) => void;
  readonly fallbackPollIntervalMs?: number;
  readonly staleTickerTimeoutMs?: number;
  readonly [key: string]: unknown;
}

// Utility type for required provider options
declare type RequiredProviderOptions = Required<Pick<CryptoTickerProviderOptions, 'baseUrl' | 'logger'>>;

// Utility type for partial settings (for updates)
declare type PartialSettings = Partial<CryptoTickerSettings>;

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
  error?: (error: CryptoTickerError | Error) => void;
  onError?: (error: CryptoTickerError | Error) => void;
}

declare interface CryptoTickerSubscriptionHandle {
  unsubscribe: () => void;
  key?: string;
}

declare interface CryptoTickerProviderInterface {
  readonly baseUrl: string;
  readonly logger: (...args: readonly unknown[]) => void;
  getId(): string;
  subscribeTicker(
    params: Readonly<CryptoTickerTickerParams>,
    handlers: CryptoTickerSubscriptionHandlers
  ): CryptoTickerSubscriptionHandle | null | undefined;
  fetchTicker(params: Readonly<CryptoTickerTickerParams>): Promise<CryptoTickerTickerData | null>;
  getCachedTicker?(key: string): CryptoTickerTickerData | null | undefined;
  fetchCandles?(params: Readonly<CryptoTickerCandlesParams>): Promise<readonly CryptoTickerCandleData[] | null>;
  ensureConnection?(): void;
  fetchConversionRate?(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number>;
}

declare type Nullable<T> = T | null;
