import db from '../../config/db.js';

export const getSingleMetric = async (req , res) => {

    try {
        
        

    } catch (error) {
        console.log("Error while fetching single performance metric: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}