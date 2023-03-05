import React from 'react'

import { SkeletonRect } from '../Skeleton'
import { range } from '../utils'

import { PlayerItem, PlayersList, StartGameForm } from './StartGameLayout'

export const StartGameSkeleton: React.FC = () => (
  <StartGameForm footer={<SkeletonRect width="100%" height="42px" />}>
    <PlayersList>
      {range(0, 6).map((_, index) => (
        <PlayerItem key={index}>
          <SkeletonRect className="flex-shrink-0" width="40px" height="40px" />
          <SkeletonRect width="100%" height="40px" />
        </PlayerItem>
      ))}
    </PlayersList>
  </StartGameForm>
)
