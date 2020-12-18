import React, { FC, useState } from "react";

export const Main: FC = () => {
  const [state, setState] = useState(0);
  const handleClick = () => {
    setState(state + 1);
  }
  return (
    <div>
      Hello, world...
      You have clicked the button {state} times.
      <div onClick={handleClick}>
        THE BUTTON
      </div>
    </div>
  );
};