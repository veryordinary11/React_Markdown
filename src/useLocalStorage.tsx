import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const jsonValue = localStorage.getItem(key);
    if (jsonValue == null) {
      //If there is no value in localStorage, we use initialValue
      if (typeof initialValue === "function") {
        //If initialValue is a function, we call the function and use the return value as the initialValue
        return (initialValue as () => T)();
      } else {
        //If initialValue is not a function, we use initialValue directly
        return initialValue;
      }
    } else {
      //If there is a value in localStorage, we parse the value and use it as the initialValue
      return JSON.parse(jsonValue);
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);
  //Every time the value changes, we update the localStorage

  return [value, setValue] as [T, typeof setValue];
}
