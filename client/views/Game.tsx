import React, { FC, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { PlayerContext } from "../contexts/Player";
import { useMutation, useQuery } from "@apollo/client";
import { Card, GetGameResponse, GET_GAME } from "../queries/getGame";
import { SUBSCRIBE_TO_GAME } from "../subscriptions/game";
import { Portal } from "./Portal";
import { PlayerHand } from "../components/PlayerHand";
import { PlayingCard } from "../components/PlayingCard";
import { PlayTurnArgs, PLAY_TURN } from "../mutations/playTurn";
//import { scumHistory } from "./Main";


/**
 * TODO: Idea for pausing on cards played before clearing the active pile...
 * Use the subscribe to more function to check whether the pile was cleared and if so...
 * ...take the last turn played and display it as the active pile for a fixed number of seconds
 */

type GameViewParams = {
  gameId?: string;
};

export const Game: FC = () => {

  const { gameId } = useParams<GameViewParams>();

  const playerContext = useContext(PlayerContext);

  if (!playerContext?.player) {
    return (
      <Portal />
    );
  }
  
  const { subscribeToMore, data, loading: gameDataLoading } = useQuery<GetGameResponse, { id: string }>(GET_GAME, {
    variables: {
      id: gameId!,
    },
  });

  subscribeToMore({
    document: SUBSCRIBE_TO_GAME,
    variables: { id: gameId },
  });

  const [playTurn, { loading: playTurnLoading, error: playTurnError }] = useMutation<boolean, PlayTurnArgs>(PLAY_TURN);

  const handlePlayTurn = async (cards?: Card[]) => {
    console.log("client cards: ", cards);
    const variables: PlayTurnArgs = {
      playerId: playerContext.player!.id,
      gameId: data!.game.id,
      cardsToPlay: cards?.map(c => c.alias),
    };
    await playTurn({ variables });
  };

  const activeRound = data?.game.rounds?.find(r => r.isActive);

  const playerHand = activeRound?.hands.find(h => h.playerId === playerContext?.player?.id);

  const previousTurn = useMemo(() => {
    if (!activeRound || !activeRound.activePile || activeRound.activePile.length < 1) {
      return undefined;
    }
    return activeRound.activePile[activeRound.activePile.length - 1];
  }, [data?.game]);

  const renderActivePile = () => {
    const turn = previousTurn;
    if (!turn) {
      return (<p>Pile is empty...</p>);
    }
    return turn.cards.map(card => {
      return (
        <>
          <PlayingCard
            card={card}
          />
        </>
      );
    });
  }


  if (gameDataLoading || playTurnLoading) {
    return <p>Loading...</p>;
  }

  if (playTurnError) {
    return <p>An error occurred playing turn...</p>;
  }

  if (data && data.game) {
    return (
      <>
        {activeRound && renderActivePile()}
        <PlayerHand
          name={playerContext.player.name}
          cards={playerHand?.cards}
          turnInProgress={!!playerHand?.isActive}
          playToBeat={previousTurn?.cards}
          onPlayTurn={handlePlayTurn}
          powerCard={data.game.gameConfig.powerCardAlias}
        />
      </>
    );  
  }

  return <p>idk what's wrong</p>;

};