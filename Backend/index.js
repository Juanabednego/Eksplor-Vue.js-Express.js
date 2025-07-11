import express from "express"

// Router
import authRouter from './routes/authRouter.js'
import lapanganRouter from './routes/lapanganRouter.js'
import pipaRouter from './routes/pipaRouter.js'

import cors from 'cors'


import dotenv from "dotenv"
import { notFound, errorHandler } from "./middleware/errorMiddleware.js"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import ExpressMongoSanitize from "express-mongo-sanitize"
import { v2 as cloudinary } from 'cloudinary';



const app = express()
const port = 3000


// Configuration
cloudinary.config({ 
      cloud_name: "de9cyaoqo", 
      api_key: 193388313656343, 
      api_secret: "qYF6EPlE381NVDneflc7AxHOtmk" // Click 'View API Keys' above to copy your API secret
});

//Middleware
app.use(helmet())
app.use(ExpressMongoSanitize())
app.use(express.json()) // agar request body bisa json
app.use(express.urlencoded({extended : true}))  // memasukkan inputan di urlencoded pada postman
app.use(cookieParser())
app.use(express.static('./public'))


app.use(cors())

app.use(cors({
  origin: 'http://localhost:9000', // sesuaikan dengan port frontend
  credentials: true
}))


dotenv.config()


app.use('/api/v1/auth', authRouter)
app.use('/api/v1/lapangan', lapanganRouter)
app.use('/api/v1/pipa', pipaRouter)




app.use(notFound)
app.use(errorHandler)



import mongoose from "mongoose";

// Gantilah dengan URI Atlas Anda
const uri = process.env.DATABASE;

async function connectToDatabase() {
  try {
    // Menghubungkan ke MongoDB Atlas menggunakan Mongoose
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Atlas!");

    // Memastikan koneksi berhasil dengan melakukan ping
    const admin = mongoose.connection.db.admin();
    await admin.ping();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    process.exit(1); // Keluar dari aplikasi jika koneksi gagal
  }
}

connectToDatabase(); // Jalankan fungsi koneksi


app.listen(port, () => console.log(`Server up and run at ${port} port`))

