import React, { useState, useEffect } from 'react';
import styles from './Search.module.css'
import search from '../../assets/search.png'


const Search = ({ selectedOption, setSelectedOption,selectedSearch,setSelectedSearch,tittlePage,today,categories,selectedCategorie,
  setSelectedCategorie,noCategory
 }) => {
  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleSelectChangeCategorie = (event) => {
    setSelectedCategorie(event.target.value);
  };

  const handleSelectedInput = (event) =>{
    setSelectedSearch(event.target.value);
  }

  return (
    <div className={styles.search_main}>
      <div className={styles.search}>
          <div className={styles.nav_search}>
              <img src={search} alt="searchImg" className={styles.search_img} />
              <input type="text" placeholder="Search..." className={styles.search_input} value={selectedSearch} onChange={handleSelectedInput}  />
          </div>
      </div>

      <div className={styles.board}>
        <div className={styles.board_left}>
          <h1>{tittlePage}</h1>
        </div>

        <div className={styles.board_right}>

          <select id={styles.board_select} name="board-options" value={selectedOption} onChange={handleSelectChange}>
          {today ? <option value="option0">Today</option> : ""}
            <option value="option1">This week</option>
            <option value="option2">This month</option>
            <option value="option3">This year</option>
            <option value="option4">All time</option>
          </select>

        <select name="" id={styles.board_select} value={selectedCategorie} onChange={handleSelectChangeCategorie}>
          
        <option value="">Selecciona una opcion</option>
          {categories.map((item) => (
            <option key={item.categoria_id} value={item.categoria_id}>
              {item.nombre_categoria}
            </option>
          ))}
          {noCategory ? <option value="is null">No categoria</option>: ""}
        </select>

        </div>
      </div>  

    </div>
  )
}

export default Search