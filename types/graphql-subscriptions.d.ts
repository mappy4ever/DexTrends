declare module 'graphql-subscriptions' {
  export class PubSub {
    constructor();
    publish(triggerName: string, payload: unknown): Promise<void>;  // GraphQL subscription payload - can be any serializable data
    subscribe(triggerName: string, onMessage: Function): Promise<number>;
    unsubscribe(subId: number): void;
    asyncIterator<T>(triggers: string | string[]): AsyncIterator<T>;
  }
}