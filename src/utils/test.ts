const Mocha = require('mocha');
import vm, { Context } from 'vm';
import { TestData, Tests } from '../types';

const context = { assert: require('assert') };
vm.createContext(context);

function pseudoFile(
	mocha: typeof Mocha,
	context: Context,
	fileContent: string
) {
	mocha.suite.emit('pre-require', context, ':memory:', mocha);
	mocha.suite.emit(
		'require',
		vm.runInNewContext(fileContent, context, { displayErrors: true }),
		':memory:',
		mocha
	);
	mocha.suite.emit('post-require', context, ':memory:', mocha);
}

const executeCode = (code: string) => {
	try {
		vm.runInContext(code, context);
	} catch (err: any) {
		throw {
			err: err.stack,
			type: 'STDERR',
		};
	}
};

const executeTests = (tests: string) =>
	new Promise<Tests>((resolve, reject) => {
		var mocha = new Mocha({ reporterOptions: {} });
		const testResults: Tests = {
			passed: 0,
			failed: 0,
			results: [],
		};
		try {
			pseudoFile(mocha, context, tests);
		} catch (err: any) {
			reject({
				type: 'STDERR',
				err: err.stack,
			});
			return;
		}
		const runner: Mocha.Runner = mocha.run();

		runner.on('fail', (test, err) => {
			testResults.failed++;
			const result: TestData = {
				title: test.title,
				parentTitle: test.parent?.title,
				timedOut: test.timedOut,
				testTime: test.duration,
				failed: true,
				err: {
					name: test.err?.name,
					actual: `${err.actual}`,
					expected: `${err.expected}`,
				},
			};
			testResults.results.push(result);
		});

		runner.on('pass', test => {
			testResults.passed++;
			const result: TestData = {
				title: test.title,
				timedOut: test.timedOut,
				testTime: test.duration,
				parentTitle: test.parent?.title,
				failed: false,
			};

			testResults.results.push(result);
		});

		runner.on('end', () => {
			resolve(testResults);
		});
	});

export const getTestResults = async (code: string, tests: string) => {
	executeCode(code);
	const testResults = await executeTests(tests);
	return testResults;
};
