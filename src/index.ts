import express from 'express';
import cors from 'cors';
import pgPromise from 'pg-promise';

const app = express();
const port = 5001;

app.use(express.json());
app.use(cors());

interface Column {
  name: string;
  type: string;
}
interface Values {
  name: string;
  value: string;
}

app.post('/api/createTable', async (req, res) => {
  const { tableName, columns, dbName, dbPassword,primaryKey }: { tableName: string; columns: Column[],dbName:string,dbPassword:string,primaryKey:string } = req.body;

  // Validate inputs
  if (!tableName || !columns || columns.length === 0) {
    return res.status(400).json({ success: false, error: 'Invalid input' });
  }

  try {
    // Extract column names and types
    console.log(columns);
    console.log("tutaj loguje primary key",primaryKey);
    const columnDefinitions = columns.map((column) => `${column.name} ${column.type}`).join(', ');

    // Example with raw SQL (make sure to handle SQL injection properly)
   //const createTableQuery = `CREATE TABLE ${tableName} (${columnDefinitions} , PRIMARY KEY (${primaryKey}))`;
   const createTableQuery = `CREATE TABLE ${tableName} (${columnDefinitions}, PRIMARY KEY (${primaryKey}))`;

    //const createTableQuery = `CREATE TABLE ${tableName} (${columnDefinitions})`;
    console.log('createTableQuery:', createTableQuery);
    console.log('DBname and Pass:', dbName,' ',dbPassword);
    // Connect to the specified database
    const dbConnection = pgPromise()({
      // Your database options here, use known properties
      host: 'localhost',
      port: 5432,
      database: dbName,
      user: 'klaudiazalewska',
      password: dbPassword,
    });

    // Execute the query using the connected database
    await dbConnection.none(createTableQuery);

    res.json({ success: true });
  } catch (error) {
    console.error('Error creating table:', error as Error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


app.get('/api/getTableNames', async (req, res) => {
  try {
    const getTableQuery = 'SELECT table_name FROM information_schema.tables WHERE table_schema = $1';
    const dbConnection = pgPromise()({
      // Your database options here, use known properties
      host: 'localhost',
      port: 5432,
      database: 'mydatabase',
      user: 'klaudiazalewska',
      password: '',
    });

    const result = await dbConnection.query(getTableQuery, ['public']);
    console.log(result);
    res.json({ success: true, tableNames: result });
  } catch (error) {
    console.error('Error fetching table names:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/AddToTable', async (req, res) => {
  const { tableName, values }: { tableName: string; values: Values[] } = req.body;

  // Validate inputs
  if (!tableName || !values || values.length === 0) {
    return res.status(400).json({ success: false, error: 'Invalid input' });
  }

  try {
    // Extract column names and types
    console.log(values);
    const columnNames = Object.keys(values).join(', ');

    // Get the column values and ensure they are properly formatted as strings
    const columnValues = Object.values(values).join(', ');

    // Example with raw SQL (make sure to handle SQL injection properly)
    const createTableQuery = `INSERT INTO ${tableName} (${columnNames}) VALUES (${columnValues})`;
    console.log('createTableQuery:', createTableQuery);
    // Connect to the specified database
    const dbConnection = pgPromise()({
      // Your database options here, use known properties
      host: 'localhost',
      port: 5432,
      database: 'mydatabase',
      user: 'klaudiazalewska',
      password: '',
    });

    // Execute the query using the connected database
    await dbConnection.none(createTableQuery);

    res.json({ success: true });
  } catch (error) {
    console.error('Error creating table:', error as Error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.get('/api/readTable/:tableName', async (req, res) => {
  const { tableName } = req.params;

  try {
    const dbConnection = pgPromise()({
      // Your database options here, use known properties
      host: 'localhost',
      port: 5432,
      database: 'mydatabase',
      user: 'klaudiazalewska',
      password: '',
    });
    // Implement the logic to read data from the specified table
    const readTableQuery = `SELECT * FROM ${tableName}`;
    const tableData = await dbConnection.query(readTableQuery);
    console.log(tableData);
    res.json({ success: true, tableData });
  } catch (error) {
    console.error('Error reading table:', error);
    res.json({ success: false, error: 'Error reading table data' });
  }
});
app.get('/api/readColumns/:tableName', async (req, res) => {
  const { tableName } = req.params;
  const dbConnection = pgPromise()({
    // Your database options here, use known properties
    host: 'localhost',
    port: 5432,
    database: 'mydatabase',
    user: 'klaudiazalewska',
    password: '',
  });

  try {
// Fetch column names for a specific table (modify as needed)
const query = `SELECT column_name FROM information_schema.columns WHERE table_name='${tableName}'`;
console.log('Query:', query);
const columns = await dbConnection.query(query);
  console.log(columns);
  res.json({ success: true, columns: columns  });

  } catch (error) {
    console.error('Error fetching column names:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/deleteFromTable', async (req, res) => {
  try {
   
    const { tablename, rowData } = req.body;
    // Connect to the specified database
    const dbConnection = pgPromise()({
      // Your database options here, use known properties
      host: 'localhost',
      port: 5432,
      database: 'mydatabase',
      user: 'klaudiazalewska',
      password: '',
    });
    const conditions = Object.keys(rowData).map((key, index) => {
      return `${key} = $${index + 1}`;
    });

    const result = await dbConnection.none(
      `DELETE FROM ${tablename} WHERE ${conditions.join(' AND ')}`,
      Object.values(rowData)
    );
    console.log('Row deleted successfully:', result);
    res.json({ success: true, message: 'Row deleted successfully' });


  } catch (error) {
    console.error('Error deleting row from table:', error as Error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
