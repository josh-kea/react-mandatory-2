require('dotenv').config()
const cors = require('cors');

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const { restart } = require('nodemon')

// Bcrypt for password hashing and dehashing
const bcrypt = require('bcrypt')
// Rate limiting
const rateLimiter = require("express-rate-limit");

app.use("/users", rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 15 // limit each IP to 100 request per windowMs
}))

app.use(express.json())
// middlewares - implement cors
app.use(cors());

// User creating users database
const users = []

app.get('/users', (req, res) => {
  res.json(users)
})

// Creating user with bcrypt hashed password
app.post('/users', async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const user = { name: req.body.name, password: hashedPassword }
      users.push(user)
      console.log(users)
      res.status(201).send()
    } catch {
      res.status(500).send()
    }
})

// Authentication below

let refreshTokens = []

app.post(('/token'), (req,res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })
        restart.json({ accessToken: accessToken })
    })

})

app.delete('/logout', (req,res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token )
    res.sendStatus(204)
})

// app.post('/login', (req,res) => {
//     // Authenticates User

//     const username = req.body.username
//     const user = { name: username}

//     const accessToken = generateAccessToken(user)
//     const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
//     refreshTokens.push(refreshToken)
//     res.json({ accessToken: accessToken, refreshToken: refreshToken })
// })

app.post('/users/login', async (req, res) => {
    const user = users.find(user => user.name === req.body.name)
    if (user == null) {
      return res.status(400).send('Cannot find user')
      //return res.send('User not found!')
    }
    try {
      if(await bcrypt.compare(req.body.password, user.password)) {

        // Generating accessToken & refreshToken if user is found.
        const accessToken = generateAccessToken(user)
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
        refreshTokens.push(refreshToken)
        // res.json({ accessToken: accessToken, refreshToken: refreshToken })
        
        res.status(200).json({
          message: 'User logged in!',
          accessToken: accessToken,
          refreshToken: refreshToken
        })

        sessionStorage.setItem('token', JSON.stringify(accessToken))
        sessionStorage.setItem('user', JSON.stringify(user.name))


      } else {
        res.status(400).json({
          error: 'Password incorrect!'
        })
      }
    } catch {
      // Generic catch-all response
      res.status(500).send('Lol')
    }
  })

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}

app.listen(4000)