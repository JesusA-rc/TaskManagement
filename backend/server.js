// backend/server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3307;


// Habilitar CORS
app.use(cors());
app.use(express.json());

// Configurar la conexión con MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,
});

// Conectar a MySQL
db.connect((err) => {
  if (err) {
    console.error('Error de conexión a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL');
});

app.get('/api/usuario/:id', (req, res) => {
  const userId = req.params.id; 
  const query = 'SELECT * FROM Usuarios WHERE id = ?';

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      res.status(500).send('Error en la consulta');
      return;
    }
    res.json(results[0] || { message: 'Usuario no encontrado' });
  });
});

app.get('/api/enprogreso', (req, res) => {
  const { search } = req.query; 
  
  let query = 'SELECT ep.id, titulo, ep.descripcion, ep.colaboradores, c.nombre_categoria, ep.estado, ep.fecha_inicio,c.categoria_id ' +
              ' FROM tareas ep ' +
              'JOIN  c ON ep.categoria_id = c.categoria_id ';
  
    query += 'WHERE ep.titulo LIKE ? OR ep.descripcion LIKE ?';
    db.query(query, [`%${search}%`, `%${search}%`], (err, results) => {
      if (err) {
        console.error('Error en la consulta:', err);
        res.status(500).send('Error en la consulta');
        return;
      }
      const box1 = results.filter(item => item.estado === 'pendiente');
      res.json(results); 
    });
  
});



app.post('/api/update-estado', (req, res) => {
  const { id, estado, fecha_fin } = req.body;

  if (!id || !estado) {
    return res.status(400).json({ error: 'ID y estado son requeridos' });
  }

  const query = 'UPDATE tareas SET estado = ?, fecha_fin = ? WHERE id = ?';
  db.query(query, [estado, fecha_fin, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar el estado:', err);
      return res.status(500).json({ error: 'Error al actualizar el estado' });
    }
    res.json({ message: 'Estado actualizado correctamente' });
  });
});


app.get('/api/estadisticas', (req, res) => {
  db.query('SELECT estado FROM tareas', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/api/getTareasAllTime', (req, res) => {
  const { search, categorie } = req.query;

  let query = `
    SELECT ep.titulo, ep.descripcion, ep.estado, c.nombre_categoria, ep.fecha_inicio, ep.fecha_fin 
    FROM tareas ep 
    JOIN categorias c ON ep.categoria_id = c.categoria_id
  `;
  const params = [];

  if (search || categorie) {
    query += ' WHERE '; 
  }

  let conditionsAdded = false;

  if (search) {
    query += 'ep.titulo LIKE ?';
    params.push(`%${search}%`);
    conditionsAdded = true;
  }

  if (categorie) {
    if (conditionsAdded) {
      query += ' AND '
    }
    query += 'ep.categoria_id = ?';
    params.push(categorie);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      return res.status(500).json({ error: 'Error en la consulta' });
    }
    res.json(results);
  });
});

app.get('/api/getCurrenWeekTareas', (req, res) => {
  const { search, categorie } = req.query;
  let query = 'SELECT ep.titulo, ep.descripcion, ep.estado, c.nombre_categoria, ep.fecha_inicio, ep.fecha_fin ' +
              'FROM tareas ep JOIN categorias c ON ep.categoria_id = c.categoria_id ' +
              'WHERE WEEK(ep.fecha_inicio, 1) = WEEK(CURDATE(), 1) ';

  const params = [];
  if (search) {
    query += ' AND (ep.titulo LIKE ?)';
    params.push(`%${search}%`);
  }

  if (categorie) {
    query += ' AND ep.categoria_id = ?';
    params.push(categorie);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      res.status(500).send('Error en la consulta');
      return;
    }
    res.json(results);
  });
});


app.get('/api/getCurrenMonthTareas',(req,res)=>{
  const { search,categorie } = req.query;
  let query = 'SELECT ep.titulo, ep.descripcion, ep.estado, c.nombre_categoria, ep.fecha_inicio,ep.fecha_fin FROM tareas' + ' ' +
    'ep JOIN categorias c ON ep.categoria_id = c.categoria_id WHERE MONTH(fecha_inicio) = MONTH(CURDATE()) ';
  const params= [];
  
  if (search) {
    query += ' AND (ep.titulo LIKE ?)';
    params.push(`%${search}%`);
  }

  if (categorie){
    query += ' AND ep.categoria_id = ?';
    params.push(categorie);
  }
  db.query(query,params,(err,results)=>{
    if(err) throw err;
    res.json(results);
  })
});

app.get('/api/getCurrenYearTareas',(req,res) =>{
  const {search,categorie} = req.query;
  let query = 'SELECT ep.titulo, ep.descripcion, ep.estado, c.nombre_categoria, ep.fecha_inicio,ep.fecha_fin FROM tareas' + ' ' +
    'ep JOIN categorias c ON ep.categoria_id = c.categoria_id WHERE YEAR(fecha_inicio) = YEAR(CURDATE()) ';
    const params = [];
    if (search) {
      query += ' AND (ep.titulo LIKE ?)';
      params.push(`%${search}%`);
    }
  
    if (categorie){
      query += ' AND ep.categoria_id = ?';
      params.push(categorie);
    }
    db.query(query,params,(err,results)=>{
      if(err) throw err;
      res.json(results);
    }) 
});

app.get('/api/tareasCondicion',(req,res)=>{
  db.query('SELECT c.nombre_categoria, ep.estado, COUNT(*) AS cantidad FROM tareas ep JOIN categorias c ON ep.categoria_id = c.categoria_id'+ 
    ' GROUP BY c.nombre_categoria, ep.estado;',(err,results)=>{
      if(err) throw err;
      res.json(results);
    });
});

app.get('/api/categorias',(req,res) =>{
  db.query('select nombre_categoria,categoria_id from categorias;',(err,results)=>{
    if(err) throw err;
    res.json(results);
  });
});

app.get('/api/tareasPorCategoria',(req,res)=>{
  db.query('select c.categoria_id, c.nombre_categoria, t.titulo, t.id from categorias c INNER JOIN ' + ' ' +
    ' tareas t on t.categoria_id = c.categoria_id;',(err,results)=>{
    if(err) throw err;
    res.json(results);
  })
});


app.get('/api/getCurrentWeekData', (req, res) => {
  const { search,categorie } = req.query; 
  let query = `SELECT t.id, t.titulo, t.descripcion, t.fecha_inicio, t.fecha_fin, t.categoria_id, t.estado, c.nombre_categoria 
  FROM tareas t INNER JOIN categorias c ON c.categoria_id = t.categoria_id WHERE WEEK(t.fecha_inicio, 1) = WEEK(CURDATE(), 1) 
  AND YEAR(t.fecha_inicio) = YEAR(CURDATE()) `;
  const params = [];
  if (search) {
    query += ' AND (titulo LIKE ?) ';
    params.push(`%${search}%`);
  }

  if (categorie){
    query += ' AND t.categoria_id = ?';
    params.push(categorie);
  }

  db.query(query,params, (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      res.status(500).send('Error en la consulta');
      return;
    }
    res.json(results);
  });
});

app.get('/api/getCurrentMonthData', (req, res) => {
  const { search, categorie } = req.query;

  let query = `
    SELECT t.*, c.nombre_categoria 
    FROM tareas t 
    INNER JOIN categorias c ON c.categoria_id = t.categoria_id
    WHERE MONTH(t.fecha_inicio) = MONTH(CURDATE())
  `;
  const params = [];

  if (search) {
    query += ' AND (titulo LIKE ?)';
    params.push(`%${search}%`);
  }
  if (categorie) {
    query += ' AND t.categoria_id = ?';
    params.push(categorie); 
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      res.status(500).send('Error en la consulta');
      return;
    }
    res.json(results);
  });
});


app.get('/api/getCurrentYearData', (req, res) => {
  const { search, categorie } = req.query;

  let query = `
    SELECT t.*, c.nombre_categoria 
    FROM tareas t 
    INNER JOIN categorias c ON c.categoria_id = t.categoria_id
    WHERE YEAR(t.fecha_inicio) = YEAR(CURDATE())
  `;
  const params = [];

  if (search) {
    query += ' AND (titulo LIKE ? OR descripcion LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (categorie) {
    query += ' AND t.categoria_id = ?';
    params.push(categorie);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      res.status(500).send('Error en la consulta');
      return;
    }
    res.json(results);
  });
});

app.get('/api/getAllData', (req, res) => {
  const { search, categorie } = req.query;

  let query = `
    SELECT t.*, c.nombre_categoria 
    FROM tareas t 
    INNER JOIN categorias c ON c.categoria_id = t.categoria_id
  `;
  const params = [];

  if (search || categorie) {
    query += ' WHERE ';
  }

  let conditionsAdded = false;

  if (search) {
    query += 't.titulo LIKE ?';
    params.push(`%${search}%`);
    conditionsAdded = true;
  }

  if (categorie) {
    if (conditionsAdded) {
      query += ' AND ';
    }
    query += 't.categoria_id = ?';
    params.push(categorie);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      return res.status(500).json({ error: 'Error en la consulta' });
    }
    res.json(results); 
  });
});

app.get('/api/getTimers',(req,res)=>{
  db.query('select * from trackertiempo;',(err,results)=>{
    if(err) throw err;
    res.json(results);
  })
});

app.get('/api/getTotalTimeByCategory',(req,res)=>{
  db.query('SELECT tp.IdCategoria, c.nombre_categoria, SUM(tp.Duracion) AS TotalDuracion FROM trackerTiempo tp ' +
    ' LEFT JOIN categorias c ON c.categoria_id = tp.Idcategoria GROUP BY tp.IdCategoria, c.nombre_categoria;',(err,results)=>{
    if(err) throw err;
    res.json(results);
  })
});

app.post('/api/insert_tarea', (req, res) => {
  const { titulo, descripcion, fecha_inicio, categoria_id, estado } = req.body;

  const query = `INSERT INTO tareas (titulo, descripcion, fecha_inicio, categoria_id, estado)
  VALUES (?, ?, ?, ?, ?)`;

  db.execute(query, [titulo, descripcion, fecha_inicio, categoria_id, estado], (err, result) => {
    if (err) {
      console.error('Error al insertar la tarea:', err);
      res.status(500).json({ message: 'Error al guardar la tarea' });
    } else {
      res.status(201).json({ message: 'Tarea guardada exitosamente', id: result.insertId });
    }
  });
});

app.post('/api/actualizar_tarea', (req, res) => {
  const { titulo, descripcion, fecha_inicio, categoria_id, estado,id } = req.body;

  const query = `UPDATE tareas SET titulo = ?, descripcion = ?, fecha_inicio = ?, categoria_id = ?, estado = ?
  WHERE id=?;`;

  db.execute(query, [titulo, descripcion, fecha_inicio, categoria_id, estado,id], (err, result) => {
    if (err) {
      console.error('Error al actualizar la tarea:', err);
      res.status(500).json({ message: 'Error al guardar la tarea' });
    } else {
      res.status(201).json({ message: 'Tarea guardada exitosamente', id: result.insertId });
    }
  });
});

app.post('/api/eliminar',(req,res)=>{
  const { id } = req.body; 
  if (!id) {
    return res.status(400).json({ error: 'ID no proporcionado' });
  }

  const query = 'DELETE FROM tareas WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al eliminar la tarea' });
    }
    res.json(results);
  });
});

app.get('/api/deleteTimer',(req,res)=>{
  const { id } = req.query; 
  if (!id) {
    return res.status(400).json({ error: 'ID no proporcionado' });
  }
  const query = 'DELETE FROM trackerTiempo WHERE IdTracker = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al eliminar la tarea' });
    }
    res.json(results);
  });
});

app.post('/api/insertTime', (req, res) => {
  const { IdTarea, IdCategoria, Duration, Date } = req.body;

  const query = ' INSERT INTO TrackerTiempo (IdTarea, IdCategoria, Duracion, fecha) VALUES (?, ?, ?, ?);';

  db.query(query, [IdTarea, IdCategoria, Duration, Date], (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err); 
      return res.status(500).send({ message: 'Error al insertar datos', error: err });
    }
    res.status(200).send('Registro insertado con éxito');
  });
  
});

app.get('/api/getTimersForCurrentDay',(req,res) =>{
  const {search,categorie} = req.query;
  
  const joinType = categorie ? (categorie==="is null"? 'LEFT JOIN' : 'INNER JOIN') : 'LEFT JOIN';
  let query =`SELECT tp.IdTracker, t.titulo,c.nombre_categoria,tp.duracion,tp.fecha FROM trackertiempo tp 
    ${joinType}  tareas t on t.id = tp.IdTarea ${joinType} categorias c on c.categoria_id = t.categoria_id 
    WHERE fecha = curdate() `;
    const params = [];
    if (search) {
      query += ' AND (t.titulo LIKE ?)';
      params.push(`%${search}%`);
    }

    if (categorie){
      if(query == "is null")
        query += ' AND t.categoria_id  IS NULL';
      else
        query += ' AND t.categoria_id = ?';
      params.push(categorie);
    }

    db.query(query,params, (err, results) => {
      if(err) throw err;
      res.json(results);
    });
});

app.get('/api/getTimersForCurrentWeek',(req,res)=>{
  const {search,categorie} = req.query;
  const joinType = categorie ? (categorie==="is null"? 'LEFT JOIN' : 'INNER JOIN') : 'LEFT JOIN';
  let query = `SELECT tp.IdTracker, t.titulo,c.nombre_categoria,tp.duracion,tp.fecha FROM trackertiempo tp 
    ${joinType}   tareas t on t.id = tp.IdTarea ${joinType}  categorias c on c.categoria_id = t.categoria_id 
    WHERE WEEK(fecha,1) = WEEK(CURDATE(), 1) `;
  const params =[];

  if(search){
    query += ' AND (t.titulo LIKE ?) ';
    params.push(`%${search}%`);
  }
  if (categorie){
    if(categorie=="is null")
      query+= ' AND t.categoria_id IS NULL';
    else
      query += ' AND t.categoria_id = ?';
    params.push(categorie);
  }
  db.query(query,params,(err,results)=>{
      if(err) throw err;
      res.json(results);
    });
});

app.get('/api/getTimersForCurrentMonth',(req,res)=>{
  const {search,categorie} = req.query;
  const joinType = categorie ? (categorie==="is null"? 'LEFT JOIN' : 'INNER JOIN') : 'LEFT JOIN';
  let query =`SELECT tp.IdTracker, t.titulo,c.nombre_categoria,tp.duracion,tp.fecha FROM trackertiempo tp 
    ${joinType} tareas t on t.id = tp.IdTarea ${joinType} categorias c on c.categoria_id = t.categoria_id 
    WHERE MONTH(fecha) = MONTH(CURDATE()) `;
  const params = [];
  if(search){
    query += ' AND (t.titulo LIKE ?)';
    params.push(`%${search}%`);
  }
  if (categorie){
    if(categorie=="is null") 
      query +=' AND t.categoria_id IS NULL'
    else
      query += ' AND t.categoria_id = ?';
    params.push(categorie);
  }
  db.query(query,params,(err,results)=>{
      if(err) throw err;
      res.json(results);
  });
});

app.get('/api/getTimersForCurrentYear',(req,res)=>{
  const {search,categorie} = req.query;
  const joinType = categorie ? (categorie==="is null"? 'LEFT JOIN' : 'INNER JOIN') : 'LEFT JOIN';
  let query = `SELECT tp.IdTracker, t.titulo,c.nombre_categoria,tp.duracion,tp.fecha FROM trackertiempo tp 
    ${joinType}  tareas t on t.id = tp.IdTarea ${joinType} categorias c on c.categoria_id = t.categoria_id 
    WHERE YEAR(fecha) = YEAR(CURDATE()) `;
  const params = [];
  if(search){
    query += ' AND (t.titulo LIKE ?)';
    params.push(`%${search}%`);
  }
  
  if (categorie){
    if(categorie=="is null")
      query += ' AND t.categoria_id IS NULL';
    else
      query += ' AND t.categoria_id = ?';
    params.push(categorie);
  }

  db.query(query,params,(err,results)=>{
    if(err) throw err;
    res.json(results);
  })
});

app.get('/api/getAllTimers', (req, res) => {
  const { search, categorie } = req.query;

  const joinType = categorie ? (categorie==="is null"? 'LEFT JOIN' : 'INNER JOIN') : 'LEFT JOIN';
  let query = `SELECT tp.IdTracker, t.titulo, c.nombre_categoria, tp.duracion, tp.fecha FROM trackertiempo tp 
    ${joinType} tareas t ON t.id = tp.IdTarea ${joinType} categorias c ON c.categoria_id = t.categoria_id `;

  const params = [];
  if (search) {
    query += ' WHERE t.titulo LIKE ?';
    params.push(`%${search}%`);
  }

  if (categorie) {
    const condition = categorie === "is null"? "t.categoria_id IS NULL" : "t.categoria_id = ?";
    query += (search ? " AND " : " WHERE ") + condition;
    if (categorie !== "is null") {
      params.push(categorie);
    }
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      res.status(500).send('Error en la consulta');
      return;
    }
    res.json(results);
  });
});

app.get('/api/deleteCategory',(req,res) =>{
  const {categoria_id} = req.query;
  let query = 'DELETE FROM categorias where categoria_id = ?;';
  db.query(query,categoria_id,(err,results)=>{
    if(err) throw err;
    res.json(results);
  })
});

app.post('/api/addCategory', (req, res) => {
  const { nombre_categoria } = req.body;
  const query = 'INSERT INTO categorias (nombre_categoria) VALUES (?)';
  db.query(query, [nombre_categoria], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Categoría añadida correctamente' });
  });
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

 
