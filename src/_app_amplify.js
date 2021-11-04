var express = require("express");
var bodyParser = require("body-parser");
var awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
require("dotenv").config();
var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
var AWS = require("aws-sdk");

// config {} from email
const config = {
  accessKeyId: "AKIARAGIPBV7NC4IHFW7",
  secretAccessKey: "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",
  region: "eu-west-1",
  adminEmail: "dpopescu@adelanto.fr",
};

// Email sending with SES = Amazon Very Simple email Service
var ses = new AWS.SES(config);

// declare a new express app
var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Authorization", `Bearer ${process.env.STRIPE_SECRET_KEY}`);
  next();
});

/****************************
 * Example post method *
 ****************************/
const chargeHandler = async (req, res, next) => {
  const { token } = req.body;
  const { currency, amount, description } = req.body.charge;
  try {
    const charge = await stripe.charges.create({
      source: token.id,
      amount: parseInt(amount, 10),
      currency,
      description,
    });
    if (charge.status === "succeeded") {
      req.charge = charge;
      req.description = description;
      req.email = req.body.email;
      next();
    }
    // res.json(charge);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const convertCentsToDollars = (price) => (price / 100).toFixed(2);

const emailHandler = (req, res) => {
  const {
    charge,
    description,
    email: { shipped, customerEmail, ownerEmail },
  } = req;

  ses.sendEmail(
    {
      Source: config.adminEmail,
      ReturnPath: config.adminEmail,
      Destination: {
        ToAddresses: [config.adminEmail],
      },
      Message: {
        Subject: {
          Data: "Order Details - AmplifyAgora",
        },
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<h3>Order Processed!</h3>
            <p><span style={{font-weight: bold}}>${description}</span> - $${convertCentsToDollars(
              charge.amount
            )}</p>
            <p>Customer email: <a href="mailto:${customerEmail}">${customerEmail}</a></p>
            <p>Contact your seller: <a href="mailto:${ownerEmail}">${ownerEmail}</a></p>
            ${
              shipped
                ? `<h4>Mailing Address: </h4>
              <p>${charge.source.name}</p>
              <p>${charge.source.address_line1}</p>
              <p>${charge.source.address_city}, ${
                    charge.source.address_state
                  } ${charge.source.address_zip}</p>
              `
                : "Emailed product"
            }
            <p style="font-style: italic; color: grey">
            ${
              shipped
                ? "Your product will be shipped in 2-3 days"
                : "Check your verified email for your emaild product"
            }</p>
            `,
          },
        },
      },
    },
    (err, data) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      res.json({
        message: "Order processed succesfully",
        charge,
        data,
      });
    }
  );
};

app.post("/charge", chargeHandler, emailHandler);

app.post("/charge/*", function(req, res) {
  // Add your code here
  res.json({ success: "post call succeed!", url: req.url, body: req.body });
});

/****************************
 * Example put method *
 ****************************/

// app.put('/charge', function(req, res) {
//   // Add your code here
//   res.json({success: 'put call succeed!', url: req.url, body: req.body})
// });

// app.put('/charge/*', function(req, res) {
//   // Add your code here
//   res.json({success: 'put call succeed!', url: req.url, body: req.body})
// });

/****************************
 * Example delete method *
 ****************************/

// app.delete('/charge', function(req, res) {
//   // Add your code here
//   res.json({success: 'delete call succeed!', url: req.url});
// });

// app.delete('/charge/*', function(req, res) {
//   // Add your code here
//   res.json({success: 'delete call succeed!', url: req.url});
// });

app.listen(3000, function() {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
