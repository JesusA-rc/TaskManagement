import React, { useEffect, useState } from "react";
import axios from 'axios';
import styles from './Modal.module.css'
import { API_BASE_URL } from '/src/config.js';

const Modal = ({isOpen,closeModal,categorias,fetchAndUpdateData,tittle,
  descripcion,inicio,estado,selectCategoria,id,isEditing,categoria_id
}) => {
  if(!isOpen) return null;
  const [formData, setFormData] = useState({
    titulo: tittle || "",  
    descripcion: descripcion || "",
    fecha_inicio: inicio || "",
    estado: estado || "",
    categoria_id: categoria_id || "",
    id: id || "",
  });

  const [warning,setWarning] = useState("");

  const handleChange = (e) => {
    if(warning!="")
      setWarning("");
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const verify_data_send = () =>{
    if (formData.titulo.length > 100) {
      setWarning("El título debe ser menor a 100 caracteres.");
      return false;
    }
  
    if (formData.descripcion.length > 299) {
      setWarning("La descripción debe ser menor a 300 caracteres.");
      return false;
    }
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!verify_data_send()){ return;}

    try {
      await axios.post(`${API_BASE_URL}/api/insert_tarea`,formData);
      fetchAndUpdateData();
      closeModal();
    } catch (error) {
      console.error('Error al guardar la tarea', error);
    }
  };

  const handleUpdate = async (e) =>{
    e.preventDefault();
    if(!verify_data_send()){ return;}

    try{
      await axios.post(`${API_BASE_URL}/api/actualizar_tarea`, formData);
      fetchAndUpdateData();
      closeModal();
    }catch (error){
      console.error('Error al actualizar la tarea',error);
    }
  } 

  return (
    <>
    <div className={styles.modal_overlay}> 
      <div className={styles.modal}>
        <div className={styles.container}>
          <button className={styles.close_btn} onClick={closeModal}>Close</button>
          
          <h2>Crear Tarea</h2>
          <div className={styles.error_warning}>
            <p>{warning}</p>
          </div>
          
          <form onSubmit={isEditing ? handleUpdate: handleSubmit} className={styles.form_main}>
            <div className={styles.form_group}>
              <label htmlFor="titulo">Título</label>
              <input type="text" id="titulo" name="titulo" value={formData.titulo} onChange={handleChange}required/>
            </div>

            <div className={styles.form_group}>
              <label htmlFor="descripcion">Descripción</label>
              <textarea id="descripcion" name="descripcion"value={formData.descripcion} onChange={handleChange} required/>
            </div>

            <div className={styles.form_group}>
              <label htmlFor="fecha_inicio">Fecha de Inicio</label>
              <input type="date" id="fecha_inicio" name="fecha_inicio" value={formData.fecha_inicio}onChange={handleChange}required/>
            </div>

            <div className={styles.form_group}>
              <label htmlFor="">Categoría</label>
              <select id="categoria_id" name="categoria_id" value={formData.categoria_id} onChange={handleChange}required >
                <option value="">Seleccione una categoría</option>
                {categorias.map((item,index)=>(
                  <option value={item.categoria_id} key={index}>{item.nombre_categoria}</option>
                ))};
              </select>
            </div>

            <div className={styles.form_group}>
              <label htmlFor="estado">Estado</label>
              <select name="estado" id="estado" value={formData.estado} onChange={handleChange}required>
              <option value="">Seleccione una categoría</option>
                <option value="en progreso">In progress</option>
                <option value="pendiente">Todo</option>
                <option value="completado">Done</option>
              </select>
            </div>

            <button type="submit" className={styles.submit_btn}>Guardar</button>
          </form>
        </div>
      </div>
    </div>
    </>
  )
}

export default Modal