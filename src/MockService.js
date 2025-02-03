export default class MockService {
    constructor() {
      this.failureResponse = 'failure';
      this.successResponse = 'success';
    }

    async submit(record) {
      return new Promise(resolve => setTimeout(resolve, 1500)).then((result) =>
        {
          return (Math.random() < .6) ? 'success' : 'failure';
        }
      );
    }
  }