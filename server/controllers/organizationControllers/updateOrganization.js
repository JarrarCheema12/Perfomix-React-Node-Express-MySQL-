import db from "../../config/db.js";
import jwt from "jsonwebtoken";

export const updateOrganization = async (req, res) => {
    try {
        const { id } = req.params; // Organization ID
        const { organization_name, type, email, phone, address, webURL, start_date } = req.body;

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

        if (!id) {
            return res.status(400).send({
                success: false,
                message: "Organization ID is required to update organization details",
            });
        }

        // Check if the organization exists
        const checkOrganizationExistQuery = `
            SELECT * FROM organizations WHERE organization_id = ?;
        `;
        const organization = await new Promise((resolve, reject) => {
            db.query(checkOrganizationExistQuery, [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });

        if (!organization) {
            return res.status(404).send({
                success: false,
                message: "Organization not found",
            });
        }

        // Check if the organization is created by the user
        const checkOrganizationCreatedByUser = `
            SELECT * FROM organizations WHERE organization_id = ? AND created_by = ?;
        `;
        const org = await new Promise((resolve, reject) => {
            db.query(checkOrganizationCreatedByUser, [id, userId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });

        if (!org) {
            return res.status(403).send({
                success: false,
                message: "You do not have permission to update this organization",
            });
        }

        // Prepare dynamic query for updating
        const updateFields = [];
        const updateValues = [];

        if (organization_name) {
            updateFields.push("organization_name = ?");
            updateValues.push(organization_name);
        }
        if (type) {
            updateFields.push("type = ?");
            updateValues.push(type);
        }
        if (email) {
            updateFields.push("email = ?");
            updateValues.push(email);
        }
        if (phone) {
            updateFields.push("phone = ?");
            updateValues.push(phone);
        }
        // if (no_of_departments) {
        //     updateFields.push("no_of_departments = ?");
        //     updateValues.push(no_of_departments);
        // }
        // if (total_employees) {
        //     updateFields.push("total_employees = ?");
        //     updateValues.push(total_employees);
        // }
        if (address) {
            updateFields.push("address = ?");
            updateValues.push(address);
        }
        if (webURL) {
            updateFields.push("webURL = ?");
            updateValues.push(webURL);
        }
        if (start_date) {
            updateFields.push("start_date = ?");
            updateValues.push(start_date);
        }

        if (updateFields.length === 0) {
            return res.status(400).send({
                success: false,
                message: "No fields provided to update",
            });
        }

        const updateQuery = `
            UPDATE organizations
            SET ${updateFields.join(", ")}
            WHERE organization_id = ?;
        `;

        updateValues.push(id);

        await new Promise((resolve, reject) => {
            db.query(updateQuery, updateValues, (err, results) => {
                if (err) {
                    reject(err);
                } else if (results.affectedRows === 0) {
                    reject(new Error("No rows updated"));
                } else {
                    resolve();
                }
            });
        });

        return res.status(200).send({
            success: true,
            message: "Organization updated successfully",
        });
    } catch (error) {
        console.error("Error while updating organization: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
