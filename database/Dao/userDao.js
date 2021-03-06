import bcrypt from 'bcrypt'
import notif from '../../firebase/service.js'
import user from '../module/user.js'
import tokenDao from '../Dao/tokenDao.js'
import documentDao from './documentDao.js';
import documents from '../module/document.js'
import collabDao from './collabDao.js';
import collab from '../module/collab.js'
import search from '../module/search.js'

let saltRounds = 9;

let userDao = {
  deleteCollab: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let emailToDelete = body.userToDelete;
      let thisUser = await user.findOne({ email: email });
      let userToDelete = await user.findOne({ email: emailToDelete })
      if (!thisUser || !userToDelete) {
        rej({
          result: "error",
          value: {
            code: 4,
            message: "not found"
          }
        })
        return;
      }

      let collabId = thisUser.collabId;
      await user.updateOne({ _id: userToDelete._id }, { $set: { collabId: null } })
      await collab.updateOne({ _id: collabId }, { $pull: { listUsers: emailToDelete } });
      res({ result: "success", value: { code: 0, message: "deleted from collab" } })
    })
    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },


  getCollabs: async function(email) {
    let promise = new Promise(async (res, rej) => {
      try {
        let userData = await user.findOne({ email: email });
        if (!userData) {
          rej({
            "result": "error",
            "value": {
              code: 404,
              message: "user not found"
            }
          })
          return;
        }
        let collabId = userData.collabId;
        if (collabId === null) {
          rej({
            "result": "error",
            "value": {
              code: 4,
              message: "no collabs"
            }
          })
          return;
        }
        let collab = await collabDao.getUserCollabs(collabId);
        if (collab.result === "success") {
          res({
            "result": "success",
            "value": {
              code: 0,
              message: {
                "collab": collab.value.message.collab,
                "listUsers": collab.value.message.listUsers,
              }
            }
          })
        } else {
          rej({
            "result": "error",
            "value": {
              code: 1,
              message: "error"
            }
          })

        }
      } catch (err) {
        console.log(err);
        rej({
          "result": "error",
          "value": err
        })
      }
    });

    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },


  check: async function(body) {
    let promise = new Promise(async (res, rej) => {
      try {
        let oneUser = await user.findOne({ email: body.email })
        if (!oneUser) {
          rej({
            "result": "error",
            "value": {
              "code": 404,
              "message": "user not found"
            }
          })
          return;
        } else {
          await user.updateOne({ email: body.email }, { $set: { notifId: body.notifId } })
        }
        res({
          "result": "success",
          "value": {
            "code": 0,
            "message": oneUser,
          }
        })

      } catch (error) {
        console.log(error)
        rej({
          "result": "error",
          "value": {
            "code": 500,
            "message": error
          }
        })
        return;
      }
    })
    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },

  findUser: async function(search) {
    let promise = new Promise(async (res, rej) => {
      try {
        let result = (await user.find({})).filter(x => x.name.includes(search) || x.surname.includes(search));
        res({
          "result": "success",
          "value": {
            "code": 0,
            "message": result
          }
        })
      } catch (error) {
        console.log(error)
        rej({
          "result": "error",
          "value": {
            "code": 500,
            "message": error
          }
        })
        return;
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },


  getUserFavorit: async function(email) {
    let promise = new Promise(async (res, rej) => {
      try {
        let oneUser = await user.findOne({ email: email });
        if (!oneUser) {
          rej({
            "result": "error",
            "value": {
              "code": 500,
              "message": err
            }
          })
          return;
        }
        let listFavored = oneUser.listfavored;
        let docFavored = await documents.find({ _id: { $in: listFavored } })
        res({
          "result": "success",
          "value": {
            "code": 0,
            "message": docFavored
          }
        })
      } catch (error) {
        rej({
          "result": "error",
          "value": {
            "code": 500,
            "message": error
          }
        })
        return;
      }
    })
    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },

  showFavored: async function(email) {
    let promise = new Promise(async (res, rej) => {
      try {
        let oneUser = await user.findOne({ email: email });
        if (!oneUser) {
          rej({
            "result": "error",
            "value": {
              "code": 404,
              "message": "user not found"
            }
          })
          return;
        }
        let listFavored = oneUser.listfavored;
        res({
          "result": "success",
          "value": {
            "code": 0,
            "message": listFavored
          }
        })

      } catch (error) {
        rej({
          "result": "error",
          "value": {
            "code": 500,
            "message": err
          }
        })
        return;
      }
    })
    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },

  getUser: async function(id) {
    let promise = new Promise(async (res, rej) => {
      try {
        let _user = await user.findOne({ _id: id });
        res({
          "result": "success",
          "value": {
            "code": 0,
            "message": _user
          }
        })
      } catch (err) {
        rej({
          "result": "error",
          "value": {
            "code": 500,
            "message": err
          }
        })
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },

  deleteUser: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let usertoDelete = await user.findOne({ _id: body.id })
      if (!usertoDelete) {
        rej({ result: "error", value: { code: 4, message: "user not found!" } })
        return;
      }
      if (usertoDelete.collabId) {
        await collab.updateOne({ _id: usertoDelete.collabId }, { $pull: { listUsers: usertoDelete.email } });
      }
      let result = await user.deleteOne({ _id: body.id })

      if (result.deletedCount > 0) {
        await notif.send({ title: "Compte", body: "Vous ne faites plus partis de JURIDOC", notifId: usertoDelete.notifId, type: 'delete' });
        res({ result: "success", value: { code: 0, message: "user deleted" } })
      } else {
        rej({ result: "error", value: { code: 4, message: "something went wrong" } })
      }
    })
    try {
      let result = await promise;
      return result;
    } catch (err) {
      console.log(err)
      return err;
    }
  },

  getAll: async function() {
    let promise = new Promise(async (res, rej) => {
      try {
        let users = await user.find({});
        res({
          "result": "success",
          "value": {
            "code": 0,
            "message": users
          }
        })
      } catch (err) {
        rej({
          "result": "error",
          "value": {
            "code": 500,
            "message": err
          }
        })
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },

  checkEmail: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let userResult = await user.findOne({ email: email })
      if (userResult) {
        let token = await tokenDao.createToken(email);
        try {
          res({
            "result": "success",
            "vaule": token
          });
        } catch (err) {
          rej({
            "result": "error",
            "value": error
          });
        }
      } else {
        rej({
          "result": "error",
          "value": {
            "code": 401,
            "message": "email doesn't exists"
          }
        });
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },
  newPassword: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let newPassword = body.newPassword;

      let userResult = await user.findOne({ email: email });
      if (userResult) {
        let hash = await bcrypt.hash(newPassword, saltRounds);
        let update = await user.updateOne({ email: email }, { password: hash });
        res({
          "result": "success",
          "value": update
        })
      } else {
        rej({
          "result": "error",
          "value": {
            code: 401,
            message: "email doesn't exists"
          }
        })
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },

  updatePassword: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let password = body.password;
      let newPassword = body.newPassword;
      try {
        let oldUser = await user.findOne({ email: email })
        let hash = oldUser.password;
        let auth = await bcrypt.compare(password, hash);
        if (auth) {
          let newHash = await bcrypt.hash(newPassword, saltRounds);
          let data = {
            password: newHash
          }
          let update = await user.updateOne({ email: email }, data);
          res({
            "result": "success",
            "value": update
          })
        } else {
          rej({
            "result": "error",
            "value": {
              "code": 4,
              "message": "wrong password"
            }
          })
        }
      } catch (err) {
        rej({
          "result": "error",
          "value": {
            "code": 2,
            "message": err
          }
        })
      }
    })
    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },

  updateUser: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let password = body.password;
      let newPassword = body.newPassword;
      try {
        let oldUser = await user.findOne({ email: email })
        if (!oldUser) { rej({ "result": "error", "value": { code: 4, message: "user not found" } }); return; }
        let hash = oldUser.password;
        let auth = await bcrypt.compare(password, hash);
        if (auth) {
          let newHash = undefined;
          if (newPassword) newHash = await bcrypt.hash(newPassword, saltRounds);
          let data = {
            name: body.name || oldUser.name,
            password: newHash || oldUser.password,
            surname: body.surname || oldUser.surname,
            numFiscal: body.numFiscal || oldUser.numFiscal,
            phoneNumber: body.phoneNumber || oldUser.phoneNumber,
            codeVoucher: body.codeVoucher || oldUser.coudeVoucher,
            nomStructure: body.nomStructure || oldUser.nomStructure,
            phoneStructure: body.phoneStructure || oldUser.phoneStructure,
            adressStructure: body.adressStructure || oldUser.adressStructure
          }
          await user.updateOne({ email: email }, data);
          let newUser = await user.findOne({ email: email });
          res({ "result": "success", "value": newUser })
        } else { rej({ "result": "error", "value": { "code": 4, "message": "wrong password" } }); return; }
      } catch (err) {
        console.log(err); rej({ "result": "error", "value": { "code": 2, "message": err } })
      }
    })
    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },

  createLoginToken: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let password = body.password;
      let userResult = await user.findOne({ email: email });
      if (userResult) {
        let hash = userResult.password;
        let result = await bcrypt.compare(password, hash);
        if (result) {
          let token = await tokenDao.createToken(email);
          res({
            "result": "success",
            "value": {
              "code": 200,
              "message": token
            }
          })
        } else {
          rej({
            "result": "error",
            "value": {
              code: 402,
              message: "wrong password"
            }
          })
        }
      } else {
        rej({
          "result": "error",
          "value": {
            code: 401,
            message: "email doesn't exists"
          }
        })
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },

  login: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let notifId = body.notifId;
      let userResult = await user.findOne({ email: email });
      if (userResult) {
        let r = await tokenDao.checkToken(body);
        if (r.result == "success") {
          if (notifId)
            await user.updateOne({ email: email }, { notifId: notifId });
          res({
            "result": "success",
            "value": userResult
          })
        } else {
          rej({
            "result": "error",
            "value": "invalid token"
          })
        }
      } else {
        rej({
          "result": "error",
          "value": "email doesn't exists"
        })
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },

  verifyEmail: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let userResult = await user.findOne({ email: email })
      if (!userResult) {
        try {
          let token = await tokenDao.createToken(email);
          res({
            "result": "success",
            "vaule": token
          });
        } catch (err) {
          rej({
            "result": "error",
            "value": error
          });
        }
      } else {
        rej({
          "result": "error",
          "value": {
            "code": 11000,
            "message": "email existe deja"
          }
        });
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },

  createUser: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let r = await tokenDao.checkToken(body);
      if (r.result === "success") {
        let password = body.password;
        bcrypt.hash(password, saltRounds).then(hash => {
          (new user({
            email: body.email,
            name: body.name,
            surname: body.surname,
            phoneNumber: body.phoneNumber,
            password: hash,
            nomStructure: body.nomStructure,
            phoneStructure: body.phoneStructure,
            numFiscal: body.numFiscal,
            adressStructure: body.adressStructure,
            notifId: body.notifId
          })).save().then(result => {
            res({ "result": "success", "value": result });
          }).catch((error) => {
            rej({ "result": "error", "value": error });
          });
        })
      } else { rej({ "result": "error", "value": { "code": 4, "message": "invalid token" } }) }
    })
    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },

  addDocToFav: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let docId = body.documentId;
      if (!docId || docId.length == 0) {
        rej({
          "result": "error",
          "value": {
            "code": 3,
            "message": "missing document Id"
          }
        })
        return;
      }
      try {
        let oneDocument = await documents.findOne({ _id: docId })
        if (!oneDocument) {
          rej({
            "result": "error",
            "value": {
              "code": 4,
              "message": "document not found"
            }
          })
          return;
        }
        let oneUser = await user.findOne({ email: email });
        if (!oneUser) {
          rej({
            "result": "error",
            "value": {
              "code": 4,
              "message": "user not found"
            }
          })
          return;
        }
        await user.updateOne({ email: email }, { $push: { listfavored: docId } })
        let updatedUser = await user.findOne({ email: email });
        res({
          "result": "success",
          value: {
            "code": 0,
            "message": updatedUser.listfavored
          }
        })
      } catch (error) {
        rej({
          "result": "error",
          "value": {
            "code": 5,
            "message": error
          }
        })
        return;
      }
    })
    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },

  deleteFavorite: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let docId = body.documentId;
      if (!docId || docId.length == 0) {
        rej({
          "result": "error",
          "value": {
            "code": 3,
            "message": "missing document Id"
          }
        })
        return;
      }
      try {
        let oneDocument = await documents.findOne({ _id: docId })
        if (!oneDocument) {
          rej({
            "result": "error",
            "value": {
              "code": 4,
              "message": "document not found"
            }
          })
          return;
        }
        let oneUser = await user.findOne({ email: email });
        if (!oneUser) {
          rej({
            "result": "error",
            "value": {
              "code": 4,
              "message": "user not found"
            }
          })
          return;
        }
        if (!oneUser.listfavored.includes(docId)) {
          rej({
            "result": "error",
            "value": {
              "code": 9,
              "message": "document is not favored"
            }
          })
          return;
        }
        await user.updateOne({ email: email }, { $pull: { listfavored: docId } })
        let updatedUser = await user.findOne({ email: email });
        res({
          "result": "success",
          value: {
            "code": 0,
            "message": updatedUser.listfavored
          }
        })
      } catch (error) {
        rej({
          "result": "error",
          "value": {
            "code": 5,
            "message": error
          }
        })
        return;
      }
    })
    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  }
}

export default userDao
