import qunit from 'qunit';
import nock from 'nock';
import ArenaRestApi from '../src/arena-api/arena';

qunit.module('Resolume Arena API');

qunit.test('get in use status when in use', async assert => {
  nock('https://1.2.3.4:5000')
    .get('/v2/configuration/system/status')
    .reply(200, {
      errorCode: "Ok",
      errorMessage: " ",
      currentUptime: 1809,
      totalUptime: 2291,
      firstUsed: "2022-02-02T10:49:50",
      inUse: true,
      sharing: false
    });

  let api = new ArenaRestApi('1.2.3.4', 5000);
  let result = await api.isInUse();
  assert.equal(result.inUse, true);
});

qunit.test('get in use status when not in use', async assert => {
  nock('https://1.2.3.4:5000')
    .get('/v2/configuration/system/status')
    .reply(200, {
      errorCode: "Ok",
      errorMessage: " ",
      currentUptime: 1809,
      totalUptime: 2291,
      firstUsed: "2022-02-02T10:49:50",
      inUse: false,
      sharing: false
    });

  let api = new ArenaRestApi('1.2.3.4', 5000);
  let result = await api.isInUse();
  assert.equal(result.inUse, false);
});

qunit.test('get in use status sends authentication', async assert => {
  nock('https://1.2.3.4:5000', {
    reqheaders: {
      authorization: 'Basic dXNlcjpwYXNz', // user:pass in base64
    },
  })
    .get('/v2/configuration/system/status')
    .reply(200, {
      errorCode: "Ok",
      errorMessage: " ",
      currentUptime: 1809,
      totalUptime: 2291,
      firstUsed: "2022-02-02T10:49:50",
      inUse: false,
      sharing: false
    });

  let api = new ArenaRestApi('1.2.3.4', 5000);
  let result = await api.isInUse();
  assert.equal(result.inUse, false);
});

// qunit.test('continues to poll when server times out', async assert => {
// });

// qunit.test('does not poll until subscription', async assert => {
// });

// qunit.test('stops polling after subscription', async assert => {
// });