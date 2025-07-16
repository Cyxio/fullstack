import { useEffect, useState } from 'react'
import { weatherCodes } from './codes'

const CountryList = ({ countries, onSelect }) => (
  <ul>
    {countries.map(country => (
      <li key={country.cca3}>
        {country.name.common}
        {onSelect && (
          <button onClick={() => onSelect(country.name.common)}>show</button>
        )}
      </li>
    ))}
  </ul>
)

const CountryDetails = ({ country, weather }) => (
  <div>
    <h2>{country.name.common}</h2>
    <div>Capital: {country.capital && country.capital.join(', ')}</div>
    <div>Area: {country.area}</div>
    <h3>Languages:</h3>
    <ul>
      {country.languages &&
        Object.values(country.languages).map(lang => (
          <li key={lang}>{lang}</li>
        ))}
    </ul>
    <h3>Weather in {country.capital && country.capital[0]}</h3>
    {weather ? (
      <div>
        <div>
          Weather: {weatherCodes[weather.current.weather_code][weather.current.is_day ? 'day' : 'night'].description}
        </div>
        <div>
          <img src={weatherCodes[weather.current.weather_code][weather.current.is_day ? 'day' : 'night'].image} alt="Weather icon" />
        </div>
        <div>Temperature: {weather.current.temperature_2m} °C</div>
        <div>Wind: {weather.current.wind_speed_10m} m/s</div>
        <div>Rain: {weather.current.rain} mm</div>
      </div>
    ) : (
      <div>No weather data available</div>
    )}
    <img src={country.flags.png} alt={`Flag of ${country.name.common}`} width="150" />
  </div>
)

function App() {
  const [query, setQuery] = useState('')
  const [countries, setCountries] = useState([])
  const [selected, setSelected] = useState(null)
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    if (query.trim() === '') {
      setCountries([])
      setSelected(null)
      return
    }
    fetch(`https://studies.cs.helsinki.fi/restcountries/api/all`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(c =>
          c.name.common.toLowerCase().includes(query.toLowerCase())
        )
        setCountries(filtered)
        if (filtered.length === 1) setSelected(filtered[0])
        else setSelected(null)
      })
  }, [query])

  useEffect(() => {
    if (selected) 
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${selected.latlng[0]}&longitude=${selected.latlng[1]}&current=temperature_2m,wind_speed_10m,rain,weather_code,is_day`)
        .then(res => res.json())
        .then(w => {
          setWeather(w)
      })
  }, [selected])

  return (
    <div>
      <div>
        find countries <input value={query} onChange={e => setQuery(e.target.value)} />
      </div>
      {countries.length > 10 && <div>Too many matches, specify another filter</div>}
      {countries.length > 1 && countries.length <= 10 && (
        <CountryList countries={countries} onSelect={name => setQuery(name)} />
      )}
      {selected && <CountryDetails country={selected} weather={weather} />}
    </div>
  )
}

export default App
