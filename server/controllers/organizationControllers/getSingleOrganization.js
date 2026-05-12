import db from "../../config/db.js";

export const getSingleOrganization = async (req, res) => {

    try {
        
        const {id} = req.params;

        const getOrganizationQuery = `SELECT * FROM organizations WHERE organization_id = ?;`;

        const result = await new Promise((resolve, reject) => {
            db.query(getOrganizationQuery, [id], (err, results) => {
                if(err){
                    console.log("Cannot able to get the Organization");
                    reject(err);
                }
                else{
                    console.log("Successfully get the Organization");
                    resolve(results);
                }
            });
        });

        if(result.length === 0){
            return res.status(400).send({
                success: false,
                message: "Organization not found with the given id"
            });
        }

        const organization = result[0];

        return res.status(200).send({
            success: true,
            message: "Organization fetched successfuly",
            organization: organization
        });

    } catch (error) {
        console.log("Error while fetching single organization: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal Server Error"
        });
    }

}