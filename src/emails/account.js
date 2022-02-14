const mailgun = require("mailgun-js");


const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN })


const sendWelcomeEmail = (email, name) => {
    const data = {
        from: "Mailgun Sandbox <postmaster@sandbox2c3d144cbf6a47f5ae0fcecefe3eb347.mailgun.org>",
        to: email,
        subject: "Thanks for joining in!",
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    };

    mg.messages().send(data, function (error, body) {
        console.log(body);
    })
}


const sendGoodByeEmail = (email, name) => {
    const data = {
        from: "Mailgun Sandbox <postmaster@sandbox2c3d144cbf6a47f5ae0fcecefe3eb347.mailgun.org>",
        to: email,
        subject: "Sorry to see you go!",
        text: `We are sorry to see you go, ${name}. How can we make you come back?`
    };

    mg.messages().send(data, function (error, body) {
        console.log(body);
    })


}


module.exports = {
    sendWelcomeEmail,
    sendGoodByeEmail
}