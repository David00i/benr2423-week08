const bcrypt = require('bcrypt');

let users;

class User {
	static async injectDB(conn) {
		users = await conn.db("my-database-name").collection("users")
	}

	/**
	 * @remarks
	 * This method is not implemented yet. To register a new user, you need to call this method.
	 * 
	 * @param {*} username 
	 * @param {*} password 
	 * @param {*} phone 
	 */
	static async register(username, password, phone) {
		// TODO: Check if username exists
		const duplicate = await users.findOne({ username: username })
		
		if (duplicate) {
			return { status: "duplicate username" }
		}

		// TODO: Hash password
		const salt = await bcrypt.genSalt(10);
		const hashed = await bcrypt.hash(password, salt)

		// TODO: Save user to database
		return await users.insertOne({
			username: username,
			password: hashed,
			phone: phone,
		});
	}

	static async login(username, password) {
		// TODO: Check if username exists
		const user = await users.findOne({ username: username })

		if(!user) {
			return { status: "invalid username" }
		}

		// TODO: Validate password
		const valid = await bcrypt.compare(password, user.password)
		
		if(!valid) {
			return { status: "invalid password" }
		}

		// TODO: Return user object
		return user;
	}

	static async delete(username) {
		return users.deleteOne({username: username})
	}
}

module.exports = User;