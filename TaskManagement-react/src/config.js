export const API_BASE_URL = 'http://localhost:3307';

export async function fetchData(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error('Error al obtener los datos');
    }
    return response.json();
}