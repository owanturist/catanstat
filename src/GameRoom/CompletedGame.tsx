import React from 'react'
import cx from 'classnames'
import { toast } from 'react-hot-toast'

import {
  Player,
  GameStatusCompleted,
  useUploadBoardPicture,
  GameID,
  useDeleteBoardPicture
} from '../api'
import * as Icon from '../Icon'

import * as PlayersRow from './PlayersRow'

const ViewBoardPicture: React.VFC<{
  gameId: GameID
  picture: File
}> = React.memo(({ gameId, picture }) => {
  const pictureUrl = React.useMemo(
    () => URL.createObjectURL(picture),
    [picture]
  )
  const { isLoading, deleteBoardPicture } = useDeleteBoardPicture(gameId, {
    onError() {
      toast.error('Failed to delete board picture')
    }
  })

  return (
    <div className="relative flex justify-center rounded-md overflow-hidden bg-gray-100">
      <img src={pictureUrl} className="max-h-96" alt="board picture" />

      <button
        type="button"
        className={cx(
          'absolute top-0 right-0 m-2',
          'flex justify-center rounded-md h-8 w-8 items-center',
          'text-white bg-red-400 ring-red-200 outline-none transition',
          'hover:bg-red-500 focus-visible:ring'
        )}
        disabled={isLoading}
        onClick={deleteBoardPicture}
      >
        <Icon.Times />
      </button>
    </div>
  )
})

const ViewBoardPictureUpload: React.VFC<{ gameId: GameID }> = React.memo(
  ({ gameId }) => {
    const { isLoading, uploadBoardPicture } = useUploadBoardPicture(gameId, {
      onError() {
        toast.error('Failed to upload board picture')
      }
    })

    return (
      <label className="block relative h-64">
        <input
          type="file"
          accept="image/*"
          className="sr-only peer"
          disabled={isLoading}
          onChange={event => {
            const file = event.target.files?.[0]

            if (file != null) {
              uploadBoardPicture(file)
            }
          }}
        />

        <div
          className={cx(
            'absolute inset-0 flex justify-center items-center rounded-md',
            'text-gray-500 bg-gray-100 ring-gray-200 cursor-pointer transition',
            'text-md text-center font-bold tracking-wider uppercase',
            'peer-focus-visible:ring hover:bg-gray-200'
          )}
        >
          <span>
            Click to upload
            <br />
            the Board picture!
          </span>
        </div>
      </label>
    )
  }
)

export const CompletedGame: React.VFC<{
  gameId: GameID
  status: GameStatusCompleted
  players: ReadonlyArray<Player>
}> = React.memo(({ gameId, status, players }) => {
  return (
    <>
      <PlayersRow.CompletedGame
        winnerId={status.winnerPlayerId}
        players={players}
      />

      {status.boardPicture ? (
        <ViewBoardPicture gameId={gameId} picture={status.boardPicture} />
      ) : (
        <ViewBoardPictureUpload gameId={gameId} />
      )}
    </>
  )
})
