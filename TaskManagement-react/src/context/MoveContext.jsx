import React, { createContext, useState, useEffect, useContext } from 'react';

const MoveContext = createContext();

//Maneja los valores del timer de manera global.

export const MoveProvider = ({ children }) => {
  const [move, setMove] = useState(false);
  const [timeTrack, setTimeTrack] = useState(0);
  const [isPlaying,setIsPlaying] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('move', JSON.stringify(move));
  }, [move]);

  useEffect(()=>{
    sessionStorage.setItem('timeTrack',JSON.stringify(timeTrack));
  },[timeTrack,isPlaying]);

  useEffect(()=>{
    sessionStorage.setItem('isPlaying',JSON.stringify(isPlaying));
  },[isPlaying]);

    useEffect(() => {
      let intervalId;
      if (isPlaying) {
        intervalId = setInterval(() => {
          setTimeTrack(prevTime => prevTime +1);
        }, 1000);
      } else {
        clearInterval(intervalId); 
      }
    
      return () => clearInterval(intervalId); 
    }, [isPlaying]); 

  return (
    <MoveContext.Provider value={{ move, setMove,timeTrack,setTimeTrack,isPlaying,setIsPlaying}}>
      {children}
    </MoveContext.Provider>
  );
};

export const useMove = () => {
  return useContext(MoveContext);
};
