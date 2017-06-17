const proxyquire = require('proxyquire').noPreserveCache()
const sinon = require('sinon')
const assert = require('chai').assert
const faker = require('faker')

describe('userMiddleware', () => {
  let dbStub, fakeUserFromDb
  let fakeRequest, fakeResponse

  before(() => {
    fakeUserFromDb = {
      name: faker.internet.userName,
      email: faker.internet.email
    }
    dbStub = {
      findUserById: sinon.stub().returns(Promise.resolve(fakeUserFromDb))
    }

    fakeRequest = {
      params: {
        id: faker.random.number()
      }
    }
    fakeResponse = {}
  })

  describe('working with cache', () => {
    let cacheStub, mdl, fakeUserCache, fakeNext

    before(() => {
      fakeUserCache = {
        name: faker.internet.userName,
        email: faker.internet.email
      }

      cacheStub = {
        get: sinon.stub().returns(fakeUserCache)
      }

      fakeNext = sinon.spy()

      mdl = proxyquire('../src/middleware.js',
        {
          './cache': cacheStub,
          './db': dbStub
        }
      )
    })

    it('should take value from cache if it exists', () => {
      mdl.userMiddleware(fakeRequest, fakeResponse, fakeNext)

      sinon.assert.calledOnce(cacheStub.get)
      sinon.assert.calledWith(cacheStub.get, fakeRequest.params.id)
      sinon.assert.calledOnce(fakeNext)

      assert.equal(fakeResponse.body, fakeUserCache)
    })
  })

  describe('working with db', () => {
    let cacheStub, mdl

    before(() => {
      cacheStub = {
        get: sinon.stub().returns(null)
      }

      mdl = proxyquire('../src/middleware.js',
        {
          './cache': cacheStub,
          './db': dbStub
        }
      )
    })

    it('should take value from cache if it exists', (done) => {
      let fakeNext
      fakeNext = () => {
        sinon.assert.calledOnce(dbStub.findUserById)
        sinon.assert.calledWith(dbStub.findUserById, fakeRequest.params.id)
        assert.equal(fakeResponse.body, fakeUserFromDb)

        done()
      }

      mdl.userMiddleware(fakeRequest, fakeResponse, fakeNext)
    })
  })
})

