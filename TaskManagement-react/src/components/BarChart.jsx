import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import axios from 'axios';
import { API_BASE_URL } from '/src/config.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = () => {
  const [chartData, setChartData] = useState(null);
  
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/tareasCondicion`).then((response) => {
      const data = response.data;
      
      const labels = [...new Set(data.map((item) => item.nombre_categoria))];
      const estados = [...new Set(data.map((item) => item.estado))];

      const datasets = estados.map((estado) => ({
        label: estado,
        data: labels.map((label) => {
          const item = data.find((item) => item.nombre_categoria === label && item.estado === estado);
          return item ? item.cantidad : 0;
        }),
        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
        tareaInfo: labels.map((label) => {
          const item = data.find((item) => item.nombre_categoria === label && item.estado === estado);
          return item ? item.nombre_categoria : ''; 
        }),
      }));

      setChartData({ labels, datasets });
    });
  }, []);

  if (!chartData) return <p>Cargando gráfica...</p>;

  return (
    <div className="barra">
      <Bar 
      data={chartData} 
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Categorías por Estado" },
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                const dataset = tooltipItem.dataset;
                const tareaInfo = dataset.tareaInfo[tooltipItem.dataIndex];
                return `${tareaInfo ? 'Tarea: ' + tareaInfo : 'Sin título'}`; // Mostrar el título de la tarea
              },
            },
          },
        },
      }} 
    />
    </div>
  );
};

export default BarChart;
