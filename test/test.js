const crypto = require('crypto');
const _ = require('underscore');
const async = require('async');
const expect = require('expect');
const Client = require('./client');

const client = new Client(8124);
const verbose = true;

describe('Front backend test', function () {
  this.timeout(1000);
  it('should connect', done => {
    client.run(['coord'], (err, lines) => {
      expect(err).toNotExist();
      expect(lines).toEqual(['(15,15)']);

      done();
    });
  });

  it('should handle invalid commands', done => {
    client.run(['coord', 'invalid', 'coord'], (err, lines) => {
      expect(err).toNotExist();
      expect(lines).toEqual(['(15,15)', '(15,15)']);

      done();
    });
  });

  it('should render an empty canvas', done => {
    client.run(['render'], (err, lines) => {
      expect(err).toNotExist();
      expectLines(lines, '72659b4168414d6ab5d449f181b56753b379f148');

      done();
    });
  });

  it('should render a basic line', done => {
    client.run(['steps 5', 'render'], (err, lines) => {
      expect(err).toNotExist();
      expectLines(lines, '018d4292ddcce896b0a4782dd171753a483132f1');

      done();
    });
  });

  it('should render a basic shape', done => {
    client.run(['steps 5', 'right', 'steps 5', 'render'], (err, lines) => {
      expect(err).toNotExist();
      expectLines(lines, '6c49c61b763949ae12b1bfa2add1e349ac14fab5');

      done();
    });
  });

  it('should move around', done => {
    client.run(['steps 3', 'right 2', 'steps 5', 'right 2',
     'steps 6', 'right 2', 'steps 10', 'right 2', 'steps 6', 
     'right', 'steps 4', 'right', 'steps 6', 'render'], (err, lines) => {
      expect(err).toNotExist();
      expectLines(lines, 'b06ecafb43e0196d91e04b476413444b39e62058');

      done();
    });
  });

  it('should draw multiple shapes', done => {
    client.run([
      'hover', 'steps 3', 'left 2', 'steps 6', 'draw', 'right 3', 'steps 6', 'right 2', 'steps 12', 'right 3', 'steps 24',
      'right 3', 'steps 6', 'right', 'steps 12', 'right 3', 'steps 6', 'right 2', 'steps 6',
      'render'
    ], (err, lines) => {
      expect(err).toNotExist();
      expectLines(lines, '783ac177cb84439ea44e94c13baa2445c5805d0e');

      done();
    });
  });

  it('should draw multiple shapes concurrently', done => {
    async.parallel({
      shape1: next => client.run([
        'hover', 'left 2', 'steps 6', 'draw', 'right 3', 'steps 6', 'right 3', 'steps 12', 'render'
      ], next),

      shape2: next => client.run([
        'hover', 'left 2', 'steps 6', 'draw', 'right 2', 'steps 6', 'right 2', 'steps 10', 'left 5', 'steps 12', 'left 3', 'steps 14', 'render'
      ], next),

      shape3: next => client.run([
        'hover', 'steps 3', 'left', 'steps 6', 'draw', 'right 3', 'steps 12', 'right 3', 'steps 7', 'left 2', 'steps 7', 'right 3', 'steps 12', 'render'
      ], next)
    }, (err, results) => {
      expect(err).toNotExist();
      expectLines(results.shape1, '16f327e77a18b25ae991eed62496f2b43e67cd1d');
      expectLines(results.shape2, 'de583927919539393d54bb9bc566413c04672301');
      expectLines(results.shape3, '294c3e93b88e15ea3ea4e7462ce1b956328af42e');

      done();
    })
  });

});

function expectLines(lines, fingerprint) {
  if (verbose)
    console.log(lines.join('\n'));

  expect(sha1(lines)).toEqual(fingerprint);
}

function sha1(lines) {
  var shasum = crypto.createHash('sha1');
  shasum.update(lines.join('\n'));

  return shasum.digest('hex');
};