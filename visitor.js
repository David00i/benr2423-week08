const ObjectId = require("mongodb").ObjectId;

let visitors;

class Visitor {
	static async injectDB(conn) {
		visitors = await conn.db("my-database-name").collection("visitors")
	}

	static async getVisitor(visitorId) {
		return await visitors.findOne({ _id: new ObjectId(visitorId) })
	}
}

module.exports = Visitor;