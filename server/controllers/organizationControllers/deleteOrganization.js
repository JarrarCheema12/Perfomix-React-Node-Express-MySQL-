import db from "../../config/db.js";
import jwt from 'jsonwebtoken';

export const deleteOrganization  = async (req, res) => {

    try {
        
        const {id} = req.params;

        if(!id){
            return res.status(400).send({
                success: false,
                message: "Organization ID required"
            });
        }

        // Check if the Authorization header exists
        let token = req.header("Authorization");
        if (!token) {
            return res.status(401).send({ message: "Authorization token is required" });
        }
        
        // Verify the token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        if (!userId) {
            return res.status(401).send({ message: "Invalid token" });
        }


        // Check if organization exist
        const checkOrganizationExist = `
            SELECT * FROM organizations WHERE organization_id = ?;
        `;
        const organizationExist = await new Promise((resolve, reject) => {
            db.query(checkOrganizationExist, [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });

        if (!organizationExist) {
            return res.status(404).send({
                success: false,
                message: "There is no such Organization Exist in the Database",
            });
        }


        // Check if the organization is created by the user
        const checkOrganizationCreatedUser = `
            SELECT * FROM organizations WHERE organization_id = ? AND created_by = ?;
        `;
        const org = await new Promise((resolve, reject) => {
            db.query(checkOrganizationCreatedUser, [id, userId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });

        if (!org) {
            return res.status(404).send({
                success: false,
                message: "You do not have permission to delete this Organization",
            });
        }

        const deleteOrganizationQuery = `DELETE FROM organizations WHERE organization_id = ?;`;

        await new Promise((resolve, reject) => {
            db.query(deleteOrganizationQuery, [id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results);
                }
            });
        });

        return res.status(200).send({
            success: true,
            message: "Organization Data has been deleted Successfully",
        });

    } catch (error) {
        console.log("Error while deleting organization: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }

}