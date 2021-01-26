import React, { FC, useMemo } from "react";
import { ActionLogItem } from "../queries/getGame";

type ActionLogProps = {
  actions: ActionLogItem[];
};

export const ActionLog: FC<ActionLogProps> = ({ actions }) => {

  const recentActions = useMemo(() => {
    if (actions.length < 3) {
      return actions;
    }
    return actions.slice(actions.length - 3);
  }, [actions]);

  const renderAction = (action: ActionLogItem, index: number) => {
    return (
      <p key={`action${index}`}>{action.message}</p>
    )
  }

  return (
    <>
      <p>ACTIVITY:</p>
      <div>
        {recentActions.map(renderAction)}
      </div>
    </>
  );
};