import mongoose from "mongoose"

const connectdb = async() =>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log('Mongodb connect',conn.connection.host);
    } catch (error) {
        console.error(error.message)
        process.exit(1)
    }
}

export default connectdb