import bcrypt from 'bcrypt'
import admin from '../module/admin.js'

let adminDao = {
    login: async function(body) {
        let promise = new Promise ( async ( res, rej ) => {
            let _id = body.email;
            let password = body.password;
            let userResult = await admin.find({ _id: _id });
            if (userResult[0]) {
                let hash = userResult[0].password;
                let result = await bcrypt.compare(password, hash);
                if (result) {
                    let data = {
                        email: userResult[0]._id,
                        name: userResult[0].name,
                        surname: userResult[0].surname
                    }
                    res( { "result" : "welcome", "value" : data } )
                } else {
                    rej( { error: "wrong password" } )
                }
            } else {
                rej( { error: "email doesn't exists" } )
            }
        })

        try {
            let result = await promise;
            return result;
        } catch (error) {
            return error;
        }
    },
    createAdmin: async function(body) {
        let promise = new Promise((res, rej) => {
            let saltRounds = Math.floor(Math.random() * 8) + 8;

            let _id = body.email;
            let name = body.name;
            let surname = body.surname;
            let password = body.password;

            bcrypt.hash(password, saltRounds).then(hash => {
                (new admin({
                    _id: _id,
                    name: name,
                    surname: surname,
                    password: hash,
                })).save()
                    .then(_ => {
                        let result = {
                            status: "success",
                        }
                        res(result);
                    })
                    .catch((error) => {
                        let result = {
                            status: "error",
                            value: error
                        }
                        rej(result);
                    });
            })
        })
        try {
            let result = await promise;
            return result;
        } catch (error) {
            return error;
        }
    },
}

export default adminDao;
