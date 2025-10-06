declare const DestinationEnum: {
  readonly HARDWARE: number;
  readonly SOFTWARE: number;
  readonly HARDWARE_AND_SOFTWARE: number;
};

declare namespace StreamDeck {
  interface RegistrationEvent {
    event: string;
    uuid: string;
  }

  interface Loggable {
    log: (...args: unknown[]) => void;
  }

  interface SendPayload {
    event: string;
    context: string;
    action?: string;
    payload?: Record<string, unknown>;
  }

  interface MessageEvent {
    event: string;
    context: string;
    action?: string;
    device?: string;
    payload?: Record<string, unknown>;
  }
}

declare function connectElgatoStreamDeckSocket(
  port: number,
  uuid: string,
  registerEvent: string,
  infoJson: string,
  actionInfoJson?: string
): void;

declare const $SD: {
  uuid?: string;
  websocket?: WebSocket;
  emit?: (eventName: string, payload?: unknown) => void;
  on?: (eventName: string, handler: (...args: unknown[]) => void) => void;
  api?: Record<string, unknown>;
  PI?: Record<string, unknown>;
};

interface Window {
  connectElgatoStreamDeckSocket?: typeof connectElgatoStreamDeckSocket;
  DestinationEnum?: typeof DestinationEnum;
  $SD?: typeof $SD;
}
