import React, { useState, useEffect } from 'react';
import options from '../../assets/options.png'
import delete_img from '../../assets/delete.png'
import {Draggable } from '@hello-pangea/dnd';
import Modal from '../Modal/Modal'
import styles from './CardToDo.module.css'
import ModalDelete from '../../components/Modal/ModalDelete'
import { fetchData } from '/src/config.js';
 
const CardToDo = (props) => {
  const[isModalOpen,setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categorias,setCategorias] = useState([]);
  const [deleteCard,setDeleteCard] = useState(null);

  const formatDate = (date) => {
    if (date != null) {
      const newDate = new Date(date);
      return newDate.toISOString().split('T')[0];  
    }
    return '';
  };

  const handleDeleteClick = async (id) => {
    console.log("Id eliminar",id);
    setDeleteCard(id);
    setIsDeleteModalOpen(true);
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await fetchData('/api/categorias');
        setCategorias(data);
      } catch (error) {
        console.error('Error al cargar las categorías:', error);
      }
    };
    fetchCategorias();
  }, []);

  return (
    <Draggable draggableId={props.idx} index={props.index}>
      {(draggableProvided) => (
        <div className={styles.card_content}  {...draggableProvided.draggableProps} ref={draggableProvided.innerRef}>
        <div className={styles.card_design} style={{ backgroundColor: props.randomColor }}>
          <div className={styles.design_title}> 
            <div className={styles.card_row_description}>
              <span className={styles.circle}  {...draggableProvided.dragHandleProps}
                  style={{
                    backgroundColor:
                    (props.estado.toLowerCase() === "completado"
                      ? "green"
                      : props.estado.toLowerCase() === "en progreso"
                      ? "#FFD700"
                      : "red"),
                  border: '2px solid black' 
              }}></span>
              <p>{props.nombre_categoria}</p>
            </div>
            <img src={options} alt="optionsImg" className='SeleccionImg' onClick={()=>setIsModalOpen(true)}/>
            <Modal isOpen={isModalOpen} closeModal={()=> setIsModalOpen(false)} 
            categorias={categorias} setUpdate={()=>setUpdate(false)} fetchAndUpdateData={props.fetchAndUpdateData}
            tittle={props.titulo} descripcion={props.descripcion} inicio={formatDate(props.fecha_inicio)}
            estado={props.estado} selectCategoria={props.nombre_categoria} id={props.id} isEditing={true}
            categoria_id={props.categoria_id}></Modal>
          </div>

          <p className={styles.tittle_card}>{props.titulo}</p>  
          <p className={styles.description_card}>{props.descripcion} </p>

          <div className='deleteImg'>
            <img src={delete_img} alt="optionsImg" className='SeleccionImg' onClick={()=>handleDeleteClick(props.id)} />
          </div>  

          <ModalDelete isOpen={isDeleteModalOpen}  closeModal={() => setIsDeleteModalOpen(false)}
          fetchAndUpdateData={props.fetchAndUpdateData}deleteCard={deleteCard} />
          </div>
        </div>
        )}
      </Draggable>
  )
}

export default CardToDo