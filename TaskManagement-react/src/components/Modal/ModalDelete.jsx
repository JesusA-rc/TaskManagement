import React, { useEffect, useState } from "react";
import axios from 'axios';
import styles from './Modal.module.css'
import { API_BASE_URL } from '/src/config.js';


const ModalDelete = ({isOpen,closeModal,fetchAndUpdateData,deleteTime,deleteCard,categories}) => {

  if(!isOpen ) return null;

  const [deleteCategory,setDeleteCategory] = useState(null);

  const handleSubmit = async (e) => {
      console.log("delete",deleteCard);
      e.preventDefault();
      if(deleteTime){
      try {
          await axios.get(`${API_BASE_URL}/api/deleteTimer?id=${deleteTime}`);
          fetchAndUpdateData();
          } catch (error) {
            console.error('Error eliminando el timer', error);
          }
      }

      if(deleteCard){
          try {
              const response = await axios.post(`${API_BASE_URL}/api/eliminar`, {
                id: deleteCard
              });
              if (response.status === 200) {
                  fetchAndUpdateData();
              }
            } catch (error) {
              console.error('Error eliminando la tarea ', error);
            }
      }

      if(deleteCategory){
        try {
          await axios.get(`${API_BASE_URL}/api/deleteCategory?categoria_id=${deleteCategory}`);
          fetchAndUpdateData();
        } catch (error) {
          console.error('Error eliminando la categoria ',error);
        }

      }
      closeModal();
    };

  return (
        <div className={styles.modal_overlay}> 
          <div className={styles.modal}>
            <div className={styles.container}>
              <button className={styles.close_btn} onClick={closeModal}>Cancel</button>
              <h2>{categories ? 'Select a category to delete':'Are you sure you want to delete this?'}</h2>
              
               <form onSubmit={handleSubmit} className={styles.form_main} onChange={(e) => setDeleteCategory(e.target.value)}  >
                {
                  categories ? 
                  <select name="" id="" required>
                    <option value="">Select a categorie</option>
                    {
                      categories.map((item)=>(
                        <option value={item.categoria_id} key={item.categoria_id}>{item.nombre_categoria}</option>
                      ))
                    }
                  </select>
                  : ''
                }
                <button type="submit" className={styles.submit_btn}>Delete</button>
              </form>
            </div>
          </div>
        </div>
  )
}

export default ModalDelete