import { useRef } from "react";
let value = 0;
export const usecache = () => {
  const cacheRef = useRef(value);
  value = cacheRef.current.value;
  return cacheRef;
};
