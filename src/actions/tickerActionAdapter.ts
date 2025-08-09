import { action, KeyDownEvent, KeyUpEvent , SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

// Import the legacy JS action as a module. It exports a plain object with handlers.
// We type it minimally as any to avoid leaking incorrect types.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { tickerAction: legacy } = require("./tickerAction") as any;

// Adapter that bridges the legacy object-based action to the new SingletonAction API.
@action({ UUID: "com.courcelle.cryptoticker.ticker" })
export class TickerAction extends SingletonAction<TickerSettings> {
    /**
     * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible. This could be due to the Stream Deck first
     * starting up, or the user navigating between pages / folders etc.. There is also an inverse of this event in the form of {@link streamDeck.client.onWillDisappear}. In this example,
     * we're setting the title to the "count" that is incremented in {@link IncrementCounter.onKeyDown}.
     */
    override async onWillAppear(ev: WillAppearEvent<TickerSettings>): Promise<void> {
        if (legacy?.onWillAppear) {
            const settings = await ev.action.getSettings();
            await legacy.onWillAppear(ev.action, settings);
        }
    }

    /**
     * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed. Stream Deck provides various events for tracking interaction
     * with devices including key down/up, dial rotations, and device connectivity, etc. When triggered, {@link ev} object contains information about the event including any payloads
     * and action information where applicable. In this example, our action will display a counter that increments by one each press. We track the current count on the action's persisted
     * settings using `setSettings` and `getSettings`.
     */
    override async onKeyDown(ev: KeyDownEvent<TickerSettings>): Promise<void> {
        if (legacy?.onKeyDown) {
            const settings = await ev.action.getSettings();
            await legacy.onKeyDown(ev.action, settings);
        }
    }

    override async onKeyUp(ev: KeyUpEvent<TickerSettings>): Promise<void> {
        if (legacy?.onKeyUp) {
            const settings = await ev.action.getSettings();
            await legacy.onKeyUp(ev.action, settings);
        }
    }
}

type TickerSettings = {

};
