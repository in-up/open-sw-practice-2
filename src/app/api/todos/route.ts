import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const connectionConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

const createTodosTable = async (connection: mysql.Connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      text VARCHAR(255) NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT false
    )
  `);
};

export async function GET() {
  const connection = await mysql.createConnection(connectionConfig);
  await createTodosTable(connection);
  const [rows] = await connection.query('SELECT * FROM todos');
  await connection.end();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const connection = await mysql.createConnection(connectionConfig);
  await createTodosTable(connection);
  const { text } = await req.json();
  const [result] = await connection.query('INSERT INTO todos (text) VALUES (?)', [text]);
  await connection.end();
  return NextResponse.json({ id: (result as any).insertId, text });
}

export async function PUT(req: Request) {
  const { pathname } = new URL(req.url);
  const id = pathname.split('/').pop();

  const connection = await mysql.createConnection(connectionConfig);
  const { text, completed } = await req.json();

  try {
    await connection.query('UPDATE todos SET text = ?, completed = ? WHERE id = ?', [text, completed, id]);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json({ message: 'Error updating todo' }, { status: 500 });
  } finally {
    await connection.end();
  }

  return NextResponse.json({ id, text, completed });
}

export async function DELETE(req: Request) {
  const { pathname } = new URL(req.url);
  const id = pathname.split('/').pop();

  const connection = await mysql.createConnection(connectionConfig);
  
  try {
    await connection.query('DELETE FROM todos WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json({ message: 'Error deleting todo' }, { status: 500 });
  } finally {
    await connection.end();
  }

  return NextResponse.json({ message: 'Todo deleted successfully' });
}
