declare module 'graphql-subscriptions' {
  export class PubSub {
    constructor();
    publish(triggerName: string, payload: any): Promise<void>;
    subscribe(triggerName: string, onMessage: Function): Promise<number>;
    unsubscribe(subId: number): void;
    asyncIterator<T>(triggers: string | string[]): AsyncIterator<T>;
  }
}