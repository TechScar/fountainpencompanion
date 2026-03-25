import { useCallback, useEffect, useState } from "react";
import { getRequest, putRequest } from "./fetch";
import * as storage from "./localStorage";

const storageKeyToApiKey = {
  "fpc-collected-inks-table-hidden-fields": "collected_inks_table_hidden_fields",
  "fpc-collected-inks-cards-hidden-fields": "collected_inks_cards_hidden_fields",
  "fpc-collected-pens-table-hidden-fields": "collected_pens_table_hidden_fields",
  "fpc-collected-pens-cards-hidden-fields": "collected_pens_cards_hidden_fields",
  "fpc-currently-inked-table-hidden-fields": "currently_inked_table_hidden_fields",
  "fpc-currently-inked-cards-hidden-fields": "currently_inked_cards_hidden_fields"
};

function readFromStorage(storageKey, defaultHiddenFields) {
  const stored = JSON.parse(storage.getItem(storageKey));
  return stored || defaultHiddenFields || [];
}

export const useHiddenFields = (storageKey, defaultHiddenFields) => {
  const [hiddenFields, setHiddenFields] = useState(() =>
    readFromStorage(storageKey, defaultHiddenFields)
  );
  const apiKey = storageKeyToApiKey[storageKey];

  // Sync with server in the background
  useEffect(() => {
    let cancelled = false;

    async function syncWithServer() {
      try {
        const response = await getRequest("/account");
        if (!response.ok || cancelled) return;

        const json = await response.json();
        const preferences = json.data.attributes.preferences || {};
        const serverValue = preferences[apiKey];

        if (serverValue !== null && serverValue !== undefined) {
          // Server has a value — update localStorage and state
          storage.setItem(storageKey, JSON.stringify(serverValue));
          if (!cancelled) setHiddenFields(serverValue);
        } else {
          // Server has no value — push local value up if we have one
          const local = JSON.parse(storage.getItem(storageKey));
          if (local) {
            savePreference(apiKey, local);
          }
        }
      } catch {
        // Network error: localStorage value is already in use
      }
    }

    syncWithServer();
    return () => {
      cancelled = true;
    };
  }, [apiKey, storageKey, defaultHiddenFields]);

  const onHiddenFieldsChange = useCallback(
    (nextHiddenFields) => {
      if (nextHiddenFields === null) {
        storage.removeItem(storageKey);
        setHiddenFields(defaultHiddenFields || []);
        savePreference(apiKey, null);
        return;
      }

      storage.setItem(storageKey, JSON.stringify(nextHiddenFields));
      setHiddenFields(nextHiddenFields);
      savePreference(apiKey, nextHiddenFields);
    },
    [apiKey, storageKey, defaultHiddenFields]
  );

  return {
    hiddenFields,
    onHiddenFieldsChange
  };
};

async function savePreference(apiKey, value) {
  try {
    await putRequest("/account", {
      user: { preferences: { [apiKey]: value } }
    });
  } catch {
    // Silently fail — local state is already correct
  }
}
