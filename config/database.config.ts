import mongoose from "mongoose";

const connect = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connect successfully!')
    }
    catch (err) {
        console.log('Connect failure!')
    }
}

export { connect }