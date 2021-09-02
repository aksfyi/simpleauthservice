const mongoose = require("mongoose");
const { configs } = require("../configs");

const connectDB = async () => {
	const conn = await mongoose.connect(configs.MONGO_URI, {
		useNewUrlParser: true,
		//useCreateIndex: true,
		//	useFindAndModify: false,
		useUnifiedTopology: true,
	});

	console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = {
	connectDB,
};
