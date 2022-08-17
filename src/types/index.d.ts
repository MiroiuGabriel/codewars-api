export type TestError = {
	name: string | undefined;
	actual: string;
	expected: string;
};

export type TestData = {
	title: string;
	timedOut: boolean;
	testTime: number | undefined;
	parentTitle: string | undefined;
	failed: boolean;
	err?: TestError;
};

export type Tests = {
	passed: number;
	failed: number;
	results: Array<TestData>;
};
