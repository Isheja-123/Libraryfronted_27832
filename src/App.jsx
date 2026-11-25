import { useState } from 'react'
import LibraryBooks from './Component/LibraryBooks'
import LibraryHeader from './Component/LibraryHeader'
import LibraryLogin from './Component/LibraryLogin'
import Office from './Component/Office'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('office')

  return (
    <main className="app-shell">
      <LibraryHeader activePage={activePage} onNavigate={setActivePage} />

      {activePage === 'office' && <Office />}
      {activePage === 'books' && <LibraryBooks />}
      {activePage === 'login' && <LibraryLogin />}
      {activePage === 'home' && (
        <section className="page-placeholder">
          <h2>Home</h2>
          <p>Select Books, Office, or Login from the menu above.</p>
        </section>
      )}
      {activePage === 'doctors' && (
        <section className="page-placeholder">
          <h2>Doctors</h2>
          <p>Doctors section coming soon.</p>
        </section>
      )}
    </main>
  )
}

export default App