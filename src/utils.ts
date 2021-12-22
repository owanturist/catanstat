import { MutableRefObject, useRef, useState, useEffect } from 'react'

const padDuration = (duration: number): string => {
  return duration.toString().padStart(2, '0')
}

export const formatDurationMs = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  const parts = [
    padDuration(minutes - hours * 60),
    padDuration(seconds - minutes * 60)
  ]

  if (hours > 0) {
    parts.unshift(hours.toString())
  }

  return parts.join(':')
}

export const pct = (num: number, precision = 2): string => {
  return `${num.toFixed(precision)}%`
}

export const sum = (arr: ReadonlyArray<number>): number => {
  return arr.reduce((a, b) => a + b, 0)
}

export const useDynamicRef = <T>(value: T): MutableRefObject<T> => {
  const valueRef = useRef<T>(value)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  return valueRef
}

export const useEvery = <T>(
  cb: (now: Date) => T,
  {
    interval = 1000,
    skip = false
  }: {
    interval?: number
    skip?: boolean
  } = {}
): T => {
  const [value, setValue] = useState(() => cb(new Date()))
  const cbRef = useRef(cb)

  useEffect(() => {
    cbRef.current = cb

    setValue(cb(new Date()))
  }, [cb])

  useEffect(() => {
    const updateValue = (): void => {
      setValue(cbRef.current(new Date()))
    }

    updateValue()

    if (!skip) {
      const intervalId = setInterval(updateValue, interval)

      return () => clearInterval(intervalId)
    }
  }, [cbRef, skip, interval])

  return value
}

export type ID<TNamespace extends string> = TNamespace

export const castID = <TNamespace extends string>(
  id: string | number
): ID<TNamespace> => {
  return String(id) as ID<TNamespace>
}
