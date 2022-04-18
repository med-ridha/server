import 'dotenv/config';
import './database/mongoose.js'
import './admin/main.js'
import express from 'express'
import userDao from './database/Dao/userDao.js'
import collabDao from './database/Dao/collabDao.js'

let app = express();
app.use(express.json());
let PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`app server listening on PORT ${PORT}`);
})

app.post("/checkEmail", async (req, res) => {
    let result = await userDao.checkEmail(req.body)
    if (result.result === "success") {
        res.status(200).json(result)
    } else {
        if (result.value.code === 401) {
            res.status(401).json(result);
        } else {
            res.status(400).json(result);
        }
    }
})

app.post("/newPassword", async (req, res) => {
    let result = await userDao.newPassword(req.body)
    if (result.result === "success") {
        res.status(200).json(result)
    } else {
        if (result.value.code === 401) {
            res.status(401).json(result);
        } else {
            res.status(400).json(result);
        }
    }
})

app.post("/updatePassword", async (req, res) => {
    let result = await userDao.updatePassword(req.body)
    if (result.result === "success") {
        res.status(200).json(result)
    } else {
        if (result.value.code === 4) {
            res.status(401).json(result);
        } else {
            res.status(400).json(result);
        }
    }
})

app.post("/verifyEmail", async (req, res) => {
    let result = await userDao.verifyEmail(req.body)
    if (result.result === "success") {
        res.status(200).json(result)
    } else {
        if (result.value.code === 11000) {
            res.status(401).json(result);
        } else {
            res.status(400).json(result);
        }
    }
})


app.post("/checkToken", async (req, res) => {
    let result = await userDao.login(req.body)
    if (result.result === "success") {
        let data = result.value;
        res.status(200).json(data);
    } else {
        if (result.value.code === 4) {
            res.status(401).json(result);
        } else {
            res.status(400).json(result);
        }
    }
})

app.post("/login", async (req, res) => {
    let result = await userDao.createLoginToken(req.body)
    if (result.result === "success") {
        res.status(200).json(result);
    } else {
        if (result.value.code === 401) {
            res.status(401).json(result);
        } else if (result.value.code === 402) {
            res.status(402).json(result);
        } else {
            res.status(400).json(result);
        }
    }
})


app.post("/createUser", async (req, res) => {
    let result = await userDao.createUser(req.body)
    console.log(result.value);
    if (result.result === "success") {
        res.status(200).json(result.value)
    } else {
        if (result.value.code === 4) {
            res.status(401).json(result);
        } else {
            res.status(400).json(result);
        }
    }
})

app.post("/updateUser", async (req, res) => {
    let result = await userDao.updateUser(req.body)
    if (result.result === "success") {
        res.status(200).json(result)
    } else {
        if (result.value.code === 4) {
            res.status(401).json(result);
        } else {
            res.status(400).json(result);
        }
    }
})

app.post("/addToCollab", async (req, res) => {
    let result = await collabDao.addToCollab(req.body)
    res.json(result);
})

app.post("/createCollab", async (req, res) => {
    let result = await collabDao.createCollab(req.body)
    res.json(result);
})

app.post("/createDocument", async (req, res) => {
    //create document 
    res.json({ "res": "ok" });
})
