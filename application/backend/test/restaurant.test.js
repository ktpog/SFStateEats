const expect = require("chai").expect;
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../gateway");
const Axios = require("axios");

chai.use(chaiHttp);

describe("Restaurant", () => {
  it("Gets all restaurants", () => {
    return Axios.get("http://3.12.102.223:3001/api/restaurant").then(result => {
      expect(result).to.have.status(200);
    });
  });

  it("Gets all restaurants", () => {
    return Axios.get("http://3.12.102.223:3001/api/restaurant").then(result => {
      expect(result).to.have.status(200);
    });
  });
});
