import axios from "axios"
const baseUrl = '/api/persons'

const addPerson = (personObject) => {
  return axios.post(baseUrl, personObject).then(response => response.data)
}

const updatePerson = (id, personObject) => {
  return axios.put(`${baseUrl}/${id}`, personObject).then(response => response.data)
}

const getPersons = () => {
  return axios.get(baseUrl).then(response => response.data)
}

const deletePerson = (id) => {
  return axios.delete(`${baseUrl}/${id}`).then(response => response.data)
}

export {
    addPerson,
    getPersons,
    deletePerson,
    updatePerson
}
