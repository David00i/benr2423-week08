const MongoClient = require("mongodb").MongoClient;
const User = require("./user");
const Visitor = require("./visitor");

MongoClient.connect(
	// TODO: Connection 
	"mongodb+srv://m001-student:p4ssw-rd@sandbox.epk5x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", //"my-mongodb+srv-connection-string",
	{ useNewUrlParser: true },
).catch(err => {
	console.error(err.stack)
	process.exit(1)
}).then(async client => {
	console.log('Connected to MongoDB');
	User.injectDB(client);
	Visitor.injectDB(client);
})

const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'MyVMS API',
			version: '1.0.0',
		},
	},
	apis: ['./main.js'], // files containing annotations as above
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
	res.send('Hello World')
})

app.get('/hello', verifyToken, (req, res) => {
	res.send('Hello BENR2423')
})

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id: 
 *           type: string
 *         username: 
 *           type: string
 *         phone: 
 *           type: string
 */

/**
 * @swagger
 * /login:
 *   post:
 *     description: User Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               password: 
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid username or password
 */
app.post('/login', async (req, res) => {
	console.log(req.body);

	let user = await User.login(req.body.username, req.body.password);

	if (user.status == 'invalid username') {
		res.status(401).send("Invalid username or password");
		return
	}

	res.status(200).json({
		_id: user._id,
		username: user.username,
		phone: user.phone,
		role: user.role,
		token: generateAccessToken({
			_id: user._id,
			role: user.role
		})
	});
})

app.post('/register', async (req, res) => {
	console.log(req.body);

})

// Middleware Express for JWT
app.use(verifyToken);

/**
 * @swagger
 * /visitor/{id}:
 *   get:
 *     description: Get visitor by id
 *     parameters:
 *       - in: path
 *         name: id 
 *         schema: 
 *           type: string
 *         required: true
 *         description: visitor id
 */
app.get('/visitor/:id', async (req, res) => {
	console.log(req.user);

	if(req.user.role == 'user') {
		let visitor = await Visitor.getVisitor(req.params.id);

		if (visitor)
			res.status(200).json(visitor)
		else
			res.status(404).send("Invalid Visitor Id");
	} else {
		res.status(403).send('Unauthorized')
	}

})

app.get('/admin/only', async (req, res) => {
	console.log(req.user);

	if (req.user.role == 'admin')
		res.status(200).send('Admin only')
	else
		res.status(403).send('Unauthorized')
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})


const jwt = require('jsonwebtoken');
function generateAccessToken(payload) {
	return jwt.sign(payload, "my-super-secret", { expiresIn: '60s' });
}

function verifyToken(req, res, next) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (token == null) return res.sendStatus(401)

	jwt.verify(token, "my-super-secret", (err, user) => {
		console.log(err)

		if (err) return res.sendStatus(403)

		req.user = user

		next()
	})
}