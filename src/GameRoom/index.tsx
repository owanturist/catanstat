import cx from 'classnames'
import React from 'react'
import { useParams } from 'react-router-dom'

import { useQueryGame } from '../api'
import * as Icon from '../Icon'

export const View = React.memo(() => {
  const { gameId } = useParams<'gameId'>()
  const { isLoading, error, game } = useQueryGame(Number(gameId))

  if (isLoading) {
    return null
  }

  if (error != null || game == null) {
    return <div>Something went wrong while loading the game</div>
  }

  const currentPlayer = game.turns[0]?.player ?? game.players[0]

  return (
    <div className={cx('p-3')}>
      <div className="flex">
        {game.players.map(player => (
          <div
            key={player.id}
            className={cx(
              'flex-1 flex justify-center transition-opacity',
              currentPlayer?.id !== player.id && 'opacity-50'
            )}
          >
            <div className="text-2xl" style={{ color: player.color.hex }}>
              <Icon.User />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
