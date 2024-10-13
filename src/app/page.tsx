"use client"

import { useState, useEffect, ReactNode } from "react";
import { Check, Plus, Trash2 } from "lucide-react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

interface ButtonProps {
  onClick: () => void;
  className?: string;
  children: ReactNode;
}

const Input: React.FC<InputProps> = ({ type, placeholder, value, onChange, className }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${className}`}
  />
);

const Button: React.FC<ButtonProps> = ({ onClick, className, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-200 ${className}`}
  >
    {children}
  </button>
);

export default function Component() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    const fetchTodos = async () => {
      const response = await fetch("/api/todos");
      const data = await response.json();
      setTodos(data);
    };
    
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (newTodo.trim() !== "") {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newTodo }),
      });
      
      const newTodoItem = await response.json();
      setTodos([...todos, newTodoItem]);
      setNewTodo("");
    }
  };

  const toggleTodo = async (id: number) => {
    const todoToToggle = todos.find(todo => todo.id === id);
    if (todoToToggle) {
      const updatedTodo = { ...todoToToggle, completed: !todoToToggle.completed };
  
      await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });
  
      setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
    }
  };
  
  const removeTodo = async (id: number) => {
    await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });
  
    setTodos(todos.filter((todo) => todo.id !== id));
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-center mb-6">todotodo</h1>
          <div className="flex mb-4">
            <Input
              type="text"
              placeholder="작업을 추가하세요"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="flex-grow mr-2"
            />
            <Button
              onClick={addTodo}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center bg-gray-50 rounded-xl p-3 transition duration-200 hover:bg-gray-100"
              >
                <Button
                  onClick={() => toggleTodo(todo.id)}
                  className={`mr-3 p-1 ${
                    todo.completed ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <span
                  className={`flex-grow ${
                    todo.completed ? "line-through text-gray-400" : "text-gray-700"
                  }`}
                >
                  {todo.text}
                </span>
                <Button
                  onClick={() => removeTodo(todo.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
