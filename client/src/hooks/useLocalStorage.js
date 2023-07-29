import { useState, useEffect } from "react";

/** Custom hook for keeping state data synced with localStorage
 *
 * This creates `item` as state and looks in localStorage for current value.
 * (if not found, defaults to `defaultValue`)
 *
 * When `item` changes, effect re-runs:
 * - if new state is null, remove from localStorage
 * - else, update localStorage
 *
 * To the component, this just acts like state that is also synced
 * to/from localStorage:
 *
 * const [myThing, setMyThing] = useLocalStorage("myThing")
 */

const useLocalStorage = (key, defaultValue = null) => {
  const initialValue = localStorage.getItem(key) || defaultValue;

  const [item, setItem] = useState(initialValue);

  useEffect(
    function setKeyInLocalStorage() {
      // console.debug("hooks useLocalStorage useEffect", "item=", item);

      if (item === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, item);
      }
    },
    [key, item]
  );

  return [item, setItem];
};

export default useLocalStorage;
