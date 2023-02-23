import { assert } from "console";

export class TestCase {
  [key: string]: any;
  public wasRun: number | undefined;
  public wasSetUp: number | undefined;
  public name: string;

  constructor(name: string) {
    this.name = name;
  }
  setUp() {}

  tearDown() {}

  run(result: TestResult) {
    result.testStarted();
    this.setUp();
    try {
      this[this.name]();
    } catch {
      result.testFailed();
    }
    this.tearDown();
    return result;
  }
}


export class WasRun extends TestCase {
  testMethod() {
    this.wasRun = 1;
    this.log += "testMethod ";
  }

  testBrokenMethod() {
    throw new Error();
  }

  setUp() {
    this.wasRun = undefined;
    this.wasSetUp = 1;
    this.log = "setUp ";
  }

  tearDown() {
    this.log += "tearDown "
  }
}

class TestResult {
  public runCount: number;
  public failureCount: number;

  constructor() {
    this.runCount = 0;
    this.failureCount = 0;
  }

  testStarted() {
    this.runCount++;
  }

  testFailed() {
    this.failureCount++;
  }

  summary() {
    return `${this.runCount} run, ${this.failureCount} failed`;
  }
}

class TestSuite {
  public tests: TestCase[];

  constructor() {
    this.tests= []
  }

  add(test: TestCase) {
    this.tests.push(test);
  }

  run(result: TestResult) {
    for(const test of this.tests) {
      test.run(result);
    }
    return result;
  }
}

class TestCaseTest extends TestCase{
  testTemplateMethod() {
    console.log("testTemplateMethod");
    const test = new WasRun("testMethod");
    test.run(new TestResult());
    assert(test.log == "setUp testMethod tearDown ")
  }

  testResult() {
    console.log("testResult");
    const test = new WasRun("testMethod");
    const result = test.run(new TestResult());
    assert("1 run, 0 failed" == result.summary())
  }

  testBrokenMethod() {
    console.log("testBrokenMethod");
    const test = new WasRun("testBrokenMethod");
    const result = test.run(new TestResult());
    assert("1 run, 1 failed" == result.summary());
  }

  testFailedResultFormatting() {
    console.log("testFailedResultFormatting");
    const result = new TestResult();
    result.testStarted();
    result.testFailed();
    assert("1 run, 1 failed" == result.summary());
  }

  testSuite() {
    console.log("testSuite")
    const suite = new TestSuite()
    suite.add(new WasRun("testMethod"));
    suite.add(new WasRun("testBrokenMethod"));
    let result = new TestResult();
    result = suite.run(result);
    assert("2 run, 1 failed" == result.summary());
  }
}

const suite = new TestSuite();
suite.add(new TestCaseTest("testTemplateMethod"));
suite.add(new TestCaseTest("testResult"));
suite.add(new TestCaseTest("testBrokenMethod"));
suite.add(new TestCaseTest("testFailedResultFormatting"));
suite.add(new TestCaseTest("testSuite"));
const result = new TestResult();
suite.run(result);
console.log(result.summary());