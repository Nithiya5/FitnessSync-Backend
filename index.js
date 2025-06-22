const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config(); 
const videoRoutes = require('./routes/videoRoutes');
const dietRoutes = require('./routes/dietRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const userRoutes = require('./routes/userRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const traineeRoutes = require('./routes/traineeRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,            
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data

app.set("view engine", "ejs");

const PORT = 5000;

mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err=>console.log("MongoDB Connection error ",err));


app.use('/api/workouts', workoutRoutes);
app.use('/api/users',userRoutes);
app.use('/api/diets', dietRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/trainees', traineeRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
