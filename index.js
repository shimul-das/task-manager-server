const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors())
app.use(express.json())

// console.log(process.env.M_PASS)
//////////////////////
app.get('/', (req, res) => {
  res.send('Task Manager server is Running')
})



const {
  MongoClient,
  ServerApiVersion,
  ObjectId
} = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.6g3butq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();
    const Taskcollection = client.db('TasksDB').collection('tasks')

    // Route for adding a new task
    app.post('/post', async (req, res) => {
      const {
        title,
        description,
        status
      } = req.body;

      try {
        if (!title || !description || !status) {
          return res.status(400).json({
            error: 'Incomplete task information'
          });
        }

        // Create a new task document
        const newTask = {
          title: title,
          description: description,
          status: status,
        };

        // Insert the task document into the collection
        const result = await Taskcollection.insertOne(newTask);
        res.status(201).json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({
          error: 'Failed to add task'
        });
      }
    });

    app.get('/post', async (req, res) => {
      try {
        // Retrieve all tasks from the collection
        const tasks = await Taskcollection.find().toArray();
        res.status(200).json(tasks);
      } catch (error) {
        console.error(error);
        res.status(500).json({
          error: 'Failed to retrieve tasks'
        });
      }
    });

    app.delete('/post/:id', async (req, res) => {
      const taskId = req.params.id;

      if (!ObjectId.isValid(taskId)) {
        return res.status(400).json({
          error: 'Invalid task ID'
        });
      }

      try {
        const result = await Taskcollection.deleteOne({
          _id: new ObjectId(taskId)
        });

        if (result.deletedCount === 1) {
          res.status(200).json({
            message: 'Task deleted successfully'
          });
        } else {
          res.status(404).json({
            error: 'Task not found'
          });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({
          error: 'Failed to delete task'
        });
      }
    });
    app.put('/post/:taskId', async (req, res) => {
      try {
        const taskId = req.params.taskId;
        const updatedTask = await Taskcollection.findOneAndUpdate({
          _id: new ObjectId(taskId)
        }, {
          $set: {
            status: 'completed'
          }
        }, {
          new: true
        });
        res.status(200).json(updatedTask);
      } catch (error) {
        console.error(error);
        res.status(500).json({
          error: 'Failed to update task status'
        });
      }
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({
      ping: 1
    });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Task Manager Running on port ${port}`)

})