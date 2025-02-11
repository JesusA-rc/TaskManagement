import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import Search from '../../components/Search/Search';
import ToDo from '../../components/ToDo';
import CardToDo from '../../components/CardToDo/CardToDo';
import styles from './Board.module.css';
import {useMove} from '../../context/MoveContext';
import { API_BASE_URL,fetchData } from '/src/config.js';

const Board = () => {
  const [selectedOption, setSelectedOption] = useState("option1"); 
  const [randomColor, setRandomColor] = useState({});
  const [selectedSearch,setSelectedSearch ] = useState('');
  const [week,setWeek] = useState([]);
  const [month,setMonth] = useState([]);
  const [year,setYear] = useState([]);
  const [alltime,setAlltime] = useState([]);
  const [categories,setCategories] = useState([]);
  const [selectedCategorie,setSelectedCategorie]= useState('');
  const [boxes, setBoxes] = useState({
    box1: [],
    box2: [],
    box3: [],
  });

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await fetchData('/api/categorias'); 
        setCategories(data); 
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchCategorias();
  }, []);

  const { move, setMove } = useMove();
  useEffect(() => {
    if (move) {
      const timer = setTimeout(() => {
        setMove(false); 
      }, 500); 
      return () => clearTimeout(timer); 
    }
  }, [move, setMove]);

  const generateRandomColor = () => {
    let color = '#';

    for (let i = 0; i < 3; i++) {
      let colorValue = Math.floor(Math.random() * 76) + 180; 
      color += colorValue.toString(16).padStart(2, '0');
    }
    return color;
  };

  // Obtener datos
  const fetchAndUpdateData = () => {
      //WEEK
      axios.get(`${API_BASE_URL}/api/getCurrentWeekData?search=${selectedSearch}&categorie=${selectedCategorie}`).then((response)=>{
        setWeek(response.data);
      }).catch((error)=>{
        console.error("Error al obtener los datos:", error);
      });
      //MONTH
      axios.get(`${API_BASE_URL}/api/getCurrentMonthData?search=${selectedSearch}&categorie=${selectedCategorie}`).then((response)=>{
        setMonth(response.data);
      }).catch((error)=>{
        console.error("Error al obtener los datos:", error);
      });
      //YEAR
      axios.get(`${API_BASE_URL}/api/getCurrentYearData?search=${selectedSearch}&categorie=${selectedCategorie}`).then((response)=>{
        setYear(response.data);
      }).catch((error)=>{
        console.error("Error al obtener los datos:", error);
      });
      //All time
      axios.get(`${API_BASE_URL}/api/getAllData?search=${selectedSearch}&categorie=${selectedCategorie}`).then((response) => {
        setAlltime(response.data);
      }).catch((error)=>{
        console.error("Error al obtener los datos:", error);
      });
  };

    useEffect(() => {
      fetchAndUpdateData();
    }, [selectedSearch, selectedOption,selectedCategorie]);
    
    useEffect(() => {
        const filteredBoxes = {
          box1: filterByDate(selectedOption).filter(box => box.estado === "pendiente"),
          box2: filterByDate(selectedOption).filter(box => box.estado === "en progreso"),
          box3: filterByDate(selectedOption).filter(box => box.estado === "completado"),
        };
        
        setBoxes(filteredBoxes);
    }, [week, month, year,alltime, selectedOption,selectedSearch]);
      
async function updateEstado(itemId, newEstado,fecha_fin) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/update-estado`, {
      id: itemId,
      estado: newEstado,
      fecha_fin:fecha_fin
    });

    console.log('Estado actualizado:', response.data);
  } catch (error) {
    console.error('Error al hacer la solicitud:', error);
  }
}

function handleOnDragEnd(result) {
  const { source, destination } = result;
  if (!destination) return;

  // Si el origen y el destino son el mismo, no hacer nada
  if (source.droppableId === destination.droppableId && source.index === destination.index) return;

  const sourceBox = source.droppableId;
  const destinationBox = destination.droppableId;

  const newBoxes = { ...boxes };

  if (!newBoxes[sourceBox] || !newBoxes[destinationBox]) {
    console.error("Error en las cajas de origen o destino:", sourceBox, destinationBox);
    return;
  }

  // Eliminar el ítem arrastrado de la caja de origen
  const [draggedItem] = newBoxes[sourceBox].splice(source.index, 1);

  if (!draggedItem) {
    console.error("El ítem arrastrado es indefinido.");
    return;
  }

  // Insertar el ítem arrastrado en la nueva posición dentro de la caja de destino
  newBoxes[destinationBox].splice(destination.index, 0, draggedItem);

  let newEstado = '';
  if (destinationBox === "box1") {
    newEstado = "pendiente";  
  } else if (destinationBox === "box2") {
    newEstado = "en progreso";  
  } else if (destinationBox === "box3") {
    newEstado = "completado";  
  }

  if (!draggedItem.fecha_inicio || !draggedItem.estado) {
    console.error("Faltan propiedades en el item arrastrado:", draggedItem);
    return;
  }

  draggedItem.estado = newEstado;

  let fechaFin = null;
  if (destinationBox === "box1") {
    newEstado = "pendiente";
  } else if (destinationBox === "box2") {
    newEstado = "en progreso";
  } else if (destinationBox === "box3") {
    newEstado = "completado";
    fechaFin = new Date().toISOString().split('T')[0]; // Fecha actual
  }

  draggedItem.estado = newEstado;
  draggedItem.fecha_fin = fechaFin;

  setBoxes(newBoxes);
  updateEstado(draggedItem.id, newEstado,fechaFin);
}

const filterByDate = (selectedOption) => {
  switch (selectedOption) {
    case "option1": 
      return  week;
    case "option2": 
      return month;
    case "option3":
      return year;
    case "option4":
      return alltime;
    default: 
      return week;
  }
};

  useEffect(() => {
    const newColors = {};
  
    const allItems = [
      ...(Array.isArray(boxes.box1) ? boxes.box1 : []),
      ...(Array.isArray(boxes.box2) ? boxes.box2 : []),
      ...(Array.isArray(boxes.box3) ? boxes.box3 : []),
    ];
    
  
    allItems.forEach(item => {
      if (!randomColor[item.id]) {
        newColors[item.id] = generateRandomColor();
      }
    });
  
    if (Object.keys(newColors).length > 0) {
      setRandomColor(prevColors => ({
        ...prevColors,
        ...newColors, 
      }));
    }
  }, [boxes.box1, boxes.box2, boxes.box3]);
   
  return (
    <div>
      <div className={styles.main_content_board}>
        <Search selectedOption={selectedOption} setSelectedOption={setSelectedOption}
         selectedSearch={selectedSearch} setSelectedSearch={setSelectedSearch} categories={categories}
         setSelectedCategorie={setSelectedCategorie} selectedCategorie={selectedCategorie}  tittlePage='Board' addCategorie={true}/>
        <div className={styles.main_content_board_tasks}>
          <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="box1">
            {(droppableProvided) => (
              <ToDo name="To Do"  id="left" {...droppableProvided.droppableProps}  ref={droppableProvided.innerRef}
               fetchAndUpdateData={fetchAndUpdateData}>
                {boxes.box1.length > 0 ? (
                  boxes.box1.map((item, index) => (
                    <CardToDo key={item.id} idx={item.id.toString()} {...item} index={index}
                    fetchAndUpdateData={fetchAndUpdateData} randomColor={randomColor[item.id]}/>
                  ))
                ) : (
                  <p>No hay tareas en progreso.</p>
                )}
                {droppableProvided.placeholder}
              </ToDo>
            )}
          </Droppable>

        <Droppable droppableId="box2">
          {(droppableProvided) => (
            <ToDo name="In progress" id="left" {...droppableProvided.droppableProps}   ref={droppableProvided.innerRef}
            fetchAndUpdateData={fetchAndUpdateData}>
              {boxes.box2.length > 0 ? (
                boxes.box2.map((item, index) => (
                  <CardToDo key={item.id} idx={item.id.toString()} {...item} index={index}
                  fetchAndUpdateData={fetchAndUpdateData} randomColor={randomColor[item.id]}/>
                ))
              ) : (
                <p>No hay tareas en progreso.</p>
              )}
              {droppableProvided.placeholder}
            </ToDo>
          )}
        </Droppable>

        <Droppable droppableId="box3">
          {(droppableProvided) => (
            <ToDo name="Done" id="left" {...droppableProvided.droppableProps}   ref={droppableProvided.innerRef}
            fetchAndUpdateData={fetchAndUpdateData}>
              {boxes.box3.length > 0 ? (
                boxes.box3.map((item, index) => (
                  <CardToDo key={item.id} idx={item.id.toString()} {...item} index={index} 
                  fetchAndUpdateData={fetchAndUpdateData} randomColor={randomColor[item.id]}/>
                ))
              ) : (
                <p>No hay tareas en progreso.</p>
              )}
              {droppableProvided.placeholder}
            </ToDo>
          )}
        </Droppable>
        </DragDropContext>

        </div>
      </div> 
    </div>
  )
}

export default Board