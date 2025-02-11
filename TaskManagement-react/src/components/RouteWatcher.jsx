import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMove } from '../context/MoveContext'; 

const RouteWatcher = () => {
  const { setMove } = useMove();
  const location = useLocation(); 

  useEffect(() => {
    console.log(location.pathname);

    if (location.pathname !== '/TrackerTime') {
      setMove(false);
    }
  }, [location, setMove]); 

  return null; 
};

export default RouteWatcher;
