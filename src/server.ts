import express from 'express';
import cors from 'cors';
import { getTestResults } from './utils';
import bodyParser from 'body-parser';
const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/kata/test', async (req, res) => {
	const { code, fixtures } = req.body;
	if (!code || !fixtures) {
		res.status(400).send({
			err: 'Must not be empty',
			type: 'SERVER_ERROR',
		});
		return;
	}
	try {
		const testResults = await getTestResults(code, fixtures);
		res.status(200).json(testResults);
	} catch (err) {
		res.status(200).json(err);
	}
});

const fixtures = `describe("Basic", () => {
	it("Basic tests", () => {
		assert.deepEqual(isPrime(1),  false);
		assert.deepEqual(isPrime(0),  false);
		assert.deepEqual(isPrime(2),  true);
		assert.deepEqual(isPrime(73), true);
		assert.deepEqual(isPrime(75), false);
		assert.deepEqual(isPrime(-1), false);
	});
	it("Test prime", () => {
		assert.deepEqual(isPrime(3),  true);
		assert.deepEqual(isPrime(5),  true);
		assert.deepEqual(isPrime(7),  true);
		assert.deepEqual(isPrime(41), true);
		assert.deepEqual(isPrime(5099), true);
	});
});
`;

app.post('/kata/attempt', async (req, res) => {
	const { code } = req.body;
	if (!code) {
		res.status(400).send({
			err: 'Must not be empty',
			type: 'SERVER_ERROR',
		});
		return;
	}
	try {
		const testResults = await getTestResults(code, fixtures);
		res.status(200).json(testResults);
	} catch (err) {
		res.status(200).json(err);
	}
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
