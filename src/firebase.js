
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyD7v-vrhAwmqkXqAIeE63cvxpT2qKERY1E",
  authDomain: "cloud-todo-app-6fb8c.firebaseapp.com",
  projectId: "cloud-todo-app-6fb8c",
  storageBucket: "cloud-todo-app-6fb8c.firebasestorage.app",
  messagingSenderId: "1039427634486",
  appId: "1:1039427634486:web:3678243b7e6ab9583f1f97",
  measurementId: "G-Q8P2YPECE8"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
