/**
 * Register Controller for listening to calls to create a new user
 * This will run basic checks to make sure all fields entered are compadible to the database and
 * client requirments as well
 * 
 * @version: 0.0.2
 */


//Import Database Connectors
const { PrismaClient } = require('@prisma/client');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime');

//Sets up the server to database communication client
const prisma = new PrismaClient();

//Sets up password encryption
const bcrypt = require('bcrypt');


/**
 * Checks for password to see if it matches the requirements
 * @param {String} password 
 */
function verifyPasswordRequirements(password){

    //Check password length, throws error if not met
    const passwordLength = password.length
    if(passwordLength < 7) {
        throw {code: 400, error: new Error(`Password does not meet requirement: Password is less than 8 characters.`)}
    };

    //TODO: Add more password checking requirments

}


/**
 * Checks for empty fields as these fields are required columns in database
 * Throws error if empty fields is found
 * @param {String} field_userEmail 
 * @param {String} field_password 
 * @param {String} field_firstName 
 * @param {String} field_lastName 
 */
function verifyFields(field_userEmail, field_password, field_firstName, field_lastName) {
    if(!field_userEmail || !field_password || !field_firstName || !field_lastName) {
        throw {code: 400, error: new Error("Missing field(s) detected: Please fill missing fields.")}
    }
}

/**
 * Encypts the password that will be stored on the database
 * @param {String} password 
 * @returns hashedPassword
 */
async function encryptPassword(password) {
    const hashedPassword =  await bcrypt.hash(password, 10);
    return hashedPassword;
}

/**
 * Adds the user to the database, assuming all pre checks are successful. Any common issues with the database 
 * will be thrown, any unknown issues will be logged and thrown as internal server error
 * Logging to be implemented later
 * @param {String} userEmail 
 * @param {String} hashedPassword 
 * @param {String} firstName 
 * @param {String} lastName 
 * @param {String} res 
 * @returns status
 */
async function addUserToDatabase(userEmail, hashedPassword, firstName, lastName, res) {
    
    //Set status to be true initially
    let status = true;

    //Store the information to the database
    await prisma.users.create({
        data: {
            f_name: firstName,
            l_name: lastName,
            email: userEmail,
            password: hashedPassword
        }
    })
    //Catch any error that is thrown from the database communication
    .catch((error) => {

        //If it is a common error, throw the error with helpful error message to front end
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                res.status(400).send({code: 400, message: "There is a unique constraint violation, a new user cannot be created with this email"})
            }

        //If the error is not normal, throw system error and log it    
        } else{
            //For any issues that somehow appear, will be linked to a logger eventually
        res.status(500).send({code: 500, message: "Server Error has occured: Contact Admin for logs"})
        }
        
        //Set the status to false
        status = false;
    }) 

    return status;
}


/**
 * Controller for handling new user registration
 * @param {*} req  
 * @param {*} res 
 */
const handleNewUser = async (req, res) => {
    
    //Get all form information from front end request call
    const {userEmail, password, firstName, lastName} = req.body;
    

    //Try to add new user 
    try{

        //Run checks 
        verifyFields(userEmail, password,firstName,lastName);
        verifyPasswordRequirements(password);
        
     


        //Encypt the password after successful basic requirement check
        encryptPassword(password)
            .then((result) => {

                //Try to add user to database after password encryption
                addUserToDatabase(userEmail, result, firstName,lastName, res)
                    .then((result)=> {

                        //If the status from adding the user is true, send a success response to front end
                        if(result) {
                            res.status(200).send({code: 200, message: `New user ${firstName} created using email ${userEmail}`}) 
                        }
                
            })

        })
 

    //Catches any errors thrown from basic requirment checks and sends error response to front end.
    } catch (result) {
            res.status(result.code).send({code: result.code, message:result.error.message})   
    }

}

module.exports = { handleNewUser };