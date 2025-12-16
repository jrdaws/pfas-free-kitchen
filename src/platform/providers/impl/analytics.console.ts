import { ProviderHealth } from "../types";

const provider = {
  name: "analytics.console",
  async health(): Promise<ProviderHealth> {
    return { status: "ok", details: "console logger" };
  }
};

export default provider;
