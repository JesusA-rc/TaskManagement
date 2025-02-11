import React, { useTransition,useEffect,useState } from 'react'
import styles from './TrackerTime.module.css'
import NavChangeView from '/src/components/SidebarNav/SidebarNav.module.css'
import DoughnutChart from '../../components/DoughnutChart';
import { data, NavLink } from 'react-router-dom';
import {useMove} from '../../context/MoveContext';
import Search from '../../components/Search/Search';
import ModalDelete from '../../components/Modal/ModalDelete'
import axios from 'axios';
import { API_BASE_URL } from '/src/config.js';

const TimeDetails = () => {
const { move, setMove } = useMove();
const [selectedSearch,setSelectedSearch ] = useState('');
const [isModalOpen,setIsModalOpen] = useState(false);
const [selectedOption, setSelectedOption] = useState("option0"); 
const [deleteTime,setDeleteTime] = useState(null);
const [dataTableDate,setDataTable] = useState("today");
const [timeTotal,setTimeTotal] = useState(0);
const [categories,setCategories] = useState([]);
const [selectedCategorie,setSelectedCategorie]= useState('');
const [tasks, setTasks] = useState({
  today: [],
  week: [],
  month: [],
  year: [],
  allTime: [],
});

useEffect(() => {
  axios.get(`${API_BASE_URL}/api/categorias`).then((response) => {
    setCategories(response.data);
  }).catch((error) => {
    console.error('Error al obtener los datos:', error);
  });
}, []);

useEffect(() => {
  const optionMapping = {
    option0: "today",
    option1: "week",
    option2: "month",
    option3: "year",
    option4: "allTime",
  };
  setDataTable(optionMapping[selectedOption]);
  fetchAndUpdateData();
}, [selectedOption,selectedSearch,selectedCategorie]);

const fetchAndUpdateData = () => {
  axios.get(`${API_BASE_URL}/api/getTimersForCurrentDay?search=${selectedSearch}&categorie=${selectedCategorie}`).then((response) => {
    setTasks((prevState) => ({ ...prevState, today: response.data }));
  })
  .catch((error) => {
    console.error('Error loading the timers inserted for today:', error);
  })

  axios.get(`${API_BASE_URL}/api/getTimersForCurrentWeek?search=${selectedSearch}&categorie=${selectedCategorie}`).then((response) => {
    setTasks((prevState) => ({ ...prevState, week: response.data }));
  })
  .catch((error) => {
    console.error('Error loading the timers inserted:', error);
  })

  axios.get(`${API_BASE_URL}/api/getTimersForCurrentMonth?search=${selectedSearch}&categorie=${selectedCategorie}`).then((response) => {
    setTasks((prevState) => ({ ...prevState, month: response.data }));
  })
  .catch((error) => {
    console.error('Error loading the timers inserted:', error);
  })

  axios.get(`${API_BASE_URL}/api/getTimersForCurrentYear?search=${selectedSearch}&categorie=${selectedCategorie}`).then((response) => {
    setTasks((prevState) => ({ ...prevState, year: response.data }));
  })
  .catch((error) => {
    console.error('Error loading the timers inserted:', error);
  })

  axios.get(`${API_BASE_URL}/api/getAllTimers?search=${selectedSearch}&categorie=${selectedCategorie}`).then((response) => {
    setTasks((prevState) => ({ ...prevState, allTime: response.data }));
  })
  .catch((error) => {
    console.error('Error loading the timers inserted:', error);
  })

}

useEffect(() => {
  let sum = 0;
    tasks[dataTableDate].forEach((item) => {
      sum += item.duracion;
    });
  setTimeTotal(sum);
}, [dataTableDate, tasks]);

useEffect(() => {
  fetchAndUpdateData();
}, []);

useEffect(() => {
    if (!move) {
      const timer = setTimeout(() => {
        setMove(true); 
      }, 500); 
      return () => clearTimeout(timer); 
    }
  }, [move, setMove]);
    
  const toggleDeleteTime =  (id) =>{
    setDeleteTime(id);
    setIsModalOpen(true);
  }
  
  function formatTime(readTime) {
    let hours = Math.floor(readTime / 3600); 
    const minutes = Math.floor((readTime % 3600) / 60); 
    const seconds = readTime % 60; 
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  }

  function padZero(number) {
    return (number < 10 ? "0" : "") + number;
  }

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
    <div>

    </div>
      
     <div className={`${styles.main_content_time} ${!move ? styles.slideLeft :''}`}>
      <div className={styles.content_graph}>
          <div className={styles.chartContainer}>
            <DoughnutChart />
          </div>
      </div>

        <Search setSelectedSearch={setSelectedSearch} selectedSearch={selectedSearch} selectedOption={selectedOption}
       setSelectedOption={setSelectedOption} setSelectedCategorie={setSelectedCategorie} selectedCategorie={selectedCategorie}
        today={true} categories={categories} noCategory={true}/>

        <div className={styles.total_time}>
            <p>Time total: {formatTime(timeTotal)}</p>
        </div>

        <div className={styles.tasks_table}>
          <table>
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Nombre categoria</th>
                <th>Duracion</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
                {tasks[dataTableDate]?.length > 0 ? (
              tasks[dataTableDate].map((task, index) => (
                <tr key={index}>
                  <td data-tittle="Titulo">{task.titulo || "no tarea"}</td>
                  <td data-tittle="Categoria">{task.nombre_categoria || "no categoria"}</td>
                  <td data-tittle="Duracion">{formatTime(task.duracion)} </td>
                  <td data-tittle="Fecha">{new Date(task.fecha).toLocaleDateString()}</td>
                  <td data-tittle="Borrar" >
                    <button className={styles.delete_button} onClick={()=>toggleDeleteTime(task.IdTracker)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No hay tareas disponibles</td>
              </tr>
            )}
            </tbody>
          </table>
        </div>

        <ModalDelete isOpen={isModalOpen} closeModal={()=> setIsModalOpen(false)}  setIsModalOpen={setIsModalOpen}
         fetchAndUpdateData={fetchAndUpdateData} deleteTime={deleteTime}></ModalDelete>

      </div>
    </div>
  )
}

export default TimeDetails