export const createApiClient = (getToken) => {
    const fetchWithAuth = async (url, options = {}) => {
        const token = await getToken();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        };
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    };

    return {
        getDashboardStats: () => fetchWithAuth('/api/dashboard'),
        getStudents: () => fetchWithAuth('/api/students'),
        createStudent: (data) => fetchWithAuth('/api/students', { method: 'POST', body: JSON.stringify(data) }),
        getCourses: () => fetchWithAuth('/api/courses'),
        createCourse: (data) => fetchWithAuth('/api/courses', { method: 'POST', body: JSON.stringify(data) }),
    };
};
