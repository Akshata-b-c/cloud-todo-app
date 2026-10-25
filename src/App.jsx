import { useState, useEffect } from 'react'
import { auth } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import './App.css'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore'

import { db } from './firebase'
function App() {
  const [user, setUser] = useState(auth.currentUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(true)
  const [error, setError] = useState('')
  const [tasks, setTasks] = useState([])
  const [task, setTask] = useState('')
  
useEffect(() => {
  if (!user) {
    setTasks([])
    return
  }

  const tasksQuery = query(
    collection(db, 'tasks'),
    where('userId', '==', user.uid)
  )

  const unsubscribe = onSnapshot(
    tasksQuery,
    (snapshot) => {
      setTasks(
        snapshot.docs.map((taskDoc) => ({
          id: taskDoc.id,
          ...taskDoc.data()
        }))
      )
    },
    (error) => {
      console.error('Error loading tasks:', error)
    }
  )

  return unsubscribe
}, [user])

  async function handleAuth(e) {
    e.preventDefault()
    setError('')

    try {
      if (isSignup) {
        const result = await createUserWithEmailAndPassword(
          auth, email, password
        )
        setUser(result.user)
      } else {
        const result = await signInWithEmailAndPassword(
          auth, email, password
        )
        setUser(result.user)
      }
    } catch (err) {
      setError(err.message)
    }
  }
  async function handleGoogleSignIn() {
  setError('')

  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    setUser(result.user)
  } catch (err) {
    setError(err.message)
  }
}
  async function handleLogout() {
    await signOut(auth)
    setUser(null)
  }

  
async function addTask(e) {
  e.preventDefault()

  if (!task.trim() || !user) return

  try {
    await addDoc(collection(db, 'tasks'), {
      title: task.trim(),
      completed: false,
      userId: user.uid,
      createdAt: new Date()
    })

    setTask('')
  } catch (error) {
    console.error('Error saving task:', error)
    alert('Could not save task. Please check your Firebase settings.')
  }
}

async function toggleTask(id, currentCompleted) {
  try {
    await updateDoc(doc(db, 'tasks', id), {
      completed: !currentCompleted
    })
  } catch (error) {
    console.error('Error updating task:', error)
    alert('Could not update the task. Please try again.')
  }
}


  
async function deleteTask(id) {
  try {
    await deleteDoc(doc(db, 'tasks', id))
  } catch (error) {
    console.error('Error deleting task:', error)
    alert('Could not delete the task. Please try again.')
  }
}

async function editTask(id, currentTitle) {
  console.log('Editing task ID:', id)
  console.log('Current title:', currentTitle)

  const newTitle = prompt('Edit your task:', currentTitle)

  if (newTitle === null || newTitle.trim() === '') {
    return
  }

  if (!id) {
    console.error('Task ID is missing!')
    alert('Could not edit: task ID is missing.')
    return
  }

  try {
    await updateDoc(doc(db, 'tasks', id), {
      title: newTitle.trim()
    })
    console.log('Task updated successfully!')
  } catch (err) {
    console.error('Error editing task:', err)
    alert('Could not edit task. Check the browser Console for details.')
  }
}
  if (!user) {
    return (
      <main className="todo-container">
        <h1>{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
        <p className="subtitle">
          {isSignup ? 'Sign up to get started.' : 'Sign in to your account.'}
        </p>

        <form className="task-form auth-form" onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (at least 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <button type="submit">
            {isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <p className="subtitle">
          {isSignup ? 'Already registered?' : 'New here?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup)
              setError('')
            }}
          >
            {isSignup ? 'Sign In' : 'Create Account'}
          </button>
                       <button
  type="button"
  onClick={handleGoogleSignIn}
  className="google-button"
>
     Continue with Google
</button>
        </p>
        
  

      </main>
    )
  }

  return (
    <main className="todo-container">
      <h1>My To-Do List</h1>
      <p className="subtitle">Signed in as {user.email}</p>
      <button type="button" onClick={handleLogout}>Sign Out</button>

      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          placeholder="Enter a new task..."
          value={task}
          onChange={e => setTask(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      <ul className="task-list">
        {tasks.map(item => (
          <li key={item.id} className="task-item">
            <label>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleTask(item.id, item.completed)}
              />
              <span className={item.completed ? 'completed' : ''}>
                {item.title}
              </span>
            </label>
            <button
  onClick={() => editTask(item.id, item.title)}
>
  Edit
</button>
        
            <button
              type="button"
              className="delete-button"
              onClick={() => deleteTask(item.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <p className="empty-message">No tasks yet. Add your first task!</p>
      )}

      <p className="task-count">
        Total tasks: {tasks.length} | Completed: {
          tasks.filter(item => item.completed).length
        }
      </p>
    </main>
  )
}

export default App
