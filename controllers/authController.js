//Import Database Connectors
const { PrismaClient } = require('@prisma/client');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime');

//Sets up the server to database communication client
const prisma = new PrismaClient();

//Sets up password encryption
const bcrypt = require('bcrypt');



/**
 * Checks for empty fields as these fields are required columns in database
 * Throws error if empty fields is found
 * @param {String} field_userEmail 
 * @param {String} field_password 
 */
 function verifyFields(field_userEmail, field_password) {
    if(!field_userEmail || !field_password) {
        throw {code: 400, error: new Error("Missing field(s) detected: Please fill missing fields.")}
    }
}

async function checkIfUserExists(userEmail) {

    let user;

    await prisma.users.findUnique({
        where: {
            email: userEmail
        }
    }).then((result) => {
        
        if(result === null) {
            user = null;
        } else {
            user = result
        }
    })

    return user;
}

async function verifyPassword(inputPassword, userPassword) {
    const match = await bcrypt.compare(inputPassword, userPassword);

    return match
}


const handleLogin =  async (req, res) => {
    //Get all form information from front end request call
    const {userEmail, password} = req.body;

    

    try {

        

        verifyFields(userEmail,password);

        checkIfUserExists(userEmail).then((user) => {
            
            if(user === null) {
                res.status(401).send({code: 401, message: "User does not exist"})
            } else{

                verifyPassword(password, user.password).then((result) => {
                    if(result) {
                        res.status(200).send({code: 200, message: "Password verified for user"})
                    } else{
                        res.status(401).send({code: 401, message: "Unauthorized: Password is most likely incorrect."})
                    }
                })
            }
        })







    } catch (result) {
        res.status(result.code).send({code: result.code, message:result.error.message})
    }

}

module.exports = { handleLogin };