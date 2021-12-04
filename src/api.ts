import { useMutation } from 'react-query'

import * as DB from './db'

export const useStartGame = ({
  onError,
  onSuccess
}: {
  onError(error: Error): void
  onSuccess(gameId: number): void
}): {
  isLoading: boolean
  startGame(players: ReadonlyArray<DB.PlayerPayload>): void
} => {
  const { mutate, isLoading } = useMutation<
    number,
    Error,
    ReadonlyArray<DB.PlayerPayload>
  >(DB.start_game, { onError, onSuccess })

  return {
    isLoading,
    startGame: mutate
  }
}
