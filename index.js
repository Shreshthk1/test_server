/**
 * Backend server management for Universtiy Admission Tool
 * 
 * @version: 0.0.5
 */


//------------------------IMPORTS------------------------//
    
    //Used for creating api requests and responses
    const express = require("express");

    //Used for connecting to database
    const { PrismaClient } = require('@prisma/client');

    //Solves issue of local host erros on chrome [WILL BE EXPANDED ON]
    const cors = require("cors");


//------------------------CONSTANTS------------------------//

    //Sets up the api request/response handling
    const app = express();

    //Sets up the server to database communication client
    const prisma = new PrismaClient();

    //Sets port based on deployment environmnet
    const PORT = process.env.PORT || 3003;
 
//------------------------CONFIGS------------------------//

    //Sets the handler to use the cors policy [will be expanded]
    app.use(cors());

    app.use(express.json())
      


    

    

    //Default debugging only landing page
    app.get('/', (req, res) => {
        res.send("NOTHING ON THIS PAGE: DEBUGGIN PURPOSES => USE /API/ TO ACCESS")
    });

    //Starts the server listener
    app.listen(PORT, () => {
        console.log("Server Running...");
    })



    app.use('/api/registerUser', require('./routes/register'));
    app.use('/api/auth', require('./routes/auth'));


//------------------------DATABASE COMMUNICATION------------------------//

    /**
     * Will get programs based on filters, if no filter queries are present, all programs
     * are given
     * 
     * @TODO Add more filters
     * @param {INT} type 
     * @param {STRING} query 
     * @returns 
     */
    async function getPrograms(type, query) {

        //Initialize result
        let result;

        //Checks filter type
        switch (type) {
           
            //Filtering by univeristy name
            case 1:
                result = await prisma.programs.findMany({
                    where: {
                        university_name: query
                    }
                })
            break;
            
            //No filters present, spit out all
            default:
                result = await prisma.programs.findMany();
            break;
        }

        //Return database results [will need error handling]
        return result;
    }



//------------------------API CALLS------------------------//

    //Listen for programlist calls
    app.get("/api/programlist", (req, res) => {

        //Set programs
        let programs;

        //Get the query params
        let uniName = req.query.university


        //Checks for query
        if (uniName != null) {

            programs = getPrograms(1, uniName);

        } else{
            programs = getPrograms(null,null);
        }

        //Sends off the response to client
        programs.then((result) =>{
            res.send(result)
            
        })
    })


    