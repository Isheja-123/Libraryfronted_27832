import LibraryCards from './LibraryCards'

function LibraryBooks() {
  const books = [
    { code: '123', book: 'Biology', price: 100 },
    { code: '124', book: 'Chemistry', price: 150 },
    { code: '125', book: 'Physics', price: 200 },
  ]

  return (
    <div>
      <h2>List of Books</h2>
      {books.map((book) => (
        <LibraryCards key={book.code} bookInfo={book} />
      ))}
      <p>
        The total price for {books.length} books is $
        {books.reduce((total, book) => total + book.price, 0).toFixed(2)}.
      </p>
    </div>
  )
}

export default LibraryBooks
