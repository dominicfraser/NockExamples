const nock = require('nock');
const query = require('./userQueryHelper');
const defaultUser = require('./defaultUser');
const defaultOptions = require('../helpers/nock');

describe('userQueryHelper', () => {
  afterAll(nock.restore);
  afterEach(nock.cleanAll);

  it('should return a user (using fixtures - Promise syntax)', () => {
    nock.back.setMode('record');

    return nock
      .back('random-user-data-promise.json', defaultOptions)
      .then(({ nockDone }) =>
        query
          .getRandomUser()
          .then(res =>
            expect(res).toEqual(
              expect.objectContaining({
                results: [
                  {
                    cell: expect.any(String),
                    dob: expect.any(Object),
                    email: expect.any(String),
                    gender: expect.any(String),
                    id: expect.any(Object),
                    location: expect.any(Object),
                    login: expect.any(Object),
                    name: expect.any(Object),
                    nat: expect.any(String),
                    phone: expect.any(String),
                    picture: expect.any(Object),
                    registered: expect.any(Object),
                  },
                ],
              }),
            ),
          )
          .then(nockDone),
      )
      .then(() => nock.back.setMode('wild'));
  });

  it('should return a user (using fixtures - Async/Await syntax)', async () => {
    nock.back.setMode('record');
    const { nockDone } = await nock.back(
      'random-user-data-async.json',
      defaultOptions,
    );
    const userInfo = await query.getRandomUser();

    expect(userInfo).toEqual(
      expect.objectContaining({
        results: expect.any(Object),
      }),
    );

    nockDone();
    nock.back.setMode('wild');
  });

  it('should return a user', () => {
    nock('https://randomuser.me')
      .get('/api/')
      .reply(200, {
        results: [{ name: 'Dominic' }],
      });

    return query
      .getRandomUser()
      .then(res => res.results[0].name)
      .then(res => expect(res).toEqual('Dominic'));
  });

  it('should return a user of set nationality', () => {
    nock(/random/)
      .get(/nat=gb/)
      .reply(200, {
        results: [{ nat: 'GB' }],
      });

    return query
      .getRandomUserOfNationality('gb')
      .then(res => res.results[0].nat)
      .then(res => expect(res).toEqual('GB'));
  });

  it('should return a default user on 500', () => {
    nock(/randomuser/)
      .get(/api/)
      .reply(500);

    return query
      .getRandomUserGuarded()
      .then(res => expect(res).toMatchObject(defaultUser));
  });
});
