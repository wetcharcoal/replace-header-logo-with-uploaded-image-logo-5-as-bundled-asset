import { useActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";

/**
 * Thin wrapper around useActor that binds the backend createActor factory.
 * Import this hook instead of calling useActor() directly.
 */
export function useBackendActor() {
  return useActor(createActor);
}
