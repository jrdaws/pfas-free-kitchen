import type { RealtimeProvider, RealtimePayload } from "../index";

export function pusherRealtimeProvider(): RealtimeProvider {
  return {
    async publish(_channel: string, _event: string, _payload: RealtimePayload) {
      throw new Error("pusherRealtimeProvider.publish not implemented");
    },
    async subscribe(_channel: string, _handler: (event: string, payload: RealtimePayload) => void) {
      throw new Error("pusherRealtimeProvider.subscribe not implemented");
    },
  };
}
