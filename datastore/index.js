const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
const fsReadPromise = Promise.promisify(fs.readFile);

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    let filepath = path.join(exports.dataDir, `${id}.txt`);
    fs.writeFile(filepath, text, (err) => {
      //check for errors
      if (err) {
        callback(err);
      } else {
        callback(null, {id: id, text: text});
      }
    });
  });

  
};

exports.readOne = (id, callback) => {
  //generate filepath based on id (like in create)
  let filepath = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(filepath, (err, data) => {
    if (err) {
      callback(err);
    } else {
      callback(null, {id: id, text: data.toString()});
    }
  });
};

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    let data = _.map(files, (file) => {
      let filename = path.basename(file, '.txt');
      let filepath = path.join(exports.dataDir, file);
      return fsReadPromise(filepath).then((content) => {
        return {id: filename, text: content.toString()}
      });
    });
    Promise.all(data).then((results) => callback(null, results));
  });
};

exports.update = (id, text, callback) => {
  let filepath = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(filepath, (err, data) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(filepath, text, (err) => {
        //check for errors
        if (err) {
          callback(err);
        } else {
          callback(null, {id: id, text: text});
        }
      });
    }
  })
  
};

exports.delete = (id, callback) => {
  let filepath = path.join(exports.dataDir, `${id}.txt`);
  fs.unlink(filepath, (err) => {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
