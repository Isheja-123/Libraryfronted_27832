import React, { useState } from 'react'
import LibraryButton from './LibraryButton'

function LibraryLogin() {

   const [doYouHaveAnAccount, setDoYouHaveAnAccount] = useState(true);
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [studentId, setStudentId] = useState("");
   const [email, setEmail] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");

   function handleLogin() {
       alert(`Logging in as ${username}`);
   }

   function handleRegister() {
       if (password !== confirmPassword) {
           alert("Passwords do not match!");
           return;
       }
       alert(`Account created for ${studentId}!`);
       setDoYouHaveAnAccount(true);
   }

  return (
    <>
    { doYouHaveAnAccount ? (
                    <div style={{border:"3px solid blue", marginTop:"190px"}}>
                        <label>UserName:</label>
                        <input type="text" placeholder='Enter Your username' onChange={e => setUsername(e.target.value)}/><br/>
                        <label>Password:</label>
                        <input type="password" onChange={e => setPassword(e.target.value)}/><br/>
                        <LibraryButton buttonLabel="LOGIN" onClickButton={handleLogin}/> <br/>
                        <label>New here? </label> <LibraryButton buttonLabel="Create Account" onClickButton={() => setDoYouHaveAnAccount(false)}/>
                    </div>
    ):(
            <div style={{border:"3px solid indigo", marginTop:"190px"}}>
                <label>Student ID:</label>
                <input type="text" onChange={e => setStudentId(e.target.value)} placeholder='Enter Your Student ID'/><br/>
                <label>Email:</label>
                <input type="email" onChange={e => setEmail(e.target.value)}/><br/>
                <label>Password:</label>
                <input type="password" onChange={e => setPassword(e.target.value)}/><br/>
                <label>Confirm Password:</label>
                <input type="password" onChange={e => setConfirmPassword(e.target.value)}/><br/>
                <LibraryButton buttonLabel="REGISTER" onClickButton={handleRegister}/> <br/>
                 <label>Already have an account? </label> <LibraryButton buttonLabel="Sign In" onClickButton={() => setDoYouHaveAnAccount(true)}/>
            </div>
    )
     }
    </>
  )
}

export default LibraryLogin