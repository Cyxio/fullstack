import { useEffect, useState } from 'react'
import { addPerson, getPersons, deletePerson, updatePerson } from './Actions'
import './index.css'

const Filter = ({ filter, setFilter }) => {
  return (
    <div>
      filter shown with <input value={filter} onChange={(event) => setFilter(event.target.value)} />
    </div>
  )
}

const PersonForm = ({ newName, setNewName, newNumber, setNewNumber, handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit}>
      <div>
        name: <input value={newName} onChange={(event) => setNewName(event.target.value)} />
      </div>
      <div>
        number: <input value={newNumber} onChange={(event) => setNewNumber(event.target.value)} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ persons, filter, deleteMethod }) => {
  return (
    <ul>
      {persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase())).map((person, index) => (
        <li key={index}>{person.name} {person.number} <button onClick={() => deleteMethod(person.name, person.id)}>delete</button></li>
      ))}
    </ul>
  )
}

const App = () => {

  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const clearMessages = () => {
    setTimeout(() => {
      setError(null)
      setSuccess(null)
    }, 5000)
  }

  const handleSubmit = (event) => {
      event.preventDefault()
      const personObject = {
        name: newName,
        number: newNumber
      }
      if (persons.some(person => person.name === newName) && window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        updatePerson(persons.find(person => person.name === newName).id, personObject)
          .then(data => {
            setSuccess(`Updated ${data.name}`)
            clearMessages()
            setPersons(persons.map(person => person.id !== data.id ? person : data))
          }).catch(error => {
            setError(`Person validation failed: ${error.response.data.error}`)
            clearMessages()
          })
        setNewName('')
        setNewNumber('')
        return
      }

      addPerson(personObject).then(data => {
        setSuccess(`Added ${data.name}`)
        clearMessages()
        setPersons(persons.concat(data))
      }).catch(error => {
        setError(`Person validation failed: ${error.response.data.error}`)
        clearMessages()
      })
      setNewName('')
      setNewNumber('')
  }

  useEffect(() => {
    getPersons().then(data => {
      setPersons(data)
    })
  }, [])

  const deleteMethod = (name, id) => {
    if (window.confirm(`Delete ${name}?`)) {
      const updatedPersons = persons.filter(person => person.id !== id)
      deletePerson(id).then(() => {
        setSuccess(`Deleted ${name}`)
        clearMessages()
        setPersons(updatedPersons)
      }).catch(error => {
        setError(`Error deleting ${name}: ${error}`)
        clearMessages()
        setPersons(persons)
      })
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      {success && <div className="success">{success}</div>}
      {error && <div className="error">{error}</div>}
      <Filter filter={filter} setFilter={setFilter} />
      <h3>Add a new</h3>
      <PersonForm 
        newName={newName} 
        setNewName={setNewName} 
        newNumber={newNumber} 
        setNewNumber={setNewNumber} 
        handleSubmit={handleSubmit}
      />
      <h3>Numbers</h3>
      <Persons persons={persons} filter={filter} deleteMethod={deleteMethod} />
    </div>
  )

}

export default App