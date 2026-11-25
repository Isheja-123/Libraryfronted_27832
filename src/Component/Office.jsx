import { useEffect, useState } from 'react'
import axios from 'axios'

const OFFICES_ENDPOINT = 'http://localhost:8080/api/offices'

function getErrorMessage(error) {
  const responseData = error?.response?.data

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData
  }

  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return responseData.message
  }

  return error instanceof Error ? error.message : 'Unknown error.'
}

function Office() {
  const [offices, setOffices] = useState([])
  const [officeName, setOfficeName] = useState('')
  const [officeNumber, setOfficeNumber] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [formAction, setFormAction] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function loadOffices() {
      setLoading(true)
      setError('')

      try {
        const response = await axios.get(`${OFFICES_ENDPOINT}/all`)
        if (!Array.isArray(response.data)) {
          throw new Error('The office service returned an invalid response.')
        }
        if (active) setOffices(response.data)
      } catch (requestError) {
        if (active) setError(`Could not load offices: ${getErrorMessage(requestError)}`)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadOffices()
    return () => {
      active = false
    }
  }, [reloadKey])

  async function saveOffice(event) {
    event.preventDefault()
    setFormMessage('')
    setFormError('')

    const trimmedName = officeName.trim()
    const trimmedNumber = officeNumber.trim()

    if (!trimmedName || !trimmedNumber) {
      setFormError('Office name and office number are required.')
      return
    }

    if (!/^-?\d+$/.test(trimmedNumber)) {
      setFormError('Office number must be a valid integer.')
      return
    }

    setFormAction('save')

    try {
      const response = await axios.post(`${OFFICES_ENDPOINT}/save`, {
        name: trimmedName,
        officeNumber: Number(trimmedNumber),
      })
      setFormMessage(
        typeof response.data === 'string' && response.data.trim()
          ? response.data
          : 'Office saved successfully.',
      )
      setOfficeName('')
      setOfficeNumber('')
      setReloadKey((key) => key + 1)
    } catch (requestError) {
      setFormError(`Could not save office: ${getErrorMessage(requestError)}`)
    } finally {
      setFormAction(null)
    }
  }

  async function deleteByOfficeNumber() {
    setFormMessage('')
    setFormError('')

    const trimmedNumber = officeNumber.trim()

    if (!trimmedNumber) {
      setFormError('Enter an office number to delete.')
      return
    }

    if (!/^-?\d+$/.test(trimmedNumber)) {
      setFormError('Office number must be a valid integer.')
      return
    }

    if (!window.confirm(`Delete Office ${trimmedNumber}?`)) {
      return
    }

    setFormAction('delete')

    try {
      const response = await axios.delete(
        `${OFFICES_ENDPOINT}/deleteByNumber/${encodeURIComponent(trimmedNumber)}`,
      )
      setFormMessage(
        typeof response.data === 'string' && response.data.trim()
          ? response.data
          : `Office ${trimmedNumber} deleted successfully.`,
      )
      setOfficeName('')
      setOfficeNumber('')
      setReloadKey((key) => key + 1)
    } catch (requestError) {
      setFormError(`Could not delete office ${trimmedNumber}: ${getErrorMessage(requestError)}`)
    } finally {
      setFormAction(null)
    }
  }

  async function deleteOffice(office) {
    if (!window.confirm(`Delete ${office.name} (Office ${office.officeNumber})?`)) {
      return
    }

    setDeletingId(office.id)
    setError('')

    try {
      await axios.delete(`${OFFICES_ENDPOINT}/delete/${encodeURIComponent(office.id)}`)
      setOffices((currentOffices) =>
        currentOffices.filter((currentOffice) => currentOffice.id !== office.id),
      )
    } catch (requestError) {
      setError(`Could not delete ${office.name}: ${getErrorMessage(requestError)}`)
    } finally {
      setDeletingId(null)
    }
  }

  const normalizedSearch = search.trim().toLowerCase()
  const filteredOffices = offices.filter((office) =>
    String(office.name ?? '').toLowerCase().includes(normalizedSearch) ||
    String(office.officeNumber ?? '').toLowerCase().includes(normalizedSearch),
  )

  const formBusy = formAction !== null || deletingId !== null

  return (
    <section className="office-directory" aria-labelledby="office-list-title">
      <div className="office-save">
        <h2>Save Office</h2>
        <form className="office-save__form" onSubmit={saveOffice}>
          <div className="office-save__field">
            <label htmlFor="office-name-input">Office Name :</label>
            <input
              id="office-name-input"
              type="text"
              value={officeName}
              onChange={(event) => setOfficeName(event.target.value)}
            />
          </div>
          <div className="office-save__field">
            <label htmlFor="office-number-input">Office Number :</label>
            <input
              id="office-number-input"
              type="number"
              value={officeNumber}
              onChange={(event) => setOfficeNumber(event.target.value)}
            />
          </div>
          <div className="office-save__actions">
            <button type="submit" disabled={formBusy}>
              {formAction === 'save' ? 'SAVING...' : 'SAVE'}
            </button>
            <button type="button" onClick={deleteByOfficeNumber} disabled={formBusy}>
              {formAction === 'delete' ? 'DELETING...' : 'DELETE'}
            </button>
          </div>
        </form>
        {formMessage && (
          <p className="office-save__message" role="status">
            {formMessage}
          </p>
        )}
        {formError && (
          <p className="office-error" role="alert">
            {formError}
          </p>
        )}
      </div>

      <h1 id="office-list-title">Available Offices</h1>

      <form
        className="office-search"
        onSubmit={(event) => {
          event.preventDefault()
          setSearch(searchInput)
        }}
      >
        <label className="visually-hidden" htmlFor="office-search">
          Search by office name or number
        </label>
        <input
          id="office-search"
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search by office name or number"
        />
        <button type="submit">Search</button>
      </form>

      {error && (
        <p className="office-error" role="alert">
          {error}{' '}
          {!loading && offices.length === 0 && (
            <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
              Try again
            </button>
          )}
        </p>
      )}

      <div className="office-table-scroll">
        <table className="office-table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Office Number</th>
              <th scope="col">Office Name</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="office-table__message" colSpan="4">Loading offices...</td>
              </tr>
            ) : error && offices.length === 0 ? (
              <tr>
                <td className="office-table__message" colSpan="4">Office list is unavailable.</td>
              </tr>
            ) : filteredOffices.length > 0 ? (
              filteredOffices.map((office, index) => (
                <tr key={office.id}>
                  <td>{index + 1}</td>
                  <td>{office.officeNumber}</td>
                  <td>{office.name}</td>
                  <td>
                    <div className="office-actions">
                      <button
                        className="office-button"
                        type="button"
                        onClick={() => deleteOffice(office)}
                        disabled={deletingId !== null || formAction !== null}
                      >
                        {deletingId === office.id ? 'Deleting...' : 'Delete'}
                      </button>
                      <button
                        className="office-button"
                        type="button"
                        disabled
                        title="Update will be available in a future lesson."
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="office-table__message" colSpan="4">
                  {offices.length === 0
                    ? 'No offices are available yet.'
                    : 'No offices match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Office
