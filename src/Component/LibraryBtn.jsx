import React from 'react'

function LibraryBtn({buttonLabel,onClickButton}) {

  return (
    <div>  <button onClick={onClickButton}>{buttonLabel}</button></div>
  )
}

export default LibraryBtn