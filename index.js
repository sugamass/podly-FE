// シンプルなURLSearchParams polyfill
if (typeof global !== "undefined") {
  if (!global.URLSearchParams) {
    class URLSearchParamsPolyfill {
      constructor(init) {
        this._params = new Map();

        if (typeof init === "string") {
          this._parseString(init);
        } else if (init instanceof URLSearchParams) {
          for (const [key, value] of init) {
            this._params.set(key, value);
          }
        } else if (Array.isArray(init)) {
          for (const [key, value] of init) {
            this._params.set(key, value);
          }
        } else if (init && typeof init === "object") {
          for (const [key, value] of Object.entries(init)) {
            this._params.set(key, value);
          }
        }
      }

      _parseString(str) {
        if (str.startsWith("?")) {
          str = str.slice(1);
        }

        if (!str) return;

        const pairs = str.split("&");
        for (const pair of pairs) {
          const [key, value = ""] = pair.split("=");
          this._params.set(decodeURIComponent(key), decodeURIComponent(value));
        }
      }

      append(name, value) {
        const existing = this._params.get(name);
        if (existing) {
          this._params.set(name, existing + "," + value);
        } else {
          this._params.set(name, value);
        }
      }

      delete(name) {
        this._params.delete(name);
      }

      get(name) {
        return this._params.get(name) || null;
      }

      getAll(name) {
        const value = this._params.get(name);
        return value ? [value] : [];
      }

      has(name) {
        return this._params.has(name);
      }

      set(name, value) {
        this._params.set(name, value);
      }

      toString() {
        const pairs = [];
        for (const [key, value] of this._params) {
          pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
        }
        return pairs.join("&");
      }

      *[Symbol.iterator]() {
        for (const [key, value] of this._params) {
          yield [key, value];
        }
      }

      entries() {
        return this[Symbol.iterator]();
      }

      keys() {
        return this._params.keys();
      }

      values() {
        return this._params.values();
      }

      forEach(callback, thisArg) {
        for (const [key, value] of this._params) {
          callback.call(thisArg, value, key, this);
        }
      }
    }

    global.URLSearchParams = URLSearchParamsPolyfill;
    console.log("✅ Custom URLSearchParams polyfill applied");
  } else if (!global.URLSearchParams.prototype.has) {
    // has() メソッドが存在しない場合のみ追加
    global.URLSearchParams.prototype.has = function (name) {
      return this.get(name) !== null;
    };
    console.log("✅ URLSearchParams.has() method polyfill applied");
  }
}

// URL Polyfill for React Native - backup
try {
  require("react-native-url-polyfill/auto");
  console.log("✅ react-native-url-polyfill loaded as backup");
} catch (error) {
  console.warn("⚠️ react-native-url-polyfill not available:", error);
}

console.log("✅ All URL polyfills applied successfully");

import TrackPlayer from "react-native-track-player";
import TrackPlayerService from "./services/TrackPlayerService";

// Register TrackPlayer service
TrackPlayer.registerPlaybackService(() => TrackPlayerService);

// Import and register the Expo router entry
import "expo-router/entry";
