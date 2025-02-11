import React, { useEffect, useState} from 'react';
import play from '../../assets/play.png'
import stop from '../../assets/stop.png'
import pause from '../../assets/pause.png'
import ModalTasks from '/src/components/Modal/ModalTasks'
import styles from './TrackerTime.module.css'
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import {useMove} from '../../context/MoveContext';
import ModalDelete from '../../components/Modal/ModalDelete'
import { API_BASE_URL } from '/src/config.js';

const TrackerTime= () => {
  const[isModalOpen,setIsModalOpen] = useState(false);
  const [today, setToday] = useState(new Date());
  const {isPlaying,setIsPlaying} = useMove();
  const [text,setText] = useState('');
  const [isDeleteModalOpen,setIsDeleteModalOpen] = useState(false);
  const { move, setMove } = useMove();
  const {timeTrack,setTimeTrack} = useMove();
  const [colors, setColors] = useState([]);
  const [categories,setCategories] = useState([]);
  const [categoriasPorTarea,setCategoriasPorTarea] = useState([]);
  const [timeTotalCategory,setTimeTotalCategory] = useState([]);
  const items = [
    { name: 'item1' },
    { name: 'item2' },
    { name: 'item3' },
    { name: 'item4' },
    { name: 'item5' },
    { name: 'item6' },
    { name: 'item7' },
    { name: 'item8' },
    { name: 'item9' },
    { name: 'item10' },
    { name: 'item11' },
    { name: 'item12' },
    { name: 'item13' },
    { name: 'item14' },
    { name: 'item15' },
    { name: 'item16' },
    { name: 'item17' },
    { name: 'item18' },
    { name: 'item19' },
    { name: 'item20' },
  ]


  useEffect(() => {
    if (move) {
      const timer = setTimeout(() => {
        setMove(false); 
      }, 500); 
      return () => clearTimeout(timer); 
    }
  }, [move, setMove]);

  const fetchAndUpdate = () =>{
    axios.get(`${API_BASE_URL}/api/categorias`).then((response) => {
      setCategories(response.data);
    })
    .catch((error) => {
      console.error('Error al cargar las categorías:', error);
    });

    axios.get(`${API_BASE_URL}/api/tareasPorCategoria`).then((response) => {
      setCategoriasPorTarea(response.data);
    })
    .catch((error) => {
      console.error('Error al cargar las tareas:', error);
    });
  }


  useEffect(() => {
    fetchAndUpdate();
    fetchTimers();
  }, []);

  const fetchTimers = () =>{
    axios.get(`${API_BASE_URL}/api/getTotalTimeByCategory`).then((response) => {
      setTimeTotalCategory(response.data);
    })
    .catch((error) => {
      console.error('Error al cargar los timers totales por categoria:', error);
    });
  };

  useEffect(() => {
    const generatedColors = items.map(() => generateRandomColor());
    setColors(generatedColors);
  }, []);
  //timer

  const pauseClock = () => {
    setIsPlaying(false);
  };

  const playClock = () => {
    setIsPlaying(true);
  };

  const stopClock = () => {
    setIsPlaying(false);
    setIsModalOpen(true)
  };

  const generateRandomColor = () => {
    let color = '#';
    for (let i = 0; i < 3; i++) {
      let colorValue = Math.floor(Math.random() * 76) + 180; 
      color += colorValue.toString(16).padStart(2, '0'); 
    }
    return color;
  };

  const handleCloseModal = (shouldStopPlaying) => {
    setIsModalOpen(false);  
    if (shouldStopPlaying) {
      setTimeTrack(0);
      setIsPlaying(false);  
      fetchTimers();
    }
  };

  function formatTime(readTime) {
    let hours = Math.floor(readTime / 3600); 
    const minutes = Math.floor((readTime % 3600) / 60); 
    const seconds = readTime % 60; 
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  }

  function padZero(number) {
    return (number < 10 ? "0" : "") + number;
  }

  const formattedDate = today.toLocaleDateString();

    const addCategorie = async () => { 
        try {
          if (text.trim() === '') return; 
          await axios.post(`${API_BASE_URL}/api/addCategory`, { nombre_categoria: text });
          setText(''); 
          fetchAndUpdate();
        } catch (error) {
          console.error('Error adding the categorie:', error);
        }
    };

  return (
    <div className={styles.main_content_tracker_timer}>
     <div className={styles.change_view}>
        <NavLink to="/TrackerTime" className={styles.navLink}>
            <p className={styles.selection_change_view}>Track time</p>
        </NavLink>
        <NavLink to="/TimeDetails" className={styles.navLink}>
            <p className={styles.selection_change_view}>Time details</p>
        </NavLink>
      </div>

      <div className={`${styles.main_content_time} ${move ? styles.slideRight : ''}`}>
      <h1 className={styles.tittle_page}>Tracker</h1>
      <div className={styles.tracker_row_content}>
        <div className={styles.clock}>
          <p className={styles.date}>{formattedDate}</p>
          <p className={styles.time}>{formatTime(timeTrack)}</p>
          <div className={styles.control_clock}>
            <img src={play} onClick={() => playClock()} className={styles.control_img} alt="play" />
            <img src={pause} onClick={() => pauseClock()} className={styles.control_img} alt="pause" />
            <img src={stop} onClick={() => stopClock()} className={styles.control_img} alt="stop" />
          </div>
        </div>


        <div className={styles.categories_tracker_main}>
        <input className={styles.add_categorie_text} onChange={(e)=>setText(e.target.value)} value={text} type="text" placeholder='categorie'/>
        <button className={styles.button_add_categorie} onClick={()=>addCategorie()}>Add categorie</button>

         <div key={-0} className={styles.categories_tracker_information} onClick={() => {setIsDeleteModalOpen(true)}}>
            <p>Delete category</p>
          </div>
          <div key={-1} className={styles.categories_tracker_information} onClick={() => {playClock();}}>
            <p>no project</p>
            <p>{formatTime(timeTotalCategory.find((item) => item.IdCategoria === null)?.TotalDuracion || "0")}</p>
          </div>
          {categories.map((card, index) => (
          <div  key={index} className={styles.categories_tracker_information} onClick={() => toggleClick(card.categoria_id,card.nombre_categoria)}
          style={{ backgroundColor: colors[index] }} >
            <p>{card.nombre_categoria}</p>
            <p>{formatTime(timeTotalCategory.find((item) => item.IdCategoria === card.categoria_id)?.TotalDuracion || 0)}</p>
          </div>
        ))}
        </div>

      </div>

      <ModalTasks isOpen={isModalOpen} categories={categories} categoriasPorTarea={categoriasPorTarea} 
       closeModal={handleCloseModal} time= {timeTrack}></ModalTasks>
      <ModalDelete isOpen={isDeleteModalOpen}  closeModal={() => setIsDeleteModalOpen(false)}
          fetchAndUpdateData={fetchAndUpdate}  categories={categories} />
    </div>
    </div>
  )
}

export default TrackerTime