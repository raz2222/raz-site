import { afterEach, describe, expect, it, vi } from "vitest"
import { setAppBadge, clearAppBadge, supportsAppBadge } from "./appBadge"

/** Every call here has to survive a browser that refuses it. The admin went
 * black once because a best-effort feature threw inside an effect, and a
 * number on an icon is worth far less than the app. */
function withNavigator(nav: unknown, run: () => void) {
  const original = globalThis.navigator
  Object.defineProperty(globalThis, "navigator", { value: nav, configurable: true })
  try {
    run()
  } finally {
    Object.defineProperty(globalThis, "navigator", { value: original, configurable: true })
  }
}

afterEach(() => vi.restoreAllMocks())

describe("setAppBadge", () => {
  it("sets the number when there is something waiting", () => {
    const setSpy = vi.fn(() => Promise.resolve())
    withNavigator({ setAppBadge: setSpy, clearAppBadge: vi.fn(() => Promise.resolve()) }, () => {
      setAppBadge(3)
    })
    expect(setSpy).toHaveBeenCalledWith(3)
  })

  it("clears rather than drawing a zero", () => {
    const clearSpy = vi.fn(() => Promise.resolve())
    withNavigator({ setAppBadge: vi.fn(() => Promise.resolve()), clearAppBadge: clearSpy }, () => {
      setAppBadge(0)
      clearAppBadge()
    })
    expect(clearSpy).toHaveBeenCalledTimes(2)
  })

  it("does nothing on a browser without the API", () => {
    withNavigator({}, () => {
      expect(() => setAppBadge(2)).not.toThrow()
      expect(supportsAppBadge()).toBe(false)
    })
  })

  it("survives a browser that lists the method and throws", () => {
    withNavigator(
      {
        setAppBadge: () => {
          throw new Error("The operation is insecure")
        },
      },
      () => {
        expect(() => setAppBadge(1)).not.toThrow()
      }
    )
  })

  it("survives a rejected promise", async () => {
    withNavigator({ setAppBadge: () => Promise.reject(new Error("denied")) }, () => {
      expect(() => setAppBadge(1)).not.toThrow()
    })
    await Promise.resolve()
  })
})
