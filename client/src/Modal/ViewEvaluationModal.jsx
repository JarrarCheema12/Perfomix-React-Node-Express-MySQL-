// ViewEvaluationModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { FaPlusCircle } from "react-icons/fa";
import AddEvaluationModal from "./AddEvaluationModal";

const ViewEvaluationModal = ({ isOpen, onClose, employeeData }) => {

  const [isEvaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [emData , setEmData]= useState([]);

  const handleAddEvaluation = (metric, param) => {
    const selectedParamData = {
      metric_id: metric.metric_id,
      parameter_id: param.parameter_id,
      parameter_name: param.parameter_name,

    };
    console.log('hey i am emplyee :' , employeeData);
    
  setEmData(employeeData); 
    setSelectedParameter(selectedParamData);
    setEvaluationModalOpen(true);  // Open AddEvaluationModal first
    
    setTimeout(() => {
      onClose();  // Close ViewEvaluationModal AFTER setting the state
    }, 200);  // Small delay ensures state updates correctly
  };
  

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5", borderBottom: "1px solid #ddd" }}>
          Employee Metrics
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: "500px", overflowY: "auto", p: 3 }}>
          {employeeData?.metrics?.length > 0 ? (
            employeeData.metrics.map((metric, index) => (
              <Box key={index} sx={{ border: "1px solid #ccc", borderRadius: 1, p: 2, mb: 2, backgroundColor: "#fff" }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                  Metric: {metric.metric_name || "Unnamed Metric"}
                </Typography>
                <List>
                  {metric.parameters?.map((param, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem
                        secondaryAction={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {param.weightage || param.evaluation || 0}%
                            </Typography>
                            <IconButton
                              color="primary"
                              onClick={() => handleAddEvaluation(metric, param)}
                              title="Add Evaluation"
                              sx={{ color: "#1976d2" }}
                            >
                              <FaPlusCircle />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemText primary={param.parameter_name || "Unnamed Parameter"} primaryTypographyProps={{ fontWeight: "medium" }} />
                      </ListItem>
                      {idx < metric.parameters.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No metrics available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#f5f5f5", borderTop: "1px solid #ddd" }}>
          <Button onClick={onClose} color="inherit" sx={{ textTransform: "none", fontWeight: "bold" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {isEvaluationModalOpen && selectedParameter && (

        <AddEvaluationModal
          isOpen={isEvaluationModalOpen}
          onClose={() => {
            setEvaluationModalOpen(false)
          
          }}
          employeeData={emData}
          parameterData={selectedParameter}
        />
      )}
    </>
  );
};

export default ViewEvaluationModal;
