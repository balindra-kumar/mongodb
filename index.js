const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection URL
const connectionUrl = process.env.MONGODB_URL;

// Database and collection names
const dbName = "study";
const collectionName = "student";

// Function to connect to MongoDB and start the server
async function startServer() {
  try {
    const client = new MongoClient(connectionUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Database connection successful');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

    // Set up API endpoints
    setupApiEndpoints(collection);
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1); // Exit the process if database connection fails
  }
}

// Function to set up API endpoints
function setupApiEndpoints(collection) {
  // GET all users
  app.get('/api/getusers', async (req, res) => {
    try {
      const data = await collection.find().toArray();
      res.json(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST a new user
  app.post('/api/getusers', async (req, res) => {
    try {
      const saveData = await collection.insertOne(req.body);
      res.json({ message: 'Post is Submitted!', saveData: saveData });
    } catch (error) {
      console.error('Error saving user:', error);
      res.status(500).json({ message: 'Failed to save user' });
    }
  });

  // DELETE a user by ID
  app.delete('/api/getusers/:id', async (req, res) => {
    try {
      const removedItem = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.json(removedItem);
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
  });

  // PATCH/update a user by ID
  app.patch('/api/getusers/:id', async (req, res) => {
    try {
      const postId = new ObjectId(req.params.id);
      const updatePost = await collection.updateOne({ _id: postId }, { $set: req.body });
      res.json({ message: 'User updated successfully', updatePost: updatePost });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
  });

  // GET a single user by ID
  app.get('/api/getusers/:id', async (req, res) => {
    try {
      const singlePostId = new ObjectId(req.params.id);
      const fetchSinglePost = await collection.findOne({ _id: singlePostId });
      res.json({ message: 'User fetched successfully', user: fetchSinglePost });
    } catch (error) {
      console.error('Error fetching single user:', error);
      res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
  });
}

// Start the server
startServer();
