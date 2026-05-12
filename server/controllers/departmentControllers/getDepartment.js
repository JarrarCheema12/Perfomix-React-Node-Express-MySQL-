import db from '../../config/db.js';

export const getDepartment = async (req , res) => {

    try {
        
        const {dept_id} = req.params;

        if(!dept_id){
            return res.status(400).send({
                success: false,
                message: "Department Id is required"
            });
        }

        const getDepartmentQuery = `
            SELECT * FROM departments WHERE dept_id = ?;
        `;

        const department = await new Promise((resolve, reject) => {
            db.query(getDepartmentQuery, [dept_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!department){
            return res.status(400).send({
                success: false,
                message: "No such department exist in the Database"
            });
        }

        return res.status(200).send({
            success: true,
            message: "Department fetched successfully",
            department: department
        });

    } catch (error) {
        console.log("Error while fetching single department: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}