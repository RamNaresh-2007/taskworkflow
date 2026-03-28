// App.jsx
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("start");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("worker");
  const [name, setName] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [workerId, setWorkerId] = useState("");

  // Load data from local storage when the app starts
  useEffect(() => {
    const savedTasks = localStorage.getItem("my_tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    const savedUsers = localStorage.getItem("my_users");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }

    const savedUser = localStorage.getItem("current_user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setView("dashboard");
    }
  }, []);

  // Save data to local storage when state changes
  useEffect(() => {
    localStorage.setItem("my_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("my_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("current_user");
    }
  }, [currentUser]);

  // Handle user registration
  const handleRegister = (e) => {
    e.preventDefault();
    const newUser = {
      id: Date.now().toString(),
      name: name,
      email: email,
      password: password,
      role: role
    };
    
    setUsers([...users, newUser]);
    alert("You are registered! Please login now.");
    setView("login");
  };

  // Handle user login
  const handleLogin = (e) => {
    e.preventDefault();
    
    let foundUser = null;
    for (let i = 0; i < users.length; i++) {
        if (users[i].email === email && users[i].password === password) {
            foundUser = users[i];
            break;
        }
    }

    if (foundUser !== null) {
      setCurrentUser(foundUser);
      setView("dashboard");
    } else {
      alert("Wrong email or password.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setView("start");
    setEmail("");
    setPassword("");
    setName("");
  };

  // Handle adding a task
  const addTask = (e) => {
    e.preventDefault();
    if (taskTitle === "") {
      alert("Title is required!");
      return;
    }
    
    const newTask = {
      id: Date.now().toString(),
      title: taskTitle,
      description: taskDesc,
      status: "Backlog",
      workerId: workerId
    };
    
    setTasks([...tasks, newTask]);
    setTaskTitle("");
    setTaskDesc("");
    setWorkerId("");
  };

  // Handle deleting a task
  const deleteTask = (id) => {
    const newTasks = tasks.filter(task => task.id !== id);
    setTasks(newTasks);
  };

  // Handle changing status
  const updateStatus = (id, newStatus) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, status: newStatus };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  // Filter tasks for workers
  let displayTasks = tasks;
  if (currentUser !== null && currentUser.role === "worker") {
    displayTasks = tasks.filter(task => task.workerId === currentUser.id);
  }

  return (
    <div className="app-container">
      <h1>Simple Task App</h1>

      {view === "start" && (
        <div className="buttons-block">
          <p>Please login or register to continue.</p>
          <button onClick={() => setView("login")}>Login</button>
          <button onClick={() => setView("register")}>Register</button>
        </div>
      )}

      {view === "register" && (
        <form onSubmit={handleRegister}>
          <h2>Register Account</h2>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="worker">Worker</option>
            <option value="admin">Admin</option>
          </select>
          
          <button type="submit">Sign Up</button>
          <button type="button" onClick={() => setView("start")}>Back</button>
        </form>
      )}

      {view === "login" && (
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          
          <button type="submit">Log In</button>
          <button type="button" onClick={() => setView("start")}>Back</button>
        </form>
      )}

      {view === "dashboard" && currentUser !== null && (
        <div>
          <div className="header-box">
             <h2>Welcome, {currentUser.name}! ({currentUser.role})</h2>
             <p>Your ID is: {currentUser.id}</p>
             <button className="logout-button" onClick={handleLogout}>Log Out</button>
          </div>

          {currentUser.role === "admin" && (
            <div className="admin-section">
                <h3>Admin controls: Create Task</h3>
                <form onSubmit={addTask}>
                <label>Task Title:</label>
                <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                
                <label>Description:</label>
                <input type="text" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
                
                <label>Assign to Worker (Worker ID):</label>
                <input type="text" value={workerId} onChange={(e) => setWorkerId(e.target.value)} />
                
                <button type="submit">Create New Task</button>
                </form>
            </div>
          )}

          <h3>Tasks List</h3>
          {displayTasks.length === 0 ? <p>You have no tasks right now.</p> : null}
          
          <ul className="tasks">
            {displayTasks.map(task => (
              <li key={task.id} className="task-card">
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <p><strong>Status:</strong> {task.status}</p>
                <p><strong>Worker ID:</strong> {task.workerId || "Not assigned"}</p>
                
                {currentUser.role === "admin" && (
                  <div className="task-actions">
                    <label>Change Status:</label>
                    <select value={task.status} onChange={(e) => updateStatus(task.id, e.target.value)}>
                      <option value="Backlog">Backlog</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                    <button className="delete-btn" onClick={() => deleteTask(task.id)}>Delete Task</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
