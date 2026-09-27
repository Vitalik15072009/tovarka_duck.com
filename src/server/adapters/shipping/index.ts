import type { ShippingAdapter } from "./types";
import { ManualNovaPoshtaAdapter } from "./manualNovaPoshta";

// TODO (when Nova Poshta API keys exist): implement a NovaPoshtaApiAdapter
// against ShippingAdapter and switch it in here.
export function getShippingAdapter(): ShippingAdapter {
  return new ManualNovaPoshtaAdapter();
}
