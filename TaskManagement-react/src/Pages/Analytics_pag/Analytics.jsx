import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import axios from 'axios';
import BarChart from '../../components/BarChart';
import Search from '../../components/Search/Search';
import styles from './Analytics.module.css';
import { fetchData, API_BASE_URL } from '/src/config.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const Analytics = () => {

  const [estadoData, setEstadoData] = useState([]);
  const [tareas,setTareas] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [initialTasks,setInitialTasks] = useState([])
  const [selectedSearch,setSelectedSearch ] = useState('');
  const [selectedOption, setSelectedOption] = useState("option1"); 
  const [categories,setCategories] = useState([]);
  const [selectedCategorie,setSelectedCategorie] = useState('');
  const [data, setData] = useState({
    week: [],
    month: [],
    year: [],
    alltime: [],
  });

  const filterByState = (state)=>{
    if (state === null) {
      setTareas(initialTasks);
    } else if (state === 0) {
      setTareas(initialTasks.filter((item) => item.estado === "completado"));
    } else if (state === 1) {
      setTareas(initialTasks.filter((item) => item.estado === "pendiente"));
    } else if (state === 2) {
      setTareas(initialTasks.filter((item) => item.estado === "en progreso"));
    }
  };

  const formatDate = (date) => {
    if (date != null) {
      const newDate = new Date(date);
      return newDate.toISOString().split('T')[0];  
    }
    return '';
  };

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const data = await fetchData('/api/estadisticas');
        setEstadoData(data); 
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
    fetchEstadisticas();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchData('/api/categorias'); 
        setCategories(data);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchDataCurrent = async (endpoint, key) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/${endpoint}?search=${selectedSearch}&categorie=${selectedCategorie}`);
        setData((prev) => ({...prev,
        [key]: response.data,
      }));
    } catch (error) {
      console.error(`Error al obtener los datos de ${key}:`, error);
    }
  };

  const fetchAndUpdateData = () => {
    const endpoints = [
      { key: "week", endpoint: "getCurrenWeekTareas" },
      { key: "month", endpoint: "getCurrenMonthTareas" },
      { key: "year", endpoint: "getCurrenYearTareas" },
      { key: "alltime", endpoint: "getTareasAllTime" },
    ];

    endpoints.forEach(({ key, endpoint }) => fetchDataCurrent(endpoint, key));
  };

  useEffect(() => {
    fetchAndUpdateData();
  }, [selectedOption,selectedSearch,selectedCategorie]);
    
  useEffect(() => {
    const nuevasTareas = filterByDate(selectedOption);
    setTareas(nuevasTareas);
    setInitialTasks(nuevasTareas);
  }, [data.week, data.month, data.year, data.alltime, selectedOption]);

  const filterByDate = (selectedOption) => {
    setSelectedFilter(null);
    filterByState(selectedFilter);
    switch (selectedOption) {
      case "option1":
        return data.week;
      case "option2":
        return data.month;
      case "option3":
        return data.year;
      case "option4":
        return data.alltime;
      default:
        return data.week;
    }
  };
  

  // Transformar los datos para la gráfica de pastel
  const estadoCounts = estadoData.reduce((acc, item) => {
    const { estado } = item;
    acc[estado] = acc[estado] ? acc[estado] + 1 : 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(estadoCounts),
    datasets: [
      {
        data: Object.values(estadoCounts),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverOffset: 20,
      },
    ],
  };
  
    const options = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        tooltip: {
          enabled: true, 
        },
      },
    };

  return (
    <div className={styles.Main_content_analytics}>
      <h1>Analytics</h1>
      <div className={styles.main_content_graphics}>
        <div className={styles.graphics}>
          <Pie data={chartData} className={styles.graphics_size} options={options}/>
          <p>Estado de las tareas</p>
        </div>
        <div className={styles.states_categories}>
          <BarChart></BarChart>
        </div>
      </div>

      <Search setSelectedSearch={setSelectedSearch} selectedSearch={selectedSearch} selectedOption={selectedOption}
       setSelectedOption={setSelectedOption} selectedCategorie={selectedCategorie} setSelectedCategorie={setSelectedCategorie}
        categories={categories}/>

      <div className={styles.filters_tasks}>
      {['Completado', 'Pendiente', 'En progreso'].map((nameButton, index) => (
        <button key={index} className={`${styles.filter_buttons} ${selectedFilter === index ? styles.selected : ''}`}
        onClick={() => {const newFilter = selectedFilter === index ? null : index;  setSelectedFilter(newFilter); filterByState(newFilter) }}>
          {nameButton}
        </button>
      ))}
      </div>

      <div className={styles.tasks_table}>
        <table>
          <thead>
            <tr>
              <th>Titulo</th>
              <th>Descripcion</th>
              <th>Comienzo</th>
              <th>Termino</th>
              <th>Categoria</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
          {tareas.map((tarea, index) => (
              <tr key={index}>
                <td data-tittle="titulo">{tarea.titulo}</td>
                <td data-tittle="Descripcion">{tarea.descripcion}</td>
                <td data-tittle="Comienzo">{formatDate(tarea.fecha_inicio)}</td>
                <td data-tittle="Termino">{formatDate(tarea.fecha_fin)}</td>
                <td data-tittle="Categoria">{tarea.nombre_categoria}</td>
                <td data-tittle="Estado">{tarea.estado}</td>
              </tr>
            ))}
            </tbody>
        </table>
      </div>

    </div>
  )
}

export default Analytics