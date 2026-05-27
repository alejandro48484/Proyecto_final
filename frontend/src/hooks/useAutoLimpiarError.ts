import { useEffect } from 'react';

export function useAutoLimpiarError(
  error: string,
  setError: (value: string) => void,
  setErrores?: (value: any) => void,
  segundos: number = 5
) {
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      setError('');
      if (setErrores) setErrores({});
    }, segundos * 1000);
    return () => clearTimeout(timer);
  }, [error, setError, setErrores, segundos]);

  useEffect(() => {
    if (!setErrores) return;
    const timer = setTimeout(() => {
      setErrores({});
    }, segundos * 1000);
    return () => clearTimeout(timer);
  }, [setErrores, segundos]);
}