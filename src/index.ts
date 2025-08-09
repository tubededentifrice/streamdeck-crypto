import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { TickerAction } from "./actions/tickerActionAdapter";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.INFO);

// Register the increment action.
streamDeck.actions.registerAction(new TickerAction());

// Finally, connect to the Stream Deck.
streamDeck.connect();
