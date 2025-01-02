// const express = require('express')
// const axios = require('axios')
// const bodyParser = require('body-parser')
// const cors = require('cors')
// // require('dotenv').config() // Load environment variables

// const app = express()
// app.use(bodyParser.json())
// app.use(cors())

// // Environment Variables (Replace in .env file or set manually)
// const BIRD_API_KEY = '2c1930bc-991f-4c5a-a617-35f1451282ba'
// const WORKSPACE_ID = 'f8f5bb9b-7243-48d8-9bcc-29b3792a27aa'
// const CHANNEL_ID = '367dbe7b-7e2b-5be1-a4c7-6327128b7b6b'

// app.post('/send-message', async (req, res) => {
//   console.log('Send message API hit')

//   const { email, message } = req.body

//   // Input Validation
//   if (!email || !message) {
//     return res.status(400).send({ error: 'Email and message are required.' })
//   }

//   try {
//     const response = await axios.get(
//       `https://email.messagebird.com/v1/channels/${CHANNEL_ID}`,
//       //   `https://api.birdapi.com/workspaces/${WORKSPACE_ID}/channels/${CHANNEL_ID}/messages`,
//       {
//         receiver: {
//           contacts: [
//             {
//               identifierKey: 'emailaddress',
//               identifierValue: email
//             }
//           ]
//         },
//         body: {
//           type: 'text',
//           text: {
//             text: message
//           }
//         }
//       },
//       {
//           headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `AccessKey 2c1930bc-991f-4c5a-a617-35f1451282ba`,
//           },
//           timeout: 10000 // Set a 10-second timeout

//         }
//     )

//     console.log('Message sent successfully:', response.data)
//     res.status(200).send(response.data)
//   } catch (error) {
//     console.error('Error sending message:', {
//       message: error.message,
//         response: error.response ? error.response.data : 'No response data',
//         error:error.response.data.errors[0]

      
//     })

//     res.status(500).send({ error: 'Failed to send message.' })
//   }
// })

// // Server Setup
// const PORT = process.env.PORT || 5000
// app.listen(PORT, () => {
//   console.log(`Backend server running on http://localhost:${PORT}`)
// })





















const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const messagebird = require('messagebird').initClient(
  '2c1930bc-991f-4c5a-a617-35f1451282ba'
)
console.log("messagebird",messagebird)

const app = express()
app.use(bodyParser.json())
app.use(cors())

const FROM_EMAIL = 'inbox@eafc6b28-4776-475e-b22f-5bc46248f8fd.us.incoming-email.us-west-2.api.bird.com ' // Replace with the verified sender email

app.post('/send-verification-email', async (req, res) => {
    console.log("api hiit hoooaaah")
  
    console.log('Send verification email API hit')
  const { to, subject, timeout } = req.body

  if (!to || !subject) {
    return res
      .status(400)
      .send({ error: 'Recipient email and subject are required.' })
  }

  const additionalParams = {
    subject: subject,
    template: 'Your security token: %token',
    timeout: timeout || 300 // Default timeout to 300 seconds
  }

  try {
    messagebird.verify.createWithEmail(
      FROM_EMAIL,
      to,
      additionalParams,
      (err, response) => {
        if (err) {
          console.error('Error sending email verification token:', err)
          return res
            .status(500)
            .send({
              error: err.message || 'Failed to send email verification token.'
            })
        }
        console.log('Verification token sent:', response)
        res.status(200).send(response)
      }
    )
  } catch (error) {
      console.log("kilo",error)
    console.error('Unexpected error:', error)
    res.status(500).send({ error: 'Unexpected error occurred.' })
  }
})

app.post('/validate-token', async (req, res) => {
  console.log('Validate token API hit')
  const { verifyId, token } = req.body

  if (!verifyId || !token) {
    return res.status(400).send({ error: 'verifyId and token are required.' })
  }

  try {
    messagebird.verify.verify(verifyId, token, (err, response) => {
      if (err) {
        console.error('Error validating token:', err)
        return res.status(400).send({ error: err.message || 'Invalid token.' })
      }
      console.log('Token validated:', response)
      res.status(200).send(response)
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).send({ error: 'Unexpected error occurred.' })
  }
})

app.get('/retrieve-email-message/:emailMessageId', async (req, res) => {
  const { emailMessageId } = req.params

  if (!emailMessageId) {
    return res.status(400).send({ error: 'Email message ID is required.' })
  }

  try {
    messagebird.verify.getVerifyEmailMessage(
      emailMessageId,
      (err, response) => {
        if (err) {
          console.error('Error retrieving email message:', err)
          return res
            .status(500)
            .send({ error: err.message || 'Failed to retrieve email message.' })
        }
        console.log('Retrieved email message:', response)
        res.status(200).send(response)
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).send({ error: 'Unexpected error occurred.' })
  }
})

app.listen(5000, () => {
  console.log('Backend server running on http://localhost:5000')
})
