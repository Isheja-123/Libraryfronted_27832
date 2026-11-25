function LibraryHeader({ activePage, onNavigate }) {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'books', label: 'Books' },
    { id: 'office', label: 'Office' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'login', label: 'Login' },
  ]

  return (
    <header className="library-header">
      <h1>Library Management System</h1>
      <p>Manage your books and offices with ease</p>
      <nav className="library-nav" aria-label="Main navigation">
        {navItems.map((item, index) => (
          <span key={item.id}>
            {index > 0 && ' | '}
            <a
              href={`#${item.id}`}
              className={activePage === item.id ? 'library-nav__link library-nav__link--active' : 'library-nav__link'}
              onClick={(event) => {
                event.preventDefault()
                onNavigate(item.id)
              }}
            >
              {item.label}
            </a>
          </span>
        ))}
      </nav>
    </header>
  )
}

export default LibraryHeader
