import React, {useState,useEffect} from 'react';
import Modal from './Modal.module.css'
import axios from 'axios';
import { API_BASE_URL } from '/src/config.js';

const ModalTasks = ({isOpen,closeModal,categories,categoriasPorTarea,time}) => {
  if(!isOpen) return null;

    const [formData, setFormData] = useState({
      nombre_categoria:  "",  
      categoria_id: "",
      tarea: "", 
      id_Tarea: "",
    });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const tareasFiltradas = categoriasPorTarea.filter(
    (item) => item.categoria_id === parseInt(formData.categoria_id)
  );

  const handleUpdate = async (e) =>{
    e.preventDefault();

    const categoriaId = (formData.categoria_id === "" || formData.categoria_id == null) ? null : formData.categoria_id;
    const IdTarea = (formData.id_Tarea === "" || formData.id_Tarea == null) ? null : formData.id_Tarea;
    console.log("tarea id insertada: ", IdTarea);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/insertTime`, {
        IdTarea: IdTarea,
        IdCategoria: categoriaId,
        Duration: time,
        Date: new Date().toISOString().split('T')[0]
      });
  
      console.log('Estado actualizado:', response.data);
    } catch (error) {
      console.error('Error al hacer la solicitud:', error);
    }

    closeModal(true);
  }


  return (
    <div className={Modal.modal_overlay}>
      <div className={Modal.modal}>
        <div className={Modal.container}>
          <button className={Modal.close_btn} onClick={()=>closeModal(false)}>Close</button>
          <h2>Save time {time}</h2>
          <form className={Modal.form_main} onSubmit={handleUpdate}>

          <div className={Modal.form_group}>
              <label htmlFor="">Categoría</label>
              <select id="categoria_id" name="categoria_id" value={formData.categoria_id} onChange={handleChange}>
                <option value="">Sin proyecto</option>
                {categories.map((item,index)=>(
                  <option value={item.categoria_id} key={index}>{item.nombre_categoria}</option>
                ))};
              </select>
            </div>

           <div className={Modal.form_group}>
              <label htmlFor="id_Tarea">Tareas</label>
              <select id="id_Tarea" name="id_Tarea" value={formData.id_Tarea} onChange={handleChange}
               required={formData.categoria_id ? true : false}>
              {!formData.categoria_id ? <option value="">Sin tarea</option> : <option value="">Seleccione una tarea</option>}
                {tareasFiltradas.length > 0 ? (
                  tareasFiltradas.map((item, index) => (
                    <option value={item.id} key={index}> 
                      {item.titulo}
                    </option>
                  ))
                ) : (
                  formData.categoria_id && <option value="">No hay tareas disponibles</option>
                )}
              </select>
          </div>

            <button type="submit" className={Modal.submit_btn}>Guardar</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ModalTasks