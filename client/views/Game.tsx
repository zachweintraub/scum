import React, { FC, useContext } from "react";
import { useParams } from "react-router-dom";
import { PlayerContext } from "../contexts/Player";
import { useQuery } from "@apollo/client";
import { GetGameResponse, GET_GAME } from "../queries/getGame";
import { SUBSCRIBE_TO_GAME } from "../subscriptions/game";
//import { scumHistory } from "./Main";

type GameViewParams = {
  gameId?: string;
};

export const Game: FC = () => {

  const { gameId } = useParams<GameViewParams>();

  // const playerContext = useContext(PlayerContext);

  // if (!playerContext?.player) {
  //   scumHistory.replace("/");
  // }
  
  const { subscribeToMore, data, loading } = useQuery<GetGameResponse, { id: string }>(GET_GAME, {
    variables: {
      id: gameId!,
    },
  });

  subscribeToMore({
    document: SUBSCRIBE_TO_GAME,
    variables: { id: gameId },
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) {
        return prev;
      }      
      const newFeedItem = subscriptionData.data.commentAdded;
      return Object.assign({}, prev, {
        post: {
          comments: [newFeedItem, ...prev.post.comments]
        }
      });
    }
  });





  if (loading) {
    return <p>Loading...</p>;
  }

  if (data && data.game) {
    return <div>GAME: {data.game.name}</div>;
  }

  return <p>idk what's wrong</p>;

};