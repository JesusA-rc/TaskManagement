import React, { useEffect, useState,forwardRef, useRef } from "react"
import Modal from './Modal/Modal'
import Add from '../assets/Add.png'
import options from '../assets/options.png'
import axios from 'axios';
import { API_BASE_URL } from '/src/config.js';

const ToDo= forwardRef(({ children,setUpdate,fetchAndUpdateData,  ...props }, ref) => {
  const[isModalOpen,setIsModalOpen] = useState(false);
  const [categorias,setCategorias] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/categorias`)
      .then((response) => {
        setCategorias(response.data);
      })
      .catch((error) => {
        console.error('Error al cargar las categorías:', error);
      });
  }, []);

  return (
    <div className="content-cards" ref={ref} {...props}>
      <div className="ToDo">
        <div className="ToDo-left">
          <p className="tittle-category-card">{props.name}</p>
        </div>
        <div className="ToDo-right">
          <img src={Add} alt="AddImg characs-img" className="SeleccionImg"
          onClick={()=>setIsModalOpen(true)} />
          <img src={options} alt="optionsImg" className="SeleccionImg" />
          <Modal isOpen={isModalOpen} closeModal={()=> setIsModalOpen(false)} 
          categorias={categorias} setUpdate={()=>setUpdate(false)} fetchAndUpdateData={fetchAndUpdateData}
          isEditing={false}></Modal>
        </div>
      </div>
      
      <div className="ChildrenContainer">
        {children}
     </div>
    </div>
  )
});

export default ToDo
