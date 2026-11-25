import React from 'react'

function LibraryCards({ bookInfo }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px', borderRadius: '5px', width: '200px', textAlign: 'center' }}>
      <div>{bookInfo.book}</div>
      <div>{bookInfo.price.toFixed(2)}</div>
      <div>{bookInfo.code}</div>
    </div>
  )
}

export default LibraryCards
